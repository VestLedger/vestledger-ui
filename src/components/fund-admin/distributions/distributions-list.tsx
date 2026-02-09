'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@/ui';
import { SearchToolbar, SectionHeader, StatusBadge } from '@/ui/composites';
import { AdvancedTable, type ColumnDef } from '@/components/data-table/advanced-table';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useUIKey } from '@/store/ui';
import {
  distributionsRequested,
  distributionsSelectors,
} from '@/store/slices/distributionSlice';
import { useFund } from '@/contexts/fund-context';
import type {
  Distribution,
  DistributionEventType,
  DistributionFilters,
  DistributionStatus,
} from '@/types/distribution';
import { formatCurrencyCompact, formatDate } from '@/utils/formatting';
import { distributionEventTypeLabels, getLabelForType } from '@/utils/styling/typeMappers';
import { CalendarDays, Files, Plus } from 'lucide-react';
import { ROUTE_PATHS, withRouteParams } from '@/config/routes';

type DistributionListUIState = {
  searchQuery: string;
  statusFilter: 'all' | DistributionStatus;
  eventTypeFilter: 'all' | DistributionEventType;
};

const STATUS_FILTERS: Array<{ id: DistributionListUIState['statusFilter']; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'pending-approval', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
];

const EVENT_TYPE_OPTIONS: Array<{ value: DistributionListUIState['eventTypeFilter']; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'exit', label: 'Exit' },
  { value: 'dividend', label: 'Dividend' },
  { value: 'recapitalization', label: 'Recap' },
  { value: 'refinancing', label: 'Refinancing' },
  { value: 'partial-exit', label: 'Partial Exit' },
  { value: 'other', label: 'Other' },
];

export function DistributionsList() {
  const router = useRouter();
  const { selectedFund, viewMode } = useFund();

  const { value: ui, patch: patchUI } = useUIKey<DistributionListUIState>(
    'fund-admin-distributions',
    {
      searchQuery: '',
      statusFilter: 'all',
      eventTypeFilter: 'all',
    }
  );

  const filters = useMemo<DistributionFilters>(() => {
    const status =
      ui.statusFilter === 'all' ? undefined : [ui.statusFilter as DistributionStatus];
    const eventType =
      ui.eventTypeFilter === 'all' ? undefined : [ui.eventTypeFilter as DistributionEventType];
    return {
      fundId: viewMode === 'individual' ? selectedFund?.id : undefined,
      status,
      eventType,
      searchQuery: ui.searchQuery.trim() || undefined,
    };
  }, [selectedFund?.id, ui.eventTypeFilter, ui.searchQuery, ui.statusFilter, viewMode]);

  const { data, isLoading, error, refetch } = useAsyncData(
    distributionsRequested,
    distributionsSelectors.selectState,
    {
      params: filters,
      dependencies: [
        filters.fundId,
        ui.statusFilter,
        ui.eventTypeFilter,
        ui.searchQuery,
      ],
    }
  );

  const distributions = useMemo(
    () => data?.distributions ?? [],
    [data?.distributions]
  );

  const columns = useMemo<ColumnDef<Distribution>[]>(() => [
    {
      key: 'name',
      label: 'Distribution',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-[var(--app-text-muted)]">
            {item.description || item.fundName}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status} domain="fund-admin" size="sm" showIcon />
      ),
    },
    {
      key: 'eventType',
      label: 'Type',
      sortable: true,
      render: (item) => (
        <Badge size="sm" variant="flat">
          {getLabelForType(distributionEventTypeLabels, item.eventType)}
        </Badge>
      ),
    },
    {
      key: 'eventDate',
      label: 'Event Date',
      sortable: true,
      render: (item) => formatDate(item.eventDate),
    },
    {
      key: 'grossProceeds',
      label: 'Gross Proceeds',
      sortable: true,
      align: 'right',
      render: (item) => formatCurrencyCompact(item.grossProceeds),
    },
    {
      key: 'netProceeds',
      label: 'Net Proceeds',
      sortable: true,
      align: 'right',
      render: (item) => formatCurrencyCompact(item.netProceeds),
    },
    {
      key: 'totalDistributed',
      label: 'Distributed',
      sortable: true,
      align: 'right',
      render: (item) => formatCurrencyCompact(item.totalDistributed),
    },
  ], []);

  const selectedFundLabel = selectedFund?.displayName ?? 'All Funds';

  return (
    <Card padding="lg">
      <SectionHeader
        title="Distributions"
        description="Track distributions, approvals, and LP allocations across funds."
        action={(
          <>
            <Badge size="sm" variant="flat">
              {selectedFundLabel}
            </Badge>
            <Button
              size="sm"
              variant="bordered"
              startContent={<CalendarDays className="h-4 w-4" />}
              onPress={() => router.push(ROUTE_PATHS.fundAdminDistributionsCalendar)}
            >
              Calendar
            </Button>
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => router.push(ROUTE_PATHS.fundAdminDistributionsNew)}
            >
              New Distribution
            </Button>
          </>
        )}
        className="mb-4"
      />

      <SearchToolbar
        searchValue={ui.searchQuery}
        onSearchChange={(value) => patchUI({ searchQuery: value })}
        searchPlaceholder="Search distributions..."
        filters={STATUS_FILTERS}
        activeFilterId={ui.statusFilter}
        onFilterChange={(id) => patchUI({ statusFilter: id as DistributionListUIState['statusFilter'] })}
        dropdown={{
          label: 'Type',
          selectedValue: ui.eventTypeFilter,
          onChange: (value) => patchUI({ eventTypeFilter: value as DistributionListUIState['eventTypeFilter'] }),
          options: EVENT_TYPE_OPTIONS,
        }}
      />

      <div className="mt-4">
        <AsyncStateRenderer
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyIcon={Files}
          emptyTitle="No distributions created"
          emptyAction={{
            label: "Create Distribution",
            onClick: () => router.push(ROUTE_PATHS.fundAdminDistributionsNew),
          }}
          isEmpty={(value) => !value?.distributions?.length}
        >
          {() => (
            <AdvancedTable
              stateKey={`distributions-${selectedFund?.id ?? 'all'}`}
              data={distributions}
              columns={columns}
              searchable={false}
              exportable={false}
              pageSize={8}
              searchKeys={['name', 'fundName', 'description', 'waterfallScenarioName']}
              onRowClick={(item) =>
                router.push(
                  withRouteParams(ROUTE_PATHS.fundAdminDistributionDetail, { id: item.id })
                )
              }
            />
          )}
        </AsyncStateRenderer>
      </div>
    </Card>
  );
}
