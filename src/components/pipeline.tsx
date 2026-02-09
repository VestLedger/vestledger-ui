'use client'

import { useEffect } from 'react';
import { Filter, Grid, List, GitBranch } from 'lucide-react';
import { DealCard } from '@/components/deal-card';
import { Button, Card, Badge, Progress, ToggleButtonGroup } from '@/ui';
import { KanbanBoard } from '@/components/kanban-board';
import { useAppDispatch } from '@/store/hooks';
import { setSuggestionsOverride } from '@/store/slices/copilotSlice';
import { pipelineDataRequested, dealStageUpdated, pipelineSelectors } from '@/store/slices/pipelineSlice';
import { useUIKey } from '@/store/ui';
import { ErrorState, LoadingState } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';
import { dealOutcomeClasses } from '@/utils/styling';
import { PageScaffold } from '@/ui/composites';
import { ROUTE_PATHS } from '@/config/routes';

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
  const viewModeSelection = new Set([viewMode]);

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
      routePath={ROUTE_PATHS.pipeline}
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
        <Button
          variant="bordered"
          className="text-[var(--app-text-muted)]"
          startContent={<Filter className="w-4 h-4" />}
          aria-label="Filter deals"
        >
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <ToggleButtonGroup
          aria-label="Pipeline view mode"
          options={[
            { key: 'kanban', label: null, icon: <Grid className="w-4 h-4" />, 'aria-label': 'Kanban view' },
            { key: 'list', label: null, icon: <List className="w-4 h-4" />, 'aria-label': 'List view' },
          ]}
          selectedKeys={viewModeSelection}
          onSelectionChange={(keys) => {
            const nextView = Array.from(keys)[0];
            if (nextView === 'kanban' || nextView === 'list') {
              patchPipelineUI({ viewMode: nextView });
            }
          }}
          selectionMode="single"
          size="md"
          className="px-1"
        />
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" aria-label="Deals table">
              <thead className="border-b border-[var(--app-border)]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--app-text-muted)]">Company</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--app-text-muted)]">Stage</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--app-text-muted)] hidden md:table-cell">Sector</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-[var(--app-text-muted)]">Amount</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-[var(--app-text-muted)] hidden lg:table-cell">Probability</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--app-text-muted)] hidden xl:table-cell">Founder</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-[var(--app-text-muted)] hidden xl:table-cell">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[var(--app-surface-hover)]">
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--app-text-muted)] hidden md:table-cell">{deal.sector}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{deal.amount}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
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
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">{deal.founder}</td>
                    <td className="px-4 py-3 text-[var(--app-text-muted)] hidden xl:table-cell">{deal.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageScaffold>
  );
}
