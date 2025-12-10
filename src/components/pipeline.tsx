'use client'

import { useState } from 'react';
import { Plus, Filter, Grid, List, GitBranch, Sparkles } from 'lucide-react';
import { DealCard } from '@/components/deal-card';
import { Button, Card, Badge, Progress, Breadcrumb, PageHeader, PageContainer } from '@/ui';
import { ButtonGroup, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { getRouteConfig } from '@/config/routes';
import { StartupApplicationForm } from './dealflow/startup-application-form';
import { AISuggestionTooltip } from './ai-suggestion-tooltip';
import { KanbanBoard } from '@/components/kanban-board';

type DealOutcome = 'active' | 'won' | 'lost' | 'withdrawn' | 'passed';

interface Deal {
  id: number;
  name: string;
  stage: string;
  outcome: DealOutcome;
  sector: string;
  amount: string;
  probability: number;
  founder: string;
  lastContact: string;
}

const stages = ['Sourced', 'First Meeting', 'Due Diligence', 'Term Sheet', 'Closed'];

const deals: Deal[] = [
  { id: 1, name: 'Quantum AI', stage: 'Due Diligence', outcome: 'active', sector: 'AI/ML', amount: '$2.5M', probability: 75, founder: 'Sarah Chen', lastContact: '2 days ago' },
  { id: 2, name: 'BioTech Labs', stage: 'Term Sheet', outcome: 'active', sector: 'Healthcare', amount: '$1.8M', probability: 85, founder: 'Dr. James Wilson', lastContact: '1 day ago' },
  { id: 3, name: 'CloudScale', stage: 'Due Diligence', outcome: 'active', sector: 'SaaS', amount: '$3.2M', probability: 70, founder: 'Maria Rodriguez', lastContact: '3 days ago' },
  { id: 4, name: 'FinFlow', stage: 'First Meeting', outcome: 'active', sector: 'FinTech', amount: '$2.0M', probability: 45, founder: 'Alex Kumar', lastContact: '1 week ago' },
  { id: 5, name: 'DataStream', stage: 'Sourced', outcome: 'active', sector: 'Analytics', amount: '$1.5M', probability: 30, founder: 'Emma Thompson', lastContact: '2 weeks ago' },
  { id: 6, name: 'EcoEnergy', stage: 'First Meeting', outcome: 'active', sector: 'CleanTech', amount: '$4.0M', probability: 50, founder: 'John Park', lastContact: '5 days ago' },
  { id: 7, name: 'NeuroLink', stage: 'Due Diligence', outcome: 'active', sector: 'MedTech', amount: '$2.8M', probability: 80, founder: 'Lisa Zhang', lastContact: '1 day ago' },
  { id: 8, name: 'SpaceLogix', stage: 'Sourced', outcome: 'active', sector: 'Aerospace', amount: '$5.0M', probability: 25, founder: 'Mike Anderson', lastContact: '3 weeks ago' },
  // Closed deals
  { id: 9, name: 'TechVision', stage: 'Closed', outcome: 'won', sector: 'AI/ML', amount: '$3.5M', probability: 100, founder: 'Rachel Kim', lastContact: '1 month ago' },
  { id: 10, name: 'HealthPlus', stage: 'Closed', outcome: 'lost', sector: 'Healthcare', amount: '$2.2M', probability: 0, founder: 'Tom Chen', lastContact: '2 months ago' },
  { id: 11, name: 'GreenTech', stage: 'Closed', outcome: 'withdrawn', sector: 'CleanTech', amount: '$1.8M', probability: 0, founder: 'Sam Park', lastContact: '3 months ago' },
];

export function Pipeline() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showClosedDeals, setShowClosedDeals] = useState(false);
  const [localDeals, setLocalDeals] = useState(deals);

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

  const filteredDeals = showClosedDeals ? localDeals : localDeals.filter(d => d.outcome === 'active');
  const activeDealsCount = localDeals.filter(d => d.outcome === 'active').length;
  const closedDealsCount = localDeals.filter(d => d.outcome !== 'active').length;

  const handleItemMove = (itemId: number | string, newStage: string) => {
    setLocalDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === itemId
          ? { ...deal, stage: newStage }
          : deal
      )
    );
  };

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/pipeline');

  // Calculate AI insights
  const highProbabilityDeals = filteredDeals.filter(d => d.probability >= 70 && d.outcome === 'active');
  const stalledDeals = filteredDeals.filter(d => {
    const lastContact = d.lastContact;
    return d.outcome === 'active' && (lastContact.includes('week') || lastContact.includes('month'));
  });

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

      <div className="flex flex-col gap-4 mb-6">
        <Card padding="md" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Capture inbound deal flow</p>
            <p className="text-xs text-[var(--app-text-muted)]">Share the startup application form to auto-enrich your pipeline.</p>
          </div>
          <AISuggestionTooltip
            suggestion="Publish the application form to source AI-scored inbound startups directly into the pipeline."
            reasoning="Reduces manual intake and prioritizes high-match submissions using your thesis filters."
            confidence={0.82}
          >
            <Button variant="flat" startContent={<Sparkles className="w-4 h-4" />}>
              AI Suggestion
            </Button>
          </AISuggestionTooltip>
        </Card>

        <StartupApplicationForm />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <Button variant="bordered" className="text-[var(--app-text-muted)]" startContent={<Filter className="w-4 h-4" />}>
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <ButtonGroup>
          <Button
            isIconOnly
            variant={viewMode === 'kanban' ? 'solid' : 'bordered'}
            onPress={() => setViewMode('kanban')}
            aria-label="Kanban view"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            variant={viewMode === 'list' ? 'solid' : 'bordered'}
            onPress={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </Button>
        </ButtonGroup>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          columns={stages.map(stage => ({
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
