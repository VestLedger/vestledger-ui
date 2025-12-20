'use client'

import { Card, Progress } from '@/ui';
import { TrendingUp, DollarSign, PieChart, Target, Calendar, Activity } from 'lucide-react';
import { getBenchmarkData, getCurrentFundMetrics } from '@/services/analytics/fundAnalyticsService';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  benchmark?: {
    industryMedian: number;
    topQuartile: number;
    position: 'top' | 'above-median' | 'below-median' | 'bottom';
  };
}

function MetricCard({ title, value, subtitle, icon, benchmark }: MetricCardProps) {
  const getBenchmarkColor = (position: string) => {
    switch (position) {
      case 'top': return 'var(--app-success)';
      case 'above-median': return 'var(--app-info)';
      case 'below-median': return 'var(--app-warning)';
      case 'bottom': return 'var(--app-danger)';
      default: return 'var(--app-text-muted)';
    }
  };

  const getBenchmarkLabel = (position: string) => {
    switch (position) {
      case 'top': return 'Top Quartile';
      case 'above-median': return 'Above Median';
      case 'below-median': return 'Below Median';
      case 'bottom': return 'Bottom Quartile';
      default: return '';
    }
  };

  return (
    <Card padding="md" className="hover:border-[var(--app-primary)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]">
          <div className="text-white">{icon}</div>
        </div>
        {benchmark && (
          <div
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{
              backgroundColor: `${getBenchmarkColor(benchmark.position)}20`,
              color: getBenchmarkColor(benchmark.position)
            }}
          >
            {getBenchmarkLabel(benchmark.position)}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--app-text-muted)] mb-1">{title}</p>
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--app-text-subtle)]">{subtitle}</p>
        )}
        {benchmark && (
          <div className="mt-2 pt-2 border-t border-[var(--app-border)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--app-text-muted)]">Industry Median</span>
              <span className="font-medium">{benchmark.industryMedian.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[var(--app-text-muted)]">Top Quartile</span>
              <span className="font-medium">{benchmark.topQuartile.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function FundPerformanceOverview() {
  const currentFund = getCurrentFundMetrics();
  const benchmarkData = getBenchmarkData();

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Value to Paid-In (TVPI)"
          value={`${currentFund.tvpi.toFixed(2)}x`}
          subtitle="DPI + RVPI"
          icon={<TrendingUp className="w-5 h-5" />}
          benchmark={tvpiBenchmark ? {
            industryMedian: tvpiBenchmark.industryMedian,
            topQuartile: tvpiBenchmark.topQuartile,
            position: getPerformancePosition('TVPI', currentFund.tvpi)
          } : undefined}
        />

        <MetricCard
          title="Distributions to Paid-In (DPI)"
          value={`${currentFund.dpi.toFixed(2)}x`}
          subtitle="Realized returns"
          icon={<DollarSign className="w-5 h-5" />}
          benchmark={dpiBenchmark ? {
            industryMedian: dpiBenchmark.industryMedian,
            topQuartile: dpiBenchmark.topQuartile,
            position: getPerformancePosition('DPI', currentFund.dpi)
          } : undefined}
        />

        <MetricCard
          title="Residual Value to Paid-In (RVPI)"
          value={`${currentFund.rvpi.toFixed(2)}x`}
          subtitle="Unrealized value"
          icon={<PieChart className="w-5 h-5" />}
        />

        <MetricCard
          title="Internal Rate of Return (IRR)"
          value={`${currentFund.irr.toFixed(1)}%`}
          subtitle="Time-weighted return"
          icon={<Activity className="w-5 h-5" />}
          benchmark={irrBenchmark ? {
            industryMedian: irrBenchmark.industryMedian,
            topQuartile: irrBenchmark.topQuartile,
            position: getPerformancePosition('IRR', currentFund.irr)
          } : undefined}
        />

        <MetricCard
          title="Multiple on Invested Capital (MOIC)"
          value={`${currentFund.moic.toFixed(2)}x`}
          subtitle="Total return multiple"
          icon={<Target className="w-5 h-5" />}
        />

        <MetricCard
          title="Fund Vintage"
          value={currentFund.vintage.toString()}
          subtitle={`${currentFund.remainingLife} years remaining`}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

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
