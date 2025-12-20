'use client'

import { useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BarChart, Target, Clock, LayoutDashboard } from 'lucide-react';
import { AIInsightsBanner } from './dashboard/ai-insights-banner';
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
import { MetricCard } from '@/components/metric-card';
import { Card, Badge, PageContainer, Breadcrumb, PageHeader, Tabs, Tab } from '@/ui';
import { FundSelector } from '@/components/fund-selector';
import { getRouteConfig } from '@/config/routes';
import { Fund } from '@/types/fund';
import { useAppDispatch } from '@/store/hooks';
import { setQuickActionsOverride } from '@/store/slices/copilotSlice';

const formatCurrency = (amount: number, showDecimals = false) => {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(showDecimals ? 1 : 0)}B`;
  }
  return `$${(amount / 1_000_000).toFixed(showDecimals ? 1 : 0)}M`;
};

export function DashboardV2() {
  const { user } = useAuth();
  const { selectedFund, viewMode, funds, getFundSummary, setSelectedFund, setViewMode } = useFund();
  const dispatch = useAppDispatch();
  const {
    capitalCalls,
    portfolioCompanies,
    quickActions,
    tasks,
    metrics,
  } = useDashboardData();

  // Surface dashboard quick actions inside the AI Copilot sidebar
  useEffect(() => {
    dispatch(setQuickActionsOverride(quickActions));
    return () => {
      dispatch(setQuickActionsOverride(null));
    };
  }, [dispatch, quickActions]);

  const insight = useAIInsights(metrics);
  const summary = getFundSummary();

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
        >
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge size="md" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                {summary.totalFunds} funds
              </Badge>
              <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
                Portfolio: {summary.totalPortfolioCompanies} companies
              </Badge>
            <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
              Total Commitment: {formatCurrency(summary.totalCommitment, true)}
            </Badge>
            <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
              Portfolio Value: {formatCurrency(summary.totalPortfolioValue, true)}
            </Badge>
            <Badge size="md" variant="bordered" className="text-[var(--app-text-muted)] border-[var(--app-border)]">
              Average IRR: {(funds.reduce((sum, f) => sum + f.irr, 0) / funds.length).toFixed(1)}%
            </Badge>
            </div>
          </PageHeader>

        <Tabs
          aria-label="Consolidated dashboard sections"
          variant="underlined"
          defaultSelectedKey="overview"
          classNames={{ tabList: 'px-0 sm:px-0 lg:px-0' }}
        >
          <Tab key="overview" title="Overview">
            <div className="mt-4 space-y-6">
              {/* AI Insights Banner */}
                <AIInsightsBanner insight={insight} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fund Summary Table */}
                <div className="lg:col-span-2">
                  <div className="overflow-x-auto rounded-lg border border-[var(--app-border)]" data-fund-selector-target>
                    <table className="min-w-full text-sm">
                      <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
                        <tr>
                          <th className="py-3 px-4 text-left font-medium">Fund</th>
                          <th className="py-3 px-4 text-left font-medium">Status</th>
                          <th className="py-3 px-4 text-right font-medium">AUM</th>
                          <th className="py-3 px-4 text-right font-medium">Portfolio</th>
                          <th className="py-3 px-4 text-right font-medium">IRR</th>
                          <th className="py-3 px-4 text-right font-medium">TVPI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--app-border)]">
                        {funds.map((fund) => (
                          <tr
                            key={fund.id}
                            onClick={() => handleFundSelect(fund)}
                            className="cursor-pointer hover:bg-[var(--app-surface-hover)] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-[var(--app-text)]">{fund.displayName}</div>
                              <div className="text-xs text-[var(--app-text-subtle)]">Vintage {fund.vintage}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                size="sm"
                                variant="bordered"
                                className={fund.status === 'active' ? 'text-[var(--app-success)] border-[var(--app-success)]' : 'text-[var(--app-text-muted)] border-[var(--app-border)]'}
                              >
                                {fund.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--app-text)]">{formatCurrency(fund.totalCommitment)}</td>
                            <td className="py-3 px-4 text-right text-[var(--app-text)]">{fund.portfolioCount} companies</td>
                            <td className="py-3 px-4 text-right text-[var(--app-success)]">{fund.irr.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-right text-[var(--app-success)]">{fund.tvpi.toFixed(2)}x</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <AITaskPrioritizer tasks={tasks} onTaskClick={(task) => console.log('Task clicked:', task)} />
                </div>
              </div>
            </div>
          </Tab>

          <Tab key="capital-calls" title="Active Capital Calls">
            <div className="mt-4">
              <ActiveCapitalCalls calls={capitalCalls} />
            </div>
          </Tab>

          <Tab key="portfolio-health" title="Portfolio Health">
            <div className="mt-4">
              <PortfolioHealth companies={portfolioCompanies} />
            </div>
          </Tab>
        </Tabs>

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
        actionContent={<FundSelector />}
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

      {/* Fund Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {fundMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="h-8" />
    </PageContainer>
  );
}
