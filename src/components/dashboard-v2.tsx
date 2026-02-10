'use client'

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DollarSign, Users, Target, Clock, LayoutDashboard } from 'lucide-react';
import { AIInsightsBanner } from './dashboard/ai-insights-banner';
import { ActiveCapitalCalls } from './dashboard/active-capital-calls';
import { PortfolioHealth } from './dashboard/portfolio-health';
import { AITaskPrioritizer } from './dashboard/ai-task-prioritizer';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { useAuth } from '@/contexts/auth-context';
import { useFund } from '@/contexts/fund-context';
import { MetricsGrid, PageScaffold } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { Card, Badge } from '@/ui';
import { FundSelector } from '@/components/fund-selector';
import { getRouteConfig, ROUTE_PATHS } from '@/config/routes';
import { Fund } from '@/types/fund';
import { useAppDispatch } from '@/store/hooks';
import { setQuickActionsOverride } from '@/store/slices/copilotSlice';
import { useUIKey } from '@/store/ui';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

const DASHBOARD_PERCENT_SCALE = 100;
const BILLION_VALUE = 1_000_000_000;
const MILLION_VALUE = 1_000_000;
const FUND_METRIC_CHANGE_DEFAULTS = {
  activeDeals: '+12%',
  portfolioValue: '+8.3%',
  portfolioCompanies: '+3',
} as const;

const formatCurrency = (amount: number, showDecimals = false) => {
  if (amount >= BILLION_VALUE) {
    return `$${(amount / BILLION_VALUE).toFixed(showDecimals ? 1 : 0)}B`;
  }
  return `$${(amount / MILLION_VALUE).toFixed(showDecimals ? 1 : 0)}M`;
};

const DashboardLoading = () => (
  <div className="p-4 space-y-4 animate-pulse">
    <div className="h-6 w-48 rounded bg-[var(--app-surface-hover)]" />
    <div className="h-4 w-72 rounded bg-[var(--app-surface-hover)]" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
      <div className="h-32 rounded bg-[var(--app-surface-hover)]" />
    </div>
  </div>
);

const AnalystDashboard = dynamic(
  () => import('@/components/dashboards/analyst-dashboard').then((mod) => mod.AnalystDashboard),
  { loading: () => <DashboardLoading /> }
);
const OpsDashboard = dynamic(
  () => import('@/components/dashboards/ops-dashboard').then((mod) => mod.OpsDashboard),
  { loading: () => <DashboardLoading /> }
);
const IRDashboard = dynamic(
  () => import('@/components/dashboards/ir-dashboard').then((mod) => mod.IRDashboard),
  { loading: () => <DashboardLoading /> }
);
const ResearcherDashboard = dynamic(
  () => import('@/components/dashboards/researcher-dashboard').then((mod) => mod.ResearcherDashboard),
  { loading: () => <DashboardLoading /> }
);
const LPDashboard = dynamic(
  () => import('@/components/dashboards/lp-dashboard').then((mod) => mod.LPDashboard),
  { loading: () => <DashboardLoading /> }
);
const AuditorDashboard = dynamic(
  () => import('@/components/dashboards/auditor-dashboard').then((mod) => mod.AuditorDashboard),
  { loading: () => <DashboardLoading /> }
);

