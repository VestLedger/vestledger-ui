'use client'

import { memo } from 'react';
import { Building2, DollarSign, Calendar } from 'lucide-react';
import { Card, Badge, Progress } from '@/ui';

type DealOutcome = 'active' | 'won' | 'lost' | 'withdrawn' | 'passed';

interface Deal {
  id: number;
  name: string;
  stage: string;
  sector: string;
  amount: string;
  probability: number;
  founder: string;
  lastContact: string;
}

interface DealCardProps {
  deal: Deal;
  outcome?: DealOutcome;
}

export const DealCard = memo(function DealCard({ deal, outcome }: DealCardProps) {
  const getOutcomeBadgeClass = (outcome: DealOutcome) => {
    switch (outcome) {
      case 'won':
        return 'bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success border-app-success dark:border-app-dark-success';
      case 'lost':
        return 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger border-app-danger dark:border-app-dark-danger';
      case 'withdrawn':
        return 'bg-app-text-muted/10 dark:bg-app-dark-text-muted/10 text-app-text-muted dark:text-app-dark-text-muted border-app-text-muted dark:border-app-dark-text-muted';
      case 'passed':
        return 'bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning border-app-warning dark:border-app-dark-warning';
      default:
        return '';
    }
  };

  return (
    <Card className="hover:border-app-border-subtle dark:hover:border-app-dark-border-subtle transition-all cursor-pointer group" padding="sm">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-app-primary to-app-accent dark:from-app-dark-primary dark:to-app-dark-accent flex items-center justify-center">
            <span className="text-white">{deal.name.charAt(0)}</span>
          </div>
          <Badge size="sm" variant="flat" className="bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text-muted dark:text-app-dark-text-muted">
            {deal.sector}
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h4 className="group-hover:text-app-primary dark:group-hover:text-app-dark-primary transition-colors">{deal.name}</h4>
          {outcome && outcome !== 'active' && (
            <Badge size="sm" variant="flat" className={getOutcomeBadgeClass(outcome)}>
              {outcome}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-app-text-muted dark:text-app-dark-text-muted">
            <DollarSign className="w-4 h-4" />
            <span>{deal.amount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-app-text-muted dark:text-app-dark-text-muted">
            <Building2 className="w-4 h-4" />
            <span>{deal.founder}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-app-text-muted dark:text-app-dark-text-muted">
            <Calendar className="w-4 h-4" />
            <span>{deal.lastContact}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-app-border dark:border-app-dark-border">
          <div className="flex items-center justify-between text-xs text-app-text-muted dark:text-app-dark-text-muted mb-2">
            <span>Probability</span>
            <span>{deal.probability}%</span>
          </div>
          <Progress
            value={deal.probability}
            size="sm"
            color="primary"
            aria-label={`Deal probability ${deal.probability}%`}
          />
        </div>
    </Card>
  );
});
