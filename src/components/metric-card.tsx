'use client'

import { isValidElement, memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, Badge } from '@/ui';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

export interface MetricBenchmark {
  industryMedian: number;
  topQuartile: number;
  position: 'top' | 'above-median' | 'below-median' | 'bottom';
}

export interface MetricCardProps {
  label: string;
  value: string;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon | ReactNode;
  subtitle?: string;
  benchmark?: MetricBenchmark;
  className?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
}

const getBenchmarkColor = (position: MetricBenchmark['position']) => {
  switch (position) {
    case 'top':
      return 'var(--app-success)';
    case 'above-median':
      return 'var(--app-info)';
    case 'below-median':
      return 'var(--app-warning)';
    case 'bottom':
      return 'var(--app-danger)';
    default:
      return 'var(--app-text-muted)';
  }
};

const getBenchmarkLabel = (position: MetricBenchmark['position']) => {
  switch (position) {
    case 'top':
      return 'Top Quartile';
    case 'above-median':
      return 'Above Median';
    case 'below-median':
      return 'Below Median';
    case 'bottom':
      return 'Bottom Quartile';
    default:
      return '';
  }
};

export const MetricCard = memo(function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  subtitle,
  benchmark,
  className,
  iconContainerClassName,
  iconClassName,
}: MetricCardProps) {
  const density = useDashboardDensity();
  const cardClassName = className ?? 'hover:border-[var(--app-border-subtle)] transition-colors';
  const containerClassName = iconContainerClassName ?? 'p-2 bg-[var(--app-primary-bg)] rounded-lg';
  const resolvedIconClassName = iconClassName ?? 'w-5 h-5 text-[var(--app-primary)]';
  const subtitleSpacingClass = density.mode === 'compact' ? 'mt-0.5' : 'mt-1';
  const benchmarkSectionClass = density.mode === 'compact'
    ? 'mt-2 pt-2 border-t border-[var(--app-border)]'
    : 'mt-3 pt-3 border-t border-[var(--app-border)]';
  const benchmarkSecondaryRowMarginClass = density.mode === 'compact' ? 'mt-0.5' : 'mt-1';

  const iconContent = isValidElement(icon)
    ? icon
    : (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon))
    ? (() => {
        const Icon = icon as LucideIcon;
        return <Icon className={resolvedIconClassName} />;
      })()
    : icon;

  const trendClasses = trend === 'up'
    ? 'text-[var(--app-success)] border-[var(--app-success)]'
    : trend === 'down'
    ? 'text-[var(--app-danger)] border-[var(--app-danger)]'
    : 'text-[var(--app-text-muted)] border-[var(--app-border)]';

  const showChange = change !== undefined && change !== null && `${change}`.length > 0;
  const changeText = showChange ? String(change) : '';

  const headerMeta = showChange ? (
    <Badge
      size="sm"
      variant="bordered"
      className={`flex items-center gap-1 ${trendClasses}`}
      startContent={
        trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : undefined
      }
    >
      {changeText}
    </Badge>
  ) : benchmark ? (
    <div
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{
        backgroundColor: `${getBenchmarkColor(benchmark.position)}20`,
        color: getBenchmarkColor(benchmark.position),
      }}
    >
      {getBenchmarkLabel(benchmark.position)}
    </div>
  ) : null;

  return (
    <Card className={cardClassName} padding="md">
      <div className={`flex items-start justify-between ${density.metrics.headerGapClass}`}>
        <div className={containerClassName}>{iconContent}</div>
        {headerMeta}
      </div>
      <div className={density.metrics.valueClass}>{value}</div>
      <div className="text-sm text-[var(--app-text-muted)]">{label}</div>
      {subtitle && (
        <div className={`text-xs text-[var(--app-text-subtle)] ${subtitleSpacingClass}`}>{subtitle}</div>
      )}
      {benchmark && (
        <div className={benchmarkSectionClass}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--app-text-muted)]">Industry Median</span>
            <span className="font-medium">{benchmark.industryMedian.toFixed(2)}</span>
          </div>
          <div className={`flex items-center justify-between text-xs ${benchmarkSecondaryRowMarginClass}`}>
            <span className="text-[var(--app-text-muted)]">Top Quartile</span>
            <span className="font-medium">{benchmark.topQuartile.toFixed(2)}</span>
          </div>
        </div>
      )}
    </Card>
  );
});
