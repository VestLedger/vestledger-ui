'use client'

import { Card, Progress } from '@/ui';
import { TrendingUp, DollarSign, PieChart, Target, Calendar, Activity } from 'lucide-react';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { getBenchmarkData, getCurrentFundMetrics } from '@/services/analytics/fundAnalyticsService';

export function FundPerformanceOverview() {
  const currentFund = getCurrentFundMetrics();
  const benchmarkData = getBenchmarkData();
  const metricCardClassName = 'hover:border-[var(--app-primary)] transition-all';
  const metricCardIconContainerClassName = 'p-2 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]';
  const metricCardIconClassName = 'w-5 h-5 text-white';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const getPerformancePosition = (metric: string, value: number): 'top' | 'above-median' | 'below-median' | 'bottom' => {
    const benchmark = benchmarkData.find(b => b.metric === metric);
    if (!benchmark) return 'above-median';

    if (value >= benchmark.topQuartile) return 'top';
    if (value >= benchmark.industryMedian) return 'above-median';
    if (value >= benchmark.bottomQuartile) return 'below-median';
    return 'bottom';
  };

  const tvpiBenchmark = benchmarkData.find(b => b.metric === 'TVPI');
  const irrBenchmark = benchmarkData.find(b => b.metric === 'IRR');
  const dpiBenchmark = benchmarkData.find(b => b.metric === 'DPI');
  const metricCardBaseProps = {
    className: metricCardClassName,
    iconContainerClassName: metricCardIconContainerClassName,
    iconClassName: metricCardIconClassName,
  };
  const metricItems: MetricsGridItem[] = [
    {
      type: 'metric',
      props: {
        label: 'Total Value to Paid-In (TVPI)',
        value: `${currentFund.tvpi.toFixed(2)}x`,
        subtitle: 'DPI + RVPI',
        icon: TrendingUp,
        benchmark: tvpiBenchmark
          ? {
              industryMedian: tvpiBenchmark.industryMedian,
              topQuartile: tvpiBenchmark.topQuartile,
              position: getPerformancePosition('TVPI', currentFund.tvpi),
            }
          : undefined,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Distributions to Paid-In (DPI)',
        value: `${currentFund.dpi.toFixed(2)}x`,
        subtitle: 'Realized returns',
        icon: DollarSign,
        benchmark: dpiBenchmark
          ? {
              industryMedian: dpiBenchmark.industryMedian,
              topQuartile: dpiBenchmark.topQuartile,
              position: getPerformancePosition('DPI', currentFund.dpi),
            }
          : undefined,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Residual Value to Paid-In (RVPI)',
        value: `${currentFund.rvpi.toFixed(2)}x`,
        subtitle: 'Unrealized value',
        icon: PieChart,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Internal Rate of Return (IRR)',
        value: `${currentFund.irr.toFixed(1)}%`,
        subtitle: 'Time-weighted return',
        icon: Activity,
        benchmark: irrBenchmark
          ? {
              industryMedian: irrBenchmark.industryMedian,
              topQuartile: irrBenchmark.topQuartile,
              position: getPerformancePosition('IRR', currentFund.irr),
            }
          : undefined,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Multiple on Invested Capital (MOIC)',
        value: `${currentFund.moic.toFixed(2)}x`,
        subtitle: 'Total return multiple',
        icon: Target,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Fund Vintage',
        value: currentFund.vintage.toString(),
        subtitle: `${currentFund.remainingLife} years remaining`,
        icon: Calendar,
        ...metricCardBaseProps,
      },
    },
  ];

  return (
    <div>
      {/* Fund Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{currentFund.fundName}</h3>
            <p className="text-sm text-[var(--app-text-muted)]">
              Vintage {currentFund.vintage} • {currentFund.fundStatus.charAt(0).toUpperCase() + currentFund.fundStatus.slice(1)} Stage • {currentFund.remainingLife} years remaining
            </p>
          </div>
        </div>

        {/* Fund Size & Deployment */}
        <Card padding="lg" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[var(--app-text-muted)] mb-1">Fund Size</p>
              <p className="text-2xl font-bold">{formatCurrency(currentFund.fundSize)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)] mb-1">Deployed Capital</p>
              <p className="text-2xl font-bold">{formatCurrency(currentFund.deployed)}</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {currentFund.deploymentRate.toFixed(1)}% of fund deployed
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)] mb-1">Reserved Capital</p>
              <p className="text-2xl font-bold">{formatCurrency(currentFund.reserved)}</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(currentFund.fundSize - currentFund.deployed - currentFund.reserved)} dry powder
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--app-text-muted)]">Deployment Progress</span>
              <span className="text-sm font-medium">{currentFund.deploymentRate.toFixed(1)}%</span>
            </div>
            <Progress
              value={currentFund.deploymentRate}
              maxValue={100}
              className="mb-1"
              aria-label={`Deployment progress ${currentFund.deploymentRate.toFixed(1)}%`}
            />
            <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
              <span>{currentFund.numberOfInvestments} investments</span>
              <span>Avg. {formatCurrency(currentFund.averageInvestmentSize)} per deal</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <h3 className="text-lg font-semibold mb-4">Fund Performance Metrics</h3>
      <MetricsGrid
        items={metricItems}
        columns={{ base: 1, sm: 2, lg: 3 }}
        className="mb-6"
      />

      {/* TVPI Breakdown */}
      <Card padding="lg">
        <h4 className="text-md font-semibold mb-4">TVPI Composition</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--app-success)]"></div>
                <span className="text-sm font-medium">Realized Value (DPI)</span>
              </div>
              <span className="text-sm font-semibold">{currentFund.dpi.toFixed(2)}x</span>
            </div>
            <Progress
              value={currentFund.dpi}
              maxValue={currentFund.tvpi}
              className="mb-1"
              color="success"
              aria-label={`Realized value DPI ${currentFund.dpi.toFixed(2)}x of ${currentFund.tvpi.toFixed(2)}x TVPI`}
            />
            <p className="text-xs text-[var(--app-text-subtle)]">
              {((currentFund.dpi / currentFund.tvpi) * 100).toFixed(1)}% of total value
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--app-primary)]"></div>
                <span className="text-sm font-medium">Unrealized Value (RVPI)</span>
              </div>
              <span className="text-sm font-semibold">{currentFund.rvpi.toFixed(2)}x</span>
            </div>
            <Progress
              value={currentFund.rvpi}
              maxValue={currentFund.tvpi}
              className="mb-1"
              aria-label={`Unrealized value RVPI ${currentFund.rvpi.toFixed(2)}x of ${currentFund.tvpi.toFixed(2)}x TVPI`}
            />
            <p className="text-xs text-[var(--app-text-subtle)]">
              {((currentFund.rvpi / currentFund.tvpi) * 100).toFixed(1)}% of total value
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--app-border)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Value (TVPI)</span>
              <span className="text-lg font-bold">{currentFund.tvpi.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
