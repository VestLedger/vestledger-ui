'use client'

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, Target, Clock, LayoutDashboard } from 'lucide-react';
import { HomeMorningBrief } from './dashboard/home-morning-brief';
import { HomePriorityMatrix } from './dashboard/home-priority-matrix';
import { HomeFundHealthList } from './dashboard/home-fund-health-list';
import { HomePortfolioHealthList } from './dashboard/home-portfolio-health-list';
import { HomeBlockerBeacon } from './dashboard/home-blocker-beacon';
import { HomeOpportunitiesRail } from './dashboard/home-opportunities-rail';
import { HomeRevenueDistribution } from './dashboard/home-revenue-distribution';
import { HomeARRTrend } from './dashboard/home-arr-trend';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/contexts/auth-context';
import { useFund } from '@/contexts/fund-context';
import { MetricsGrid, PageScaffold } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { Card, Badge } from '@/ui';
import { FundSelector } from '@/components/fund-selector';
import { getRouteConfig, ROUTE_PATHS } from '@/config/routes';
import { useAppDispatch } from '@/store/hooks';
import { setQuickActionsOverride } from '@/store/slices/copilotSlice';
import { patchUIState } from '@/store/slices/uiSlice';
import type { DailyBriefItem, HomeBlocker, HomeOpportunity } from '@/data/mocks/hooks/dashboard-data';
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

