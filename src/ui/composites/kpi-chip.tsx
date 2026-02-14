'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export type KpiChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface KpiChipProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  tone?: KpiChipTone;
  className?: string;
}

const toneClasses: Record<KpiChipTone, string> = {
  neutral: 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]',
  primary: 'border-[color:color-mix(in_oklab,var(--app-primary)_40%,var(--app-border))] bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
  success: 'border-[color:color-mix(in_oklab,var(--app-success)_40%,var(--app-border))] bg-[var(--app-success-bg)] text-[var(--app-success)]',
  warning: 'border-[color:color-mix(in_oklab,var(--app-warning)_40%,var(--app-border))] bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
  danger: 'border-[color:color-mix(in_oklab,var(--app-danger)_40%,var(--app-border))] bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
  info: 'border-[color:color-mix(in_oklab,var(--app-info)_40%,var(--app-border))] bg-[var(--app-info-bg)] text-[var(--app-info)]',
};

export function KpiChip({
  label,
  value,
  delta,
  trend = 'flat',
  tone = 'neutral',
  className,
}: KpiChipProps) {
  return (
    <div className={[
      'rounded-xl border px-3 py-2',
      toneClasses[tone],
      className ?? '',
    ].filter(Boolean).join(' ')}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-85">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm font-semibold leading-none">{value}</p>
        {delta && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold opacity-85">
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
