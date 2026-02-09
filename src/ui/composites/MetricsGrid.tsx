'use client'

import { MetricCard } from '@/components/metric-card';
import { StatsCard } from './StatsCard';
import type { StatsCardProps } from './StatsCard';
import type { MetricCardProps } from '@/components/metric-card';

export type MetricsGridItem =
  | { type: 'stats'; props: StatsCardProps }
  | { type: 'metric'; props: MetricCardProps };

export interface MetricsGridProps {
  items: MetricsGridItem[];
  columns?: {
    base?: 1 | 2 | 3 | 4 | 5 | 6;
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
}

const baseCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
} as const;

const smCols = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
} as const;

const mdCols = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
} as const;

const lgCols = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
} as const;

export function MetricsGrid({ items, columns, className }: MetricsGridProps) {
  const hasColumns = !!columns;
  const base = columns?.base ?? 1;
  const sm = columns?.sm;
  const md = columns?.md ?? (hasColumns ? undefined : 2);
  const lg = columns?.lg ?? (hasColumns ? undefined : 4);

  const classes = [
    'grid gap-4',
    baseCols[base],
    sm ? smCols[sm] : null,
    md ? mdCols[md] : null,
    lg ? lgCols[lg] : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {items.map((item, index) => {
        if (item.type === 'stats') {
          return <StatsCard key={index} {...item.props} />;
        }
        return <MetricCard key={index} {...item.props} />;
      })}
    </div>
  );
}
