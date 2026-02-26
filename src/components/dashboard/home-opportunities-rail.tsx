'use client';

import { ArrowRight, TrendingUp } from 'lucide-react';
import type { HomeOpportunity } from '@/data/mocks/hooks/dashboard-data';
import { CompactLaneHeader } from '@/ui/composites';

interface HomeOpportunitiesRailProps {
  opportunities: HomeOpportunity[];
  onOpportunityClick: (opportunity: HomeOpportunity) => void;
}

export function HomeOpportunitiesRail({ opportunities, onOpportunityClick }: HomeOpportunitiesRailProps) {
  return (
    <section data-testid="gp-home-opportunities" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="High-Leverage Opportunities"
        subtitle="Upside opportunities with GP-level leverage this week"
        badge={`${opportunities.length} active`}
        tone="portfolio"
      />

      {opportunities.length === 0 ? (
        <div className="px-4 py-6 text-sm text-[var(--app-text-muted)]">No active opportunities right now.</div>
      ) : (
        <div className="space-y-2 px-3 py-3">
          {opportunities.map((opportunity) => (
            <button
              key={opportunity.id}
              type="button"
              onClick={() => onOpportunityClick(opportunity)}
              className="group w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-left transition-colors hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-hover)]"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="line-clamp-1 text-sm font-semibold text-[var(--app-text)]">{opportunity.title}</p>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[var(--app-text-subtle)] transition-colors group-hover:text-[var(--app-primary)]" />
              </div>
              <p className="line-clamp-2 text-xs text-[var(--app-text-muted)]">{opportunity.thesis}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] px-2 py-1 text-[var(--app-text-muted)]">
                  <TrendingUp className="h-3 w-3 text-[var(--app-success)]" />
                  {opportunity.impactLabel}
                </span>
                <span className="text-[var(--app-text-subtle)]">{Math.round(opportunity.confidence * 100)}% confidence</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
