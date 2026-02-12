'use client';

import { Clock3, Sparkles } from 'lucide-react';
import type { MorningBrief } from '@/data/mocks/hooks/dashboard-data';

interface HomeMorningBriefProps {
  brief: MorningBrief;
}

export function HomeMorningBrief({ brief }: HomeMorningBriefProps) {
  const asOfLabel = brief.asOf.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section
      data-testid="gp-morning-brief"
      className="rounded-xl border border-[var(--app-border)] bg-gradient-to-r from-[var(--app-primary)]/8 to-[var(--app-info)]/8 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--app-primary)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">Daily Brief (Today + {brief.horizonDays} days)</p>
            <p className="text-sm text-[var(--app-text-muted)]">{brief.summary}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-subtle)]">
          <span>{brief.itemCount} signals</span>
          <span>{brief.urgentCount} urgent</span>
          <span>{brief.importantCount} important</span>
          <span className="rounded-full bg-[var(--app-surface)] px-2 py-1 text-[var(--app-primary)]">
            {Math.round(brief.confidence * 100)}% confidence
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            As of {asOfLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
