'use client'

import { Card, Badge, Button, Progress } from '@/ui';
import {
  DollarSign,
  Briefcase,
  Target,
  Activity,
  Filter,
  Download,
} from 'lucide-react';
import { AdvancedTable } from '@/components/data-table/advanced-table';
import { PortfolioTabHeader } from '@/components/portfolio-tab-header';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import {
  getPortfolioAssetAllocation,
  getPortfolioCompanies,
  getPortfolioPerformanceData,
  getPortfolioSummary,
} from '@/services/portfolio/portfolioDataService';

const getHealthColor = (score: number) => {
  if (score >= 85) return 'var(--app-success)';
  if (score >= 70) return 'var(--app-warning)';
  return 'var(--app-danger)';
};

const getStatusBadge = (status: string) => {
  const colors = {
    active: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
    'at-risk': 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
    'under-review': 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
    exited: 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]',
  };
  return colors[status as keyof typeof colors] || colors.active;
};

export function PortfolioDashboard() {
  const portfolioCompanies = getPortfolioCompanies();
  const portfolioSummary = getPortfolioSummary();
  const performanceData = getPortfolioPerformanceData();
  const assetAllocation = getPortfolioAssetAllocation();

  const filteredCompanies = portfolioCompanies;

  const portfolioValueChange = (() => {
    if (performanceData.length < 2) return undefined;
    const previous = performanceData[performanceData.length - 2];
    const latest = performanceData[performanceData.length - 1];
    const denominator = previous.portfolioValue || 1;
    return ((latest.portfolioValue - previous.portfolioValue) / denominator) * 100;
  })();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const metricCardClassName = 'hover:border-[var(--app-primary)] transition-all';
  const metricCardIconContainerClassName = 'p-2 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]';
  const metricCardIconClassName = 'w-5 h-5 text-white';
  const metricCardBaseProps = {
    className: metricCardClassName,
    iconContainerClassName: metricCardIconContainerClassName,
    iconClassName: metricCardIconClassName,
  };
  const metricItems: MetricsGridItem[] = [
    {
      type: 'metric',
      props: {
        label: 'Total Portfolio Value',
        value: formatCurrency(portfolioSummary.totalCurrentValue),
        change: portfolioValueChange !== undefined ? `${Math.abs(portfolioValueChange).toFixed(1)}%` : undefined,
        trend: portfolioValueChange !== undefined && portfolioValueChange >= 0 ? 'up' : 'down',
        icon: DollarSign,
        subtitle: `${formatCurrency(portfolioSummary.totalInvested)} deployed`,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Active Companies',
        value: portfolioSummary.activeCompanies.toString(),
        icon: Briefcase,
        subtitle: `${portfolioCompanies.length} total investments`,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Average MOIC',
        value: `${portfolioSummary.averageMOIC.toFixed(1)}x`,
        icon: Target,
        subtitle: `${portfolioSummary.averageIRR.toFixed(1)}% avg IRR`,
        ...metricCardBaseProps,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Portfolio Health',
        value: `${portfolioSummary.averageHealthScore.toFixed(0)}%`,
        icon: Activity,
        subtitle: 'Average health score',
        ...metricCardBaseProps,
      },
    },
  ];

  const totalUnrealizedValue = portfolioSummary.totalCurrentValue - portfolioSummary.totalInvested;
  const unrealizedReturn = ((totalUnrealizedValue / portfolioSummary.totalInvested) * 100);

  return (
    <div>
      {/* Header */}
      <PortfolioTabHeader
        title="Portfolio Management"
        description="Real-time insights and performance tracking"
        actions={(
          <>
            <Button
              variant="flat"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>
            <Button
              variant="flat"
              size="sm"
              startContent={<Download className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </>
        )}
      />

      {/* Key Metrics */}
      <MetricsGrid
        items={metricItems}
        columns={{ base: 1, sm: 2, lg: 4 }}
        className="mb-8"
      />

      {/* Performance & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Unrealized Returns */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4">Unrealized Returns</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--app-text-muted)]">Total Unrealized Gain</span>
                <span className="text-lg font-semibold text-[var(--app-success)]">
                  {formatCurrency(totalUnrealizedValue)}
                </span>
              </div>
              <Progress
                value={unrealizedReturn}
                maxValue={200}
                className="mb-1"
                color="success"
                aria-label={`Unrealized return ${unrealizedReturn.toFixed(1)}%`}
              />
              <p className="text-xs text-[var(--app-text-subtle)]">
                {unrealizedReturn.toFixed(1)}% return on deployed capital
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--app-border)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--app-text-muted)] mb-1">Deployed Capital</p>
                  <p className="font-semibold">{formatCurrency(portfolioSummary.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--app-text-muted)] mb-1">Current Value</p>
                  <p className="font-semibold">{formatCurrency(portfolioSummary.totalCurrentValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Asset Allocation */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation by Sector</h3>
          <div className="space-y-3">
            {assetAllocation.map((allocation) => (
              <div key={allocation.sector}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{allocation.sector}</span>
                    <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                      {allocation.count}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold">{allocation.percentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={allocation.percentage}
                  maxValue={100}
                  className="mb-1"
                  aria-label={`${allocation.sector} allocation ${allocation.percentage.toFixed(1)}%`}
                  style={{
                    backgroundColor: 'var(--app-surface-hover)',
                  }}
                />
                <p className="text-xs text-[var(--app-text-subtle)]">
                  {formatCurrency(allocation.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Portfolio Companies Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Portfolio Companies</h3>

        <AdvancedTable
          stateKey="portfolio-dashboard:companies"
          data={filteredCompanies}
          columns={[
            {
              key: 'companyName',
              label: 'Company',
              sortable: true,
              render: (company) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{company.companyName.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{company.companyName}</span>
                </div>
              ),
            },
            {
              key: 'sector',
              label: 'Sector',
              sortable: true,
            },
            {
              key: 'stage',
              label: 'Stage',
              sortable: true,
            },
            {
              key: 'arr',
              label: 'ARR',
              sortable: true,
              align: 'right',
              render: (company) => (
                <div>
                  <div className="font-medium">${(company.arr / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-[var(--app-success)]">+{company.arrGrowth}%</div>
                </div>
              ),
            },
            {
              key: 'currentValuation',
              label: 'Valuation',
              sortable: true,
              align: 'right',
              render: (company) => (
                <span className="font-medium">${(company.currentValuation / 1000000).toFixed(0)}M</span>
              ),
            },
            {
              key: 'ownership',
              label: 'Ownership',
              sortable: true,
              align: 'right',
              render: (company) => (
                <span className="text-sm">{company.ownership.toFixed(1)}%</span>
              ),
            },
            {
              key: 'moic',
              label: 'MOIC',
              sortable: true,
              align: 'right',
              render: (company) => (
                <span className="font-medium">{company.moic.toFixed(1)}x</span>
              ),
            },
            {
              key: 'irr',
              label: 'IRR',
              sortable: true,
              align: 'right',
              render: (company) => (
                <span className="text-sm text-[var(--app-success)]">{company.irr.toFixed(1)}%</span>
              ),
            },
            {
              key: 'runway',
              label: 'Runway',
              sortable: true,
              align: 'right',
              render: (company) => (
                <div>
                  <div className="font-medium">{company.runway}mo</div>
                  <div className="text-xs text-[var(--app-text-muted)]">${(company.burnRate / 1000).toFixed(0)}k/mo</div>
                </div>
              ),
            },
            {
              key: 'healthScore',
              label: 'Health',
              sortable: true,
              align: 'center',
              render: (company) => (
                <div className="flex items-center justify-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getHealthColor(company.healthScore) }}
                  />
                  <span className="text-sm font-medium">{company.healthScore}</span>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              align: 'center',
              render: (company) => (
                <Badge
                  size="sm"
                  variant="flat"
                  className={getStatusBadge(company.status)}
                >
                  {company.status}
                </Badge>
              ),
            },
          ]}
          onRowClick={(company) => console.log('View company:', company.companyName)}
          searchable={true}
          searchPlaceholder="Search companies..."
          searchKeys={['companyName', 'sector', 'stage']}
          exportable={true}
          exportFilename="portfolio-companies.csv"
          pageSize={10}
          showColumnToggle={true}
        />
      </div>
    </div>
  );
}
