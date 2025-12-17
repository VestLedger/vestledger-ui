'use client'

import { useEffect } from 'react';
import { Filter, Grid, List, GitBranch } from 'lucide-react';
import { DealCard } from '@/components/deal-card';
import { Button, Card, Badge, Progress, Breadcrumb, PageHeader, PageContainer } from '@/ui';
import { ButtonGroup, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { getRouteConfig } from '@/config/routes';
import { KanbanBoard } from '@/components/kanban-board';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSuggestionsOverride } from '@/store/slices/copilotSlice';
import { pipelineDataRequested, dealStageUpdated, pipelineSelectors } from '@/store/slices/pipelineSlice';
import { useUIKey } from '@/store/ui';
import type { PipelineDeal as Deal, PipelineDealOutcome as DealOutcome } from '@/services/pipelineService';

export function Pipeline() {
  const dispatch = useAppDispatch();

  // Use centralized selectors
  const data = useAppSelector(pipelineSelectors.selectData);
  const status = useAppSelector(pipelineSelectors.selectStatus);

  const pipelineStages = data?.stages || [];
  const pipelineDeals = data?.deals || [];
  const pipelineCopilotSuggestions = data?.copilotSuggestions || [];

  // Load pipeline data on mount
  useEffect(() => {
    dispatch(pipelineDataRequested({}));
  }, [dispatch]);

  const { value: pipelineUI, patch: patchPipelineUI } = useUIKey('pipeline', {
    viewMode: 'kanban' as 'kanban' | 'list',
    showClosedDeals: false,
  });
  const viewMode = pipelineUI.viewMode;
  const showClosedDeals = pipelineUI.showClosedDeals;

  const getOutcomeBadgeClass = (outcome: DealOutcome) => {
    switch (outcome) {
      case 'won':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)] border-[var(--app-success)]';
      case 'lost':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] border-[var(--app-danger)]';
      case 'withdrawn':
        return 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)] border-[var(--app-text-muted)]';
      case 'passed':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)] border-[var(--app-warning)]';
      default:
        return '';
    }
  };

  const filteredDeals = showClosedDeals ? pipelineDeals : pipelineDeals.filter(d => d.outcome === 'active');
  const activeDealsCount = pipelineDeals.filter(d => d.outcome === 'active').length;
  const closedDealsCount = pipelineDeals.filter(d => d.outcome !== 'active').length;

  const handleItemMove = (itemId: number | string, newStage: string) => {
    dispatch(dealStageUpdated({ dealId: itemId, newStage }));
  };

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/pipeline');

  // Calculate AI insights
  const highProbabilityDeals = filteredDeals.filter(d => d.probability >= 70 && d.outcome === 'active');
  const stalledDeals = filteredDeals.filter(d => {
    const lastContact = d.lastContact;
    return d.outcome === 'active' && (lastContact.includes('week') || lastContact.includes('month'));
  });

  // Surface the inbound deal-flow suggestion inside the Copilot suggestions panel when on this page
  useEffect(() => {
    if (pipelineCopilotSuggestions.length > 0) {
      dispatch(setSuggestionsOverride(pipelineCopilotSuggestions));
    }
    return () => {
      dispatch(setSuggestionsOverride(null));
    };
  }, [dispatch, pipelineCopilotSuggestions]);

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      {routeConfig && (
        <div className="mb-4">
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        </div>
      )}

      {/* Page Header with AI Summary */}
      <PageHeader
        title="Deal Pipeline"
        description="Track and manage your investment opportunities"
        icon={GitBranch}
        aiSummary={{
          text: `${highProbabilityDeals.length} high-probability deals (≥70%) detected. ${stalledDeals.length} deals need follow-up (inactive >1 week). Total pipeline value: $${(filteredDeals.reduce((sum, d) => sum + parseFloat(d.amount.replace(/[$M]/g, '')), 0)).toFixed(1)}M.`,
          confidence: 0.92
        }}
        primaryAction={{
          label: 'Add Deal',
          onClick: () => console.log('Add deal clicked'),
          aiSuggested: true,
          confidence: 0.78
        }}
      >
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Badge size="md" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
            {activeDealsCount}  Active Deals
          </Badge>
          <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
            {closedDealsCount} Closed Deals
          </Badge>
        </div>
      </PageHeader>

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
            items: filteredDeals
              .filter(deal => deal.stage === stage)
              .map(deal => ({ ...deal, id: deal.id }))
          }))}
          onItemMove={handleItemMove}
          renderItem={(item) => (
            <DealCard deal={item as Deal} outcome={(item as Deal).outcome} />
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
                          <Badge size="sm" variant="flat" className={`${getOutcomeBadgeClass(deal.outcome)} mt-1 w-fit`}>
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
    </PageContainer>
  );
}