export function DashboardV2() {
  const { user } = useAuth();
  const density = useDashboardDensity();
  const sectionTopSpacingClass = density.mode === 'compact' ? 'mt-3' : 'mt-4';
  const fundHeaderBadgeSpacingClass = density.mode === 'compact'
    ? 'flex flex-wrap items-center gap-2 mt-3'
    : 'flex flex-wrap items-center gap-2 mt-4';
  const fundSummaryCardMarginClass = density.mode === 'compact' ? 'mb-4' : 'mb-4';
  const fundSummaryGridGapClass = density.mode === 'compact' ? 'gap-3' : 'gap-4';
  const metricsBottomSpacingClass = density.mode === 'compact' ? 'mb-4' : 'mb-4';
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
  const { value: consolidatedUI, patch: patchConsolidatedUI } = useUIKey('dashboard-consolidated-tabs', {
    activeTab: 'overview',
  });

  // Role-based view switching (non-GP roles get their own dashboards)
  switch (user?.role) {
    case 'analyst':
      return <AnalystDashboard />;
    case 'ops':
      return <OpsDashboard />;
    case 'ir':
      return <IRDashboard />;
    case 'researcher':
      return <ResearcherDashboard />;
    case 'lp':
      return <LPDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
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

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSOLIDATED VIEW (No fund selected or consolidated mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'consolidated' || !selectedFund) {
    const routeConfig = getRouteConfig(ROUTE_PATHS.dashboard);
    const activeTab = consolidatedUI.activeTab ?? 'overview';
    const consolidatedTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'capital-calls', label: 'Active Capital Calls' },
      { id: 'portfolio-health', label: 'Portfolio Health' },
    ];

    return (
      <PageScaffold
        breadcrumbs={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
        aiSuggestion={routeConfig?.aiSuggestion}
        header={{
          title: 'Consolidated View',
          description: `Overview across all ${summary.totalFunds} funds`,
          icon: LayoutDashboard,
          aiSummary: {
            text: `Managing ${summary.totalFunds} funds with ${formatCurrency(summary.totalCommitment)} total AUM. Portfolio of ${summary.totalPortfolioCompanies} companies valued at ${formatCurrency(summary.totalPortfolioValue)}. Average fund IRR: ${(funds.reduce((sum, f) => sum + f.irr, 0) / funds.length).toFixed(1)}%`,
            confidence: 0.94,
          },
          badges: [
            {
              label: `${summary.totalFunds} funds`,
              size: 'md',
              variant: 'flat',
              className: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
            },
            {
              label: `Portfolio: ${summary.totalPortfolioCompanies} companies`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `Total Commitment: ${formatCurrency(summary.totalCommitment, true)}`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `Portfolio Value: ${formatCurrency(summary.totalPortfolioValue, true)}`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `Average IRR: ${(funds.reduce((sum, f) => sum + f.irr, 0) / funds.length).toFixed(1)}%`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
          ],
          tabs: consolidatedTabs,
          activeTab,
          onTabChange: (tabId) => patchConsolidatedUI({ activeTab: tabId }),
        }}
      >

        {activeTab === 'overview' && (
          <div className={`${sectionTopSpacingClass} ${density.page.sectionStackClass}`}>
            {/* AI Insights Banner */}
            <AIInsightsBanner insight={insight} />

            <div className={`grid grid-cols-1 lg:grid-cols-3 ${density.page.blockGapClass}`}>
              {/* Fund Summary Table */}
              <div className="lg:col-span-2">
                <div className="overflow-x-auto rounded-lg border border-[var(--app-border)]" data-fund-selector-target>
                  <table className="min-w-full text-sm">
                    <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
                      <tr>
                        <th className={`${density.table.headerCellClass} text-left font-medium`}>Fund</th>
                        <th className={`${density.table.headerCellClass} text-left font-medium`}>Status</th>
                        <th className={`${density.table.headerCellClass} text-right font-medium`}>AUM</th>
                        <th className={`${density.table.headerCellClass} text-right font-medium`}>Portfolio</th>
                        <th className={`${density.table.headerCellClass} text-right font-medium`}>IRR</th>
                        <th className={`${density.table.headerCellClass} text-right font-medium`}>TVPI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--app-border)]">
                      {funds.map((fund) => (
                        <tr
                          key={fund.id}
                          onClick={() => handleFundSelect(fund)}
                          className="cursor-pointer hover:bg-[var(--app-surface-hover)] transition-colors"
                        >
                          <td className={density.table.bodyCellClass}>
                            <div className="font-medium text-[var(--app-text)]">{fund.displayName}</div>
                            <div className="text-xs text-[var(--app-text-subtle)]">Vintage {fund.vintage}</div>
                          </td>
                          <td className={density.table.bodyCellClass}>
                            <Badge
                              size="sm"
                              variant="bordered"
                              className={fund.status === 'active' ? 'text-[var(--app-success)] border-[var(--app-success)]' : 'text-[var(--app-text-muted)] border-[var(--app-border)]'}
                            >
                              {fund.status}
                            </Badge>
                          </td>
                          <td className={`${density.table.bodyCellClass} text-right text-[var(--app-text)]`}>{formatCurrency(fund.totalCommitment)}</td>
                          <td className={`${density.table.bodyCellClass} text-right text-[var(--app-text)]`}>{fund.portfolioCount} companies</td>
                          <td className={`${density.table.bodyCellClass} text-right text-[var(--app-success)]`}>{fund.irr.toFixed(1)}%</td>
                          <td className={`${density.table.bodyCellClass} text-right text-[var(--app-success)]`}>{fund.tvpi.toFixed(2)}x</td>
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
        )}

        {activeTab === 'capital-calls' && (
          <div className={sectionTopSpacingClass}>
            <ActiveCapitalCalls calls={capitalCalls} />
          </div>
        )}

        {activeTab === 'portfolio-health' && (
          <div className={sectionTopSpacingClass}>
            <PortfolioHealth companies={portfolioCompanies} />
          </div>
        )}

        <div className={density.spacer.pageBottomClass} />
      </PageScaffold>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INDIVIDUAL FUND VIEW (Fund is selected)
  // ─────────────────────────────────────────────────────────────────────────────
  const routeConfig = getRouteConfig(ROUTE_PATHS.dashboard);

  const fundMetrics = [
    {
      label: 'Active Deals',
      value: selectedFund.activeDeals.toString(),
      change: FUND_METRIC_CHANGE_DEFAULTS.activeDeals,
      trend: 'up' as const,
      icon: Target,
    },
    {
      label: 'Portfolio Value',
      value: formatCurrency(selectedFund.portfolioValue),
      change: FUND_METRIC_CHANGE_DEFAULTS.portfolioValue,
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      label: 'Deployed Capital',
      value: formatCurrency(selectedFund.deployedCapital),
      change: `${((selectedFund.deployedCapital / selectedFund.totalCommitment) * DASHBOARD_PERCENT_SCALE).toFixed(0)}%`,
      trend: 'up' as const,
      icon: Clock,
    },
    {
      label: 'Portfolio Companies',
      value: selectedFund.portfolioCount.toString(),
      change: FUND_METRIC_CHANGE_DEFAULTS.portfolioCompanies,
      trend: 'up' as const,
      icon: Users,
    },
  ];

  const fundMetricItems: MetricsGridItem[] = fundMetrics.map((metric) => ({
    type: 'metric',
    props: metric,
  }));

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
      aiSuggestion={routeConfig?.aiSuggestion}
      header={{
        title: selectedFund.name,
        description: selectedFund.description || 'Fund performance and metrics',
        icon: LayoutDashboard,
        aiSummary: {
          text: `${formatCurrency(selectedFund.totalCommitment)} fund with ${selectedFund.portfolioCount} portfolio companies. ${((selectedFund.deployedCapital / selectedFund.totalCommitment) * DASHBOARD_PERCENT_SCALE).toFixed(0)}% deployed. IRR: ${selectedFund.irr.toFixed(1)}%, TVPI: ${selectedFund.tvpi.toFixed(2)}x, DPI: ${selectedFund.dpi.toFixed(2)}x`,
          confidence: 0.96,
        },
        actionContent: <FundSelector />,
        children: (
          <div className={fundHeaderBadgeSpacingClass}>
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
        ),
      }}
    >

      {/* Fund Performance Summary Card */}
      <Card padding="md" className={`bg-gradient-to-br from-[var(--app-primary-bg)] to-[var(--app-surface)] ${fundSummaryCardMarginClass}`}>
        <div className={`grid grid-cols-2 sm:grid-cols-4 ${fundSummaryGridGapClass}`}>
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
      <MetricsGrid
        items={fundMetricItems}
        columns={{ base: 1, sm: 2, lg: 4 }}
        className={metricsBottomSpacingClass}
      />

      <div className={density.spacer.pageBottomClass} />
    </PageScaffold>
  );
}
