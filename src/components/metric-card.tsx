'use client'

import { isValidElement, memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, Badge } from '@/ui';

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

const getBenchmarkStyles = (position: MetricBenchmark['position']) => {
  switch (position) {
    case 'top':
      return 'bg-app-success/20 dark:bg-app-dark-success/20 text-app-success dark:text-app-dark-success';
    case 'above-median':
      return 'bg-app-info/20 dark:bg-app-dark-info/20 text-app-info dark:text-app-dark-info';
    case 'below-median':
      return 'bg-app-warning/20 dark:bg-app-dark-warning/20 text-app-warning dark:text-app-dark-warning';
    case 'bottom':
      return 'bg-app-danger/20 dark:bg-app-dark-danger/20 text-app-danger dark:text-app-dark-danger';
    default:
      return 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text-muted dark:text-app-dark-text-muted';
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
  const cardClassName = className ?? 'hover:border-app-border-subtle dark:hover:border-app-dark-border-subtle transition-colors';
  const containerClassName = iconContainerClassName ?? 'p-2 bg-app-primary/10 dark:bg-app-dark-primary/15 rounded-lg';
  const resolvedIconClassName = iconClassName ?? 'w-5 h-5 text-app-primary dark:text-app-dark-primary';

  const iconContent = isValidElement(icon)
    ? icon
    : (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon))
    ? (() => {
        const Icon = icon as LucideIcon;
        return <Icon className={resolvedIconClassName} />;
      })()
    : icon;

  const trendClasses = trend === 'up'
    ? 'text-app-success dark:text-app-dark-success border-app-success dark:border-app-dark-success'
    : trend === 'down'
    ? 'text-app-danger dark:text-app-dark-danger border-app-danger dark:border-app-dark-danger'
    : 'text-app-text-muted dark:text-app-dark-text-muted border-app-border dark:border-app-dark-border';

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
    <div className={`text-xs font-medium px-2 py-1 rounded-md ${getBenchmarkStyles(benchmark.position)}`}>
      {getBenchmarkLabel(benchmark.position)}
    </div>
  ) : null;

  return (
    <Card className={cardClassName} padding="md">
      <div className="flex items-start justify-between mb-4">
        <div className={containerClassName}>{iconContent}</div>
        {headerMeta}
      </div>
      <div className="text-3xl mb-1">{value}</div>
      <div className="text-sm text-app-text-muted dark:text-app-dark-text-muted">{label}</div>
      {subtitle && (
        <div className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle mt-1">{subtitle}</div>
      )}
      {benchmark && (
        <div className="mt-3 pt-3 border-t border-app-border dark:border-app-dark-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-text-muted dark:text-app-dark-text-muted">Industry Median</span>
            <span className="font-medium">{benchmark.industryMedian.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-app-text-muted dark:text-app-dark-text-muted">Top Quartile</span>
            <span className="font-medium">{benchmark.topQuartile.toFixed(2)}</span>
          </div>
        </div>
      )}
    </Card>
  );
});
