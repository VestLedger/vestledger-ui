'use client'

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

export function DealCard({ deal, outcome }: DealCardProps) {
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

  return (
    <Card className="hover:border-[var(--app-border-subtle)] transition-all cursor-pointer group" padding="sm">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center">
            <span className="text-white">{deal.name.charAt(0)}</span>
          </div>
          <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
            {deal.sector}
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h4 className="group-hover:text-[var(--app-primary)] transition-colors">{deal.name}</h4>
          {outcome && outcome !== 'active' && (
            <Badge size="sm" variant="flat" className={getOutcomeBadgeClass(outcome)}>
              {outcome}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <DollarSign className="w-4 h-4" />
            <span>{deal.amount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <Building2 className="w-4 h-4" />
            <span>{deal.founder}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <Calendar className="w-4 h-4" />
            <span>{deal.lastContact}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--app-border)]">
          <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)] mb-2">
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
}
