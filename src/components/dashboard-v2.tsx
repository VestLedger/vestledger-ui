'use client'

import { Layers, DollarSign, TrendingUp, Users, BarChart, Target, Clock, LayoutDashboard } from 'lucide-react';
import { AIInsightsBanner } from './dashboard/ai-insights-banner';
import { AlertBar } from './dashboard/alert-bar';
import { QuickActions } from './dashboard/quick-actions';
import { ActiveCapitalCalls } from './dashboard/active-capital-calls';
import { PortfolioHealth } from './dashboard/portfolio-health';
import { AITaskPrioritizer } from './dashboard/ai-task-prioritizer';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { useAuth } from '@/contexts/auth-context';
import { useFund } from '@/contexts/fund-context';
import { AnalystDashboard } from '@/components/dashboards/analyst-dashboard';
import { OpsDashboard } from '@/components/dashboards/ops-dashboard';
import { IRDashboard } from '@/components/dashboards/ir-dashboard';
import { ResearcherDashboard } from '@/components/dashboards/researcher-dashboard';
import { LPDashboard } from '@/components/dashboards/lp-dashboard';
import { AuditorDashboard } from '@/components/dashboards/auditor-dashboard';
import { FundSelector } from '@/components/fund-selector';
import { MetricCard } from '@/components/metric-card';
import { Card, Badge, Button, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import { getRouteConfig } from '@/config/routes';
import { Fund } from '@/types/fund';

const formatCurrency = (amount: number, showDecimals = false) => {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(showDecimals ? 1 : 0)}B`;
  }
  return `$${(amount / 1_000_000).toFixed(showDecimals ? 1 : 0)}M`;
};

export function DashboardV2() {
  const { user } = useAuth();
  const { selectedFund, viewMode, funds, getFundSummary, setSelectedFund, setViewMode } = useFund();

  // Role-based view switching (non-GP roles get their own dashboards)
  switch (user?.role) {
    case 'analyst':
      return <PageContainer padding="none"><AnalystDashboard /></PageContainer>;
    case 'ops':
      return <PageContainer padding="none"><OpsDashboard /></PageContainer>;
    case 'ir':
      return <PageContainer padding="none"><IRDashboard /></PageContainer>;
    case 'researcher':
      return <PageContainer padding="none"><ResearcherDashboard /></PageContainer>;
    case 'lp':
      return <PageContainer padding="none"><LPDashboard /></PageContainer>;
    case 'auditor':
      return <PageContainer padding="none"><AuditorDashboard /></PageContainer>;
    case 'service_provider':
    case 'strategic_partner':
    default:
      // GP and default fall through to fund-aware dashboard below
      break;
  }

  const {
    capitalCalls,
    portfolioCompanies,
    alerts,
    quickActions,
    tasks,
    metrics,
  } = useDashboardData();

  const insight = useAIInsights(metrics);
  const summary = getFundSummary();

  const handleFundSelect = (fund: Fund | null) => {
    setSelectedFund(fund);
    if (fund) {
      setViewMode('individual');
    }
  };

  const handleConsolidatedView = () => {
    setSelectedFund(null);
    setViewMode('consolidated');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSOLIDATED VIEW (No fund selected or consolidated mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'consolidated' || !selectedFund) {
    const routeConfig = getRouteConfig('/dashboard');

    const consolidatedMetrics = [
      {
        label: 'Total AUM',
        value: formatCurrency(summary.totalCommitment),
        change: '+12%',
        trend: 'up' as const,
        icon: DollarSign,
      },
      {
        label: 'Portfolio Value',
        value: formatCurrency(summary.totalPortfolioValue),
        change: '+8.3%',
        trend: 'up' as const,
        icon: TrendingUp,
      },
      {
        label: 'Portfolio Companies',
        value: summary.totalPortfolioCompanies.toString(),
        change: '+3',
        trend: 'up' as const,
        icon: Users,
      },
      {
        label: 'Avg IRR',
        value: `${summary.averageIRR.toFixed(1)}%`,
        change: '+2.1%',
        trend: 'up' as const,
        icon: BarChart,
      },
    ];

    return (
      <PageContainer>
        {/* Breadcrumb and Page Header */}
        <Breadcrumb
          items={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
          aiSuggestion={routeConfig?.aiSuggestion}
        />
        <PageHeader
          title="Consolidated View"
          description={`Overview across all ${summary.totalFunds} funds`}
          icon={LayoutDashboard}
          aiSummary={{
            text: `Managing ${summary.totalFunds} funds with ${formatCurrency(summary.totalCommitment)} total AUM. Portfolio of ${summary.totalPortfolioCompanies} companies valued at ${formatCurrency(summary.totalPortfolioValue)}. Average fund IRR: ${(funds.reduce((sum, f) => sum + f.irr, 0) / funds.length).toFixed(1)}%`,
            confidence: 0.94
          }}
          secondaryActions={[
            {
              label: 'Select Fund',
              onClick: () => {
                // Open fund selector modal or scroll to fund cards
                const fundCardsElement = document.querySelector('[data-fund-selector-target]');
                if (fundCardsElement) {
                  fundCardsElement.scrollIntoView({ behavior: 'smooth' });
                }
              },
            },
          ]}
        />

        {/* Fund Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {funds.map((fund) => (
            <Card
              key={fund.id}
              padding="md"
              className="hover:border-[var(--app-primary)] transition-colors cursor-pointer"
              onClick={() => handleFundSelect(fund)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-medium mb-1">{fund.displayName}</h3>
                  <Badge
                    size="sm"
                    variant="bordered"
                    className={fund.status === 'active' ? 'text-[var(--app-success)] border-[var(--app-success)]' : 'text-[var(--app-text-muted)] border-[var(--app-border)]'}
                  >
                    {fund.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--app-text-muted)]">IRR</div>
                  <div className="text-lg text-[var(--app-success)]">{fund.irr.toFixed(1)}%</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--app-text-muted)]">AUM</span>
                  <span>{formatCurrency(fund.totalCommitment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--app-text-muted)]">Portfolio</span>
                  <span>{fund.portfolioCount} companies</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--app-text-muted)]">TVPI</span>
                  <span className="text-[var(--app-success)]">{fund.tvpi.toFixed(2)}x</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* AI Insights Banner */}
        <AIInsightsBanner insight={insight} />

        {/* Alert Bar */}
        <AlertBar alerts={alerts} maxVisible={3} />

        {/* Consolidated Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {consolidatedMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActiveCapitalCalls calls={capitalCalls} />
            <PortfolioHealth companies={portfolioCompanies} />
          </div>
          <div className="space-y-6">
            <AITaskPrioritizer tasks={tasks} onTaskClick={(task) => console.log('Task clicked:', task)} />
          </div>
        </div>

        <div className="h-8" />
      </PageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INDIVIDUAL FUND VIEW (Fund is selected)
  // ─────────────────────────────────────────────────────────────────────────────
  const routeConfig = getRouteConfig('/dashboard');

  const fundMetrics = [
    {
      label: 'Active Deals',
      value: selectedFund.activeDeals.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Target,
    },
    {
      label: 'Portfolio Value',
      value: formatCurrency(selectedFund.portfolioValue),
      change: '+8.3%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      label: 'Deployed Capital',
      value: formatCurrency(selectedFund.deployedCapital),
      change: `${((selectedFund.deployedCapital / selectedFund.totalCommitment) * 100).toFixed(0)}%`,
      trend: 'up' as const,
      icon: Clock,
    },
    {
      label: 'Portfolio Companies',
      value: selectedFund.portfolioCount.toString(),
      change: '+3',
      trend: 'up' as const,
      icon: Users,
    },
  ];

  return (
    <PageContainer>
      {/* Breadcrumb and Page Header */}
      <Breadcrumb
        items={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
        aiSuggestion={routeConfig?.aiSuggestion}
      />
      <PageHeader
        title={selectedFund.name}
        description={selectedFund.description || 'Fund performance and metrics'}
        icon={LayoutDashboard}
        aiSummary={{
          text: `${formatCurrency(selectedFund.totalCommitment)} fund with ${selectedFund.portfolioCount} portfolio companies. ${((selectedFund.deployedCapital / selectedFund.totalCommitment) * 100).toFixed(0)}% deployed. IRR: ${selectedFund.irr.toFixed(1)}%, TVPI: ${selectedFund.tvpi.toFixed(2)}x, DPI: ${selectedFund.dpi.toFixed(2)}x`,
          confidence: 0.96
        }}
        secondaryActions={[
          {
            label: 'View all funds',
            onClick: handleConsolidatedView,
          },
        ]}
      >
        {/* Fund Status and Vintage Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge
            size="md"
            variant="bordered"
            className={selectedFund.status === 'active' ? 'text-[var(--app-success)] border-[var(--app-success)]' : 'text-[var(--app-text-muted)] border-[var(--app-border)]'}
          >
            {selectedFund.status}
          </Badge>
          <Badge size="md" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
            Vintage {selectedFund.vintage}
          </Badge>
          <div className="flex-1 text-right">
            <FundSelector />
          </div>
        </div>
      </PageHeader>

      {/* Fund Performance Summary Card */}
      <Card padding="md" className="bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-surface)] mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">Total Commitment</div>
            <div className="text-xl sm:text-2xl font-medium">{formatCurrency(selectedFund.totalCommitment, true)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">IRR</div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--app-success)]">{selectedFund.irr.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">TVPI</div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--app-success)]">{selectedFund.tvpi.toFixed(2)}x</div>
          </div>
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">DPI</div>
            <div className="text-xl sm:text-2xl font-medium">{selectedFund.dpi.toFixed(2)}x</div>
          </div>
        </div>
      </Card>

      {/* AI Insights Banner */}
      <AIInsightsBanner insight={insight} />

      {/* Alert Bar */}
      <AlertBar alerts={alerts} maxVisible={3} />

      {/* Fund Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {fundMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActiveCapitalCalls calls={capitalCalls} />
          <PortfolioHealth companies={portfolioCompanies} />
        </div>
        <div className="space-y-6">
          <AITaskPrioritizer tasks={tasks} onTaskClick={(task) => console.log('Task clicked:', task)} />
        </div>
      </div>

      <div className="h-8" />
    </PageContainer>
  );
}
