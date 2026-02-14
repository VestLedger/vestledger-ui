'use client';

import { Clock3, Sparkles } from 'lucide-react';
import type { MorningBrief } from '@/data/mocks/hooks/dashboard-data';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { KpiChip } from '@/ui/composites';

interface HomeMorningBriefProps {
  brief: MorningBrief;
}

export function HomeMorningBrief({ brief }: HomeMorningBriefProps) {
  const asOfLabel = brief.asOf.toLocaleTimeString(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const confidenceLabel = `${Math.round(brief.confidence * 100)}%`;

  return (
    <section
      data-testid="gp-morning-brief"
      className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, color-mix(in oklab, var(--app-primary) 15%, transparent), transparent 42%), radial-gradient(circle at 88% 14%, color-mix(in oklab, var(--app-info) 16%, transparent), transparent 40%), linear-gradient(110deg, color-mix(in oklab, var(--app-warning) 10%, transparent), transparent 55%)',
        }}
      />
      <div className="relative grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-subtle)]">
            Morning Command Brief
          </p>
          <div className="flex min-w-0 items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--app-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">
                Daily Brief (Today + {brief.horizonDays} days)
              </p>
              <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{brief.summary}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs lg:grid-cols-3">
          <KpiChip label="Signals" value={brief.itemCount} tone="neutral" />
          <KpiChip label="Urgent" value={brief.urgentCount} tone="danger" />
          <KpiChip label="Important" value={brief.importantCount} tone="warning" />
          <KpiChip label="Confidence" value={confidenceLabel} tone="primary" className="col-span-2 lg:col-span-1" />
          <div className="col-span-2 flex items-center justify-end gap-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/85 px-2 py-2 text-[var(--app-text-subtle)] lg:col-span-2">
            <Clock3 className="h-3.5 w-3.5" />
            <span className="text-[11px]">As of {asOfLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