const formatStatusLabel = (status: string) => {
  return status
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const formatCountLabel = (count: number, singular: string, plural?: string) => {
  const resolvedPlural = plural ?? `${singular}s`;
  return `${count} ${count === 1 ? singular : resolvedPlural}`;
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
  const router = useRouter();
  const density = useDashboardDensity();
  const sectionTopSpacingClass = density.mode === 'compact' ? 'mt-3' : 'mt-4';
  const fundHeaderBadgeSpacingClass = density.mode === 'compact'
    ? 'flex flex-wrap items-center gap-2 mt-3'
    : 'flex flex-wrap items-center gap-2 mt-4';
  const fundSummaryCardMarginClass = density.mode === 'compact' ? 'mb-4' : 'mb-4';
  const fundSummaryGridGapClass = density.mode === 'compact' ? 'gap-3' : 'gap-4';
  const metricsBottomSpacingClass = density.mode === 'compact' ? 'mb-4' : 'mb-4';
  const { selectedFund, viewMode, funds, getFundSummary, setSelectedFund } = useFund();
  const dispatch = useAppDispatch();
  const {
    quickActions,
    morningBrief,
    dailyBriefItems,
    fundTrustRows,
    portfolioRevenueRows,
    blockers,
    opportunities,
    revenueDistribution,
    portfolioRevenueTrend,
  } = useDashboardData();

  // Surface dashboard quick actions inside the AI Copilot sidebar
  useEffect(() => {
    dispatch(setQuickActionsOverride(quickActions));
    return () => {
      dispatch(setQuickActionsOverride(null));
    };
  }, [dispatch, quickActions]);

  const summary = getFundSummary();

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

  type RouteTarget = {
    route: string;
    tabTarget?: string;
    fundId?: string;
    searchHint?: string;
  };

  const navigateWithContext = (target: RouteTarget) => {
    if (target.route === ROUTE_PATHS.fundAdmin) {
      dispatch(
        patchUIState({
          key: 'back-office-fund-admin',
          patch: { selectedTab: target.tabTarget ?? 'capital-calls', lpStatusFilter: 'all' },
        })
      );
    }

    if (target.fundId) {
      const fund = funds.find((entry) => entry.id === target.fundId);
      if (fund) {
        setSelectedFund(fund);
      }
      dispatch(
        patchUIState({
          key: 'fund-setup',
          patch: {
            selectedFundId: target.fundId,
            searchQuery: '',
            statusFilter: 'all',
          },
        })
      );
    }

    if (target.route === ROUTE_PATHS.portfolio) {
      dispatch(patchUIState({ key: 'portfolio', patch: { selected: 'overview' } }));
      if (target.searchHint) {
        dispatch(
          patchUIState({
            key: 'advanced-table:portfolio-dashboard:companies',
            patch: { searchQuery: target.searchHint, currentPage: 1 },
          })
        );
      }
    }

    router.push(target.route);
  };

  const openFundSetupDetails = (fundId: string) => {
    navigateWithContext({
      route: ROUTE_PATHS.fundAdmin,
      tabTarget: 'fund-setup',
      fundId,
    });
  };

  const openPortfolioDetails = (companyName: string) => {
    navigateWithContext({
      route: ROUTE_PATHS.portfolio,
      searchHint: companyName,
    });
  };

  const openBriefItem = (item: DailyBriefItem) => {
    navigateWithContext(item);
  };

  const openBlocker = (blocker: HomeBlocker) => {
    navigateWithContext(blocker);
  };

  const openOpportunity = (opportunity: HomeOpportunity) => {
    navigateWithContext(opportunity);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSOLIDATED VIEW (No fund selected or consolidated mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'consolidated' || !selectedFund) {
    const routeConfig = getRouteConfig(ROUTE_PATHS.dashboard);
    const totalFundLabel = formatCountLabel(summary.totalFunds, 'fund');
    const trustWatchCount = fundTrustRows.filter((row) => row.riskFlag !== 'stable').length;
    const trustCriticalCount = fundTrustRows.filter((row) => row.riskFlag === 'critical').length;
    const portfolioWatchCount = portfolioRevenueRows.filter((row) => row.riskFlag !== 'stable').length;
    const urgentSignalsCount = dailyBriefItems.filter((item) => item.quadrant.startsWith('urgent')).length;
    const arrNow = portfolioRevenueTrend[portfolioRevenueTrend.length - 1]?.arr ?? 0;

    return (
      <PageScaffold
        containerProps={{ className: 'gp-home-skin' }}
        breadcrumbs={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
        aiSuggestion={routeConfig?.aiSuggestion}
        header={{
          title: 'GP Command Center',
          description: `Revenue makers and LP trust across ${totalFundLabel}`,
          icon: LayoutDashboard,
          aiSummary: {
            text: morningBrief.summary,
            confidence: morningBrief.confidence,
          },
          actionContent: (
            <HomeBlockerBeacon blockers={blockers} onBlockerClick={openBlocker} />
          ),
          badges: [
            {
              label: `$${arrNow}M ARR`,
              size: 'md',
              variant: 'flat',
              className: 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
            },
            {
              label: `${morningBrief.itemCount} signals / 7d`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `${urgentSignalsCount} urgent`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-warning)] border-[var(--app-warning)]/45',
            },
            {
              label: `${trustWatchCount} trust watch / ${portfolioWatchCount} portfolio watch`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
          ],
        }}
      >
        <div className={`gp-home-content ${sectionTopSpacingClass} ${density.page.sectionStackClass}`}>
          <HomeMorningBrief brief={morningBrief} />

          <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]" data-testid="gp-home-signals-tape">
            <div className="grid grid-cols-2 gap-px bg-[var(--app-border)] lg:grid-cols-5">
              <div className="bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">Urgent now</p>
                <p className="text-sm font-semibold text-[var(--app-danger)]">{urgentSignalsCount}</p>
              </div>
              <div className="bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">LP trust critical</p>
                <p className="text-sm font-semibold text-[var(--app-warning)]">{trustCriticalCount}</p>
              </div>
              <div className="bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">Blockers</p>
                <p className="text-sm font-semibold text-[var(--app-warning)]">{blockers.length}</p>
              </div>
              <div className="bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">Revenue makers</p>
                <p className="text-sm font-semibold text-[var(--app-success)]">{portfolioRevenueRows.length}</p>
              </div>
              <div className="bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">Opportunities</p>
                <p className="text-sm font-semibold text-[var(--app-info)]">{opportunities.length}</p>
              </div>
            </div>
          </section>

          <div className={`grid grid-cols-1 ${density.page.blockGapClass} xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]`}>
            <HomePriorityMatrix items={dailyBriefItems} onItemClick={openBriefItem} />
            <HomeOpportunitiesRail opportunities={opportunities} onOpportunityClick={openOpportunity} />
          </div>

          <div className={`grid grid-cols-1 ${density.page.blockGapClass} xl:grid-cols-[minmax(0,1.38fr)_minmax(0,1fr)]`} data-testid="gp-home-portfolio-lane">
            <HomePortfolioHealthList rows={portfolioRevenueRows} onRowClick={openPortfolioDetails} />
            <div className={`grid grid-cols-1 ${density.page.blockGapClass}`}>
              <HomeRevenueDistribution slices={revenueDistribution} />
              <HomeARRTrend points={portfolioRevenueTrend} />
            </div>
          </div>

          <div data-testid="gp-home-fund-lane">
            <HomeFundHealthList rows={fundTrustRows} onRowClick={openFundSetupDetails} />
          </div>
        </div>

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
        description: selectedFund.description || 'Performance, deployment, and portfolio metrics',
        icon: LayoutDashboard,
        aiSummary: {
          text: `${formatCurrency(selectedFund.totalCommitment)} committed across ${formatCountLabel(selectedFund.portfolioCount, 'portfolio company', 'portfolio companies')}. ${((selectedFund.deployedCapital / selectedFund.totalCommitment) * DASHBOARD_PERCENT_SCALE).toFixed(0)}% deployed. IRR ${selectedFund.irr.toFixed(1)}%, TVPI ${selectedFund.tvpi.toFixed(2)}x, DPI ${selectedFund.dpi.toFixed(2)}x.`,
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
              {formatStatusLabel(selectedFund.status)}
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
