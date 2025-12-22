'use client'

import { useEffect } from 'react';
import { Filter, Grid, List, GitBranch } from 'lucide-react';
import { DealCard } from '@/components/deal-card';
import { Button, Card, Badge, Progress } from '@/ui';
import { ButtonGroup, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { KanbanBoard } from '@/components/kanban-board';
import { useAppDispatch } from '@/store/hooks';
import { setSuggestionsOverride } from '@/store/slices/copilotSlice';
import { pipelineDataRequested, dealStageUpdated, pipelineSelectors } from '@/store/slices/pipelineSlice';
import { useUIKey } from '@/store/ui';
import { ErrorState, LoadingState } from '@/components/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dealOutcomeClasses } from '@/utils/styling';
import { PageScaffold } from '@/components/ui';

export function Pipeline() {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useAsyncData(pipelineDataRequested, pipelineSelectors.selectState, { params: {} });

  const pipelineStages = data?.stages || [];
  const pipelineDeals = data?.deals || [];

  const { value: pipelineUI, patch: patchPipelineUI } = useUIKey('pipeline', {
    viewMode: 'kanban' as 'kanban' | 'list',
    showClosedDeals: false,
  });
  const viewMode = pipelineUI.viewMode;
  const showClosedDeals = pipelineUI.showClosedDeals;

  const filteredDeals = showClosedDeals ? pipelineDeals : pipelineDeals.filter(d => d.outcome === 'active');
  const activeDealsCount = pipelineDeals.filter(d => d.outcome === 'active').length;
  const closedDealsCount = pipelineDeals.filter(d => d.outcome !== 'active').length;

  const handleItemMove = (itemId: number | string, newStage: string) => {
    dispatch(dealStageUpdated({ dealId: itemId, newStage }));
  };

  // Calculate AI insights
  const highProbabilityDeals = filteredDeals.filter(d => d.probability >= 70 && d.outcome === 'active');
  const stalledDeals = filteredDeals.filter(d => {
    const lastContact = d.lastContact;
    return d.outcome === 'active' && (lastContact.includes('week') || lastContact.includes('month'));
  });

  // Surface the inbound deal-flow suggestion inside the Copilot suggestions panel when on this page
  useEffect(() => {
    const suggestions = data?.copilotSuggestions ?? [];
    if (suggestions.length > 0) {
      dispatch(setSuggestionsOverride(suggestions));
    }
    return () => {
      dispatch(setSuggestionsOverride(null));
    };
  }, [dispatch, data?.copilotSuggestions]);

  return (
    <PageScaffold
      routePath="/pipeline"
      header={{
        title: 'Deal Pipeline',
        description: 'Track and manage your investment opportunities',
        icon: GitBranch,
        aiSummary: {
          text: `${highProbabilityDeals.length} high-probability deals (≥70%) detected. ${stalledDeals.length} deals need follow-up (inactive >1 week). Total pipeline value: $${(filteredDeals.reduce((sum, d) => sum + parseFloat(d.amount.replace(/[$M]/g, '')), 0)).toFixed(1)}M.`,
          confidence: 0.92,
        },
        primaryAction: {
          label: 'Add Deal',
          onClick: () => console.log('Add deal clicked'),
          aiSuggested: true,
          confidence: 0.78,
        },
        children: (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge size="md" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
              {activeDealsCount} Active Deals
            </Badge>
            <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
              {closedDealsCount} Closed Deals
            </Badge>
          </div>
        ),
      }}
    >

      {isLoading && <LoadingState message="Loading pipeline…" fullHeight={false} />}
      {error && (
        <ErrorState
          error={error}
          title="Failed to load pipeline"
          onRetry={refetch}
        />
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <Button variant="bordered" className="text-[var(--app-text-muted)]" startContent={<Filter className="w-4 h-4" />}>
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <ButtonGroup>
          <Button
            isIconOnly
            variant={viewMode === 'kanban' ? 'solid' : 'bordered'}
            onPress={() => patchPipelineUI({ viewMode: 'kanban' })}
            aria-label="Kanban view"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            variant={viewMode === 'list' ? 'solid' : 'bordered'}
            onPress={() => patchPipelineUI({ viewMode: 'list' })}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </Button>
        </ButtonGroup>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          columns={pipelineStages.map(stage => ({
            id: stage,
            title: stage,
            items: filteredDeals.filter(deal => deal.stage === stage)
          }))}
          onItemMove={handleItemMove}
          renderItem={(item) => (
            <DealCard deal={item} outcome={item.outcome} />
          )}
        />
      ) : (
        <Card>
          <Table aria-label="Deals table" classNames={{ wrapper: "bg-transparent shadow-none" }}>
            <TableHeader>
              <TableColumn className="text-[var(--app-text-muted)]">Company</TableColumn>
              <TableColumn className="text-[var(--app-text-muted)]">Stage</TableColumn>
              <TableColumn className="text-[var(--app-text-muted)] hidden md:table-cell">Sector</TableColumn>
              <TableColumn className="text-right text-[var(--app-text-muted)]">Amount</TableColumn>
              <TableColumn className="text-right text-[var(--app-text-muted)] hidden lg:table-cell">Probability</TableColumn>
              <TableColumn className="text-[var(--app-text-muted)] hidden xl:table-cell">Founder</TableColumn>
              <TableColumn className="text-[var(--app-text-muted)] hidden xl:table-cell">Last Contact</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow key={deal.id} className="hover:bg-[var(--app-surface-hover)]">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-xs flex-shrink-0 text-white">
                        {deal.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span>{deal.name}</span>
                        {deal.outcome !== 'active' && (
                          <Badge size="sm" variant="flat" className={`${dealOutcomeClasses[deal.outcome as keyof typeof dealOutcomeClasses] || ''} mt-1 w-fit`}>
                            {deal.outcome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--app-text-muted)] hidden md:table-cell">{deal.sector}</TableCell>
                  <TableCell className="text-right">{deal.amount}</TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Progress
                        value={deal.probability}
                        size="sm"
                        color="primary"
                        className="w-16"
                        aria-label={`${deal.name} probability ${deal.probability}%`}
                      />
                      <span className="text-sm text-[var(--app-text-muted)] w-8">{deal.probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">{deal.founder}</TableCell>
                  <TableCell className="text-[var(--app-text-muted)] hidden xl:table-cell">{deal.lastContact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageScaffold>
  );
}
