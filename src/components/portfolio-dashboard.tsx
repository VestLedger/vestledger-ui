'use client'

import { useState } from 'react';
import { Card, Badge, Button, Progress, PageContainer } from '@/ui';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Target,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
} from 'lucide-react';
import {
  portfolioCompanies,
  portfolioSummary,
  performanceData,
  assetAllocation,
} from '@/data/mock-portfolio-data';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  subtitle?: string;
}

function MetricCard({ title, value, change, trend, icon, subtitle }: MetricCardProps) {
  return (
    <Card padding="md" className="hover:border-[var(--app-primary)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]">
          <div className="text-white">{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--app-text-muted)] mb-1">{title}</p>
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--app-text-subtle)]">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}

interface CompanyRowProps {
  company: typeof portfolioCompanies[0];
  onClick: () => void;
}

function CompanyRow({ company, onClick }: CompanyRowProps) {
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

  return (
    <Card
      padding="md"
      className="hover:bg-[var(--app-surface-hover)] transition-all cursor-pointer hover:border-[var(--app-primary)]"
      isPressable
      onPress={onClick}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Company Info */}
        <div className="col-span-12 sm:col-span-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">{company.companyName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{company.companyName}</p>
            <p className="text-xs text-[var(--app-text-muted)]">{company.sector} • {company.stage}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">ARR</p>
          <p className="font-semibold">${(company.arr / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-[var(--app-success)]">+{company.arrGrowth}%</p>
        </div>

        <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Valuation</p>
          <p className="font-semibold">${(company.currentValuation / 1000000).toFixed(0)}M</p>
          <p className="text-xs text-[var(--app-text-muted)]">{company.ownership.toFixed(1)}% ownership</p>
        </div>

        <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">MOIC / IRR</p>
          <p className="font-semibold">{company.moic.toFixed(1)}x</p>
          <p className="text-xs text-[var(--app-success)]">{company.irr.toFixed(1)}%</p>
        </div>

        <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Runway</p>
          <p className="font-semibold">{company.runway} months</p>
          <p className="text-xs text-[var(--app-text-muted)]">${(company.burnRate / 1000).toFixed(0)}k/mo burn</p>
        </div>

        {/* Health & Status */}
        <div className="col-span-12 sm:col-span-1 flex sm:flex-col gap-2 justify-center items-center">
          <Badge
            size="sm"
            variant="flat"
            className={getStatusBadge(company.status)}
          >
            {company.status}
          </Badge>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getHealthColor(company.healthScore) }}
            />
            <span className="text-xs font-medium">{company.healthScore}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PortfolioDashboard() {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredCompanies = portfolioCompanies.filter(company => {
    const sectorMatch = selectedSector === 'all' || company.sector === selectedSector;
    const stageMatch = selectedStage === 'all' || company.stage === selectedStage;
    return sectorMatch && stageMatch;
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const totalUnrealizedValue = portfolioSummary.totalCurrentValue - portfolioSummary.totalInvested;
  const unrealizedReturn = ((totalUnrealizedValue / portfolioSummary.totalInvested) * 100);

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Portfolio Management</h2>
          <p className="text-sm sm:text-base text-[var(--app-text-muted)]">
            Real-time insights and performance tracking
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolioSummary.totalCurrentValue)}
          change={12.5}
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={`${formatCurrency(portfolioSummary.totalInvested)} deployed`}
        />
        <MetricCard
          title="Active Companies"
          value={portfolioSummary.activeCompanies.toString()}
          icon={<Briefcase className="w-5 h-5" />}
          subtitle={`${portfolioCompanies.length} total investments`}
        />
        <MetricCard
          title="Average MOIC"
          value={`${portfolioSummary.averageMOIC.toFixed(1)}x`}
          change={8.3}
          trend="up"
          icon={<Target className="w-5 h-5" />}
          subtitle={`${portfolioSummary.averageIRR.toFixed(1)}% avg IRR`}
        />
        <MetricCard
          title="Portfolio Health"
          value={`${portfolioSummary.averageHealthScore.toFixed(0)}%`}
          change={4.2}
          trend="up"
          icon={<Activity className="w-5 h-5" />}
          subtitle="Average health score"
        />
      </div>

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

      {/* Portfolio Companies List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Portfolio Companies</h3>
          <div className="flex gap-2">
            <select
              className="text-sm px-3 py-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="all">All Stages</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCompanies.map((company) => (
            <CompanyRow
              key={company.id}
              company={company}
              onClick={() => console.log('View company:', company.companyName)}
            />
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <Card padding="lg" className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--app-text-subtle)]" />
            <p className="text-[var(--app-text-muted)]">No companies match your filters</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
