'use client';

import type { ReactNode } from 'react';

export type CompactLaneTone = 'default' | 'portfolio' | 'trust' | 'warning';

export interface CompactLaneHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: CompactLaneTone;
  action?: ReactNode;
  className?: string;
}

const toneClasses: Record<CompactLaneTone, string> = {
  default: 'from-[var(--app-surface)] to-[var(--app-surface)]',
  portfolio: 'from-[color:color-mix(in_oklab,var(--app-info)_16%,var(--app-surface))] to-[var(--app-surface)]',
  trust: 'from-[color:color-mix(in_oklab,var(--app-primary)_16%,var(--app-surface))] to-[var(--app-surface)]',
  warning: 'from-[color:color-mix(in_oklab,var(--app-warning)_20%,var(--app-surface))] to-[var(--app-surface)]',
};

export function CompactLaneHeader({
  title,
  subtitle,
  badge,
  tone = 'default',
  action,
  className,
}: CompactLaneHeaderProps) {
  return (
    <div className={[
      'border-b border-[var(--app-border)] bg-gradient-to-r px-4 py-3',
      toneClasses[tone],
      className ?? '',
    ].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">{title}</h2>
            {badge && (
              <span className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-subtle)]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
