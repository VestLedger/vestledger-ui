'use client'

import { useState } from 'react';
import { Plus, Filter, Grid, List, Eye, EyeOff } from 'lucide-react';
import { DealCard } from '@/components/deal-card';
import { Button, Card, Badge, Progress } from '@/ui';
import { ButtonGroup, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

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

  const filteredDeals = showClosedDeals ? deals : deals.filter(d => d.outcome === 'active');
  const activeDealsCount = deals.filter(d => d.outcome === 'active').length;
  const closedDealsCount = deals.filter(d => d.outcome !== 'active').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl mb-2">Deal Pipeline</h2>
          <p className="text-sm sm:text-base text-[var(--app-text-muted)]">
            Track and manage your investment opportunities
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant={showClosedDeals ? 'solid' : 'bordered'}
            className="text-[var(--app-text-muted)]"
            startContent={showClosedDeals ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onPress={() => setShowClosedDeals(!showClosedDeals)}
          >
            <span className="hidden sm:inline">{showClosedDeals ? 'Hide' : 'Show'} Closed</span>
            <Badge size="sm" variant="flat" className="ml-1 bg-[var(--app-surface-hover)]">
              {closedDealsCount}
            </Badge>
          </Button>
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
          <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
            <span className="hidden sm:inline">Add Deal</span>
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stages.map((stage) => (
            <div key={stage} className="flex-shrink-0 w-72 sm:w-80">
              <Card className="mb-3" padding="sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm">{stage}</h3>
                  <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
                    {filteredDeals.filter(d => d.stage === stage).length}
                  </Badge>
                </div>
              </Card>
              <div className="space-y-3">
                {filteredDeals
                  .filter(deal => deal.stage === stage)
                  .map(deal => (
                    <DealCard key={deal.id} deal={deal} outcome={deal.outcome} />
                  ))}
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
