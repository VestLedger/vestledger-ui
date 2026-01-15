'use client';

import { useCallback, useMemo } from 'react';
import { Badge, Button, Checkbox, Input } from '@/ui';
import { AdvancedTable, type ColumnDef } from '@/components/data-table/advanced-table';
import type { LPAllocation } from '@/types/distribution';
import { formatCurrencyCompact } from '@/utils/formatting';
import { getAllocationIssues } from '@/lib/validation/distribution';
import { Download, RefreshCcw } from 'lucide-react';

export interface LPAllocationTableProps {
  allocations: LPAllocation[];
  onChange: (allocations: LPAllocation[]) => void;
  onRecalculate?: () => void;
  comparisonMap?: Record<string, number>;
  showComparison?: boolean;
}

const DEFAULT_PAGE_SIZE = 8;

export function LPAllocationTable({
  allocations,
  onChange,
  onRecalculate,
  comparisonMap,
  showComparison = false,
}: LPAllocationTableProps) {
  const handleUpdate = useCallback(
    (id: string, patch: Partial<LPAllocation>) => {
      onChange(
        allocations.map((allocation) =>
          allocation.id === id
            ? { ...allocation, ...patch, updatedAt: new Date().toISOString() }
            : allocation
        )
      );
    },
    [allocations, onChange]
  );

  const columns = useMemo<ColumnDef<LPAllocation>[]>(() => {
    const base: ColumnDef<LPAllocation>[] = [
      {
        key: 'lpName',
        label: 'LP',
        sortable: true,
        render: (item) => (
          <div>
            <div className="font-medium">{item.lpName}</div>
            <div className="text-xs text-[var(--app-text-muted)]">{item.investorClassName}</div>
          </div>
        ),
      },
      {
        key: 'proRataPercentage',
        label: 'Pro-Rata',
        sortable: true,
        align: 'right',
        render: (item) => `${item.proRataPercentage.toFixed(2)}%`,
      },
      {
        key: 'grossAmount',
        label: 'Gross',
        sortable: true,
        align: 'right',
        render: (item) => (
          <Input
            type="number"
            value={item.grossAmount.toString()}
            onChange={(event) =>
              handleUpdate(item.id, { grossAmount: Number(event.target.value) || 0 })
            }
          />
        ),
      },
      {
        key: 'netAmount',
        label: 'Net',
        sortable: true,
        align: 'right',
        render: (item) => (
          <Input
            type="number"
            value={item.netAmount.toString()}
            onChange={(event) =>
              handleUpdate(item.id, { netAmount: Number(event.target.value) || 0 })
            }
          />
        ),
      },
      {
        key: 'hasSpecialTerms',
        label: 'Special Terms',
        sortable: false,
        render: (item) => (
          <Checkbox
            isSelected={item.hasSpecialTerms}
            onValueChange={(value) => handleUpdate(item.id, { hasSpecialTerms: value })}
          >
            {item.hasSpecialTerms ? 'Yes' : 'No'}
          </Checkbox>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        render: (item) => {
          const issues = getAllocationIssues(item);
          const hasIssues = issues.length > 0;
          return (
            <Badge
              size="sm"
              variant="flat"
              color={hasIssues ? 'warning' : 'success'}
              title={hasIssues ? issues.join(' ') : 'Allocation is balanced.'}
            >
              {hasIssues ? 'Needs Review' : 'Ready'}
            </Badge>
          );
        },
      },
    ];

    if (showComparison) {
      base.splice(3, 0, {
        key: 'previous',
        label: 'Previous',
        sortable: false,
        align: 'right',
        render: (item) => formatCurrencyCompact(comparisonMap?.[item.lpId] ?? 0),
      });
    }

    return base;
  }, [comparisonMap, handleUpdate, showComparison]);

  const toolbarStart = (
    <>
      {onRecalculate && (
        <Button
          size="sm"
          variant="bordered"
          startContent={<RefreshCcw className="h-4 w-4" />}
          onPress={onRecalculate}
        >
          Recalculate
        </Button>
      )}
      <Button
        size="sm"
        variant="bordered"
        startContent={<Download className="h-4 w-4" />}
        isDisabled
      >
        Export
      </Button>
    </>
  );

  return (
    <AdvancedTable
      stateKey="lp-allocations"
      data={allocations}
      columns={columns}
      searchable
      searchPlaceholder="Search LPs..."
      searchKeys={['lpName', 'investorClassName', 'taxJurisdiction']}
      exportable={false}
      showColumnToggle={false}
      pageSize={DEFAULT_PAGE_SIZE}
      toolbarStart={toolbarStart}
      emptyMessage="No allocations available."
    />
  );
}
