'use client'

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, Target, Clock, LayoutDashboard } from 'lucide-react';
import { HomeMorningBrief } from './dashboard/home-morning-brief';
import { HomePriorityMatrix } from './dashboard/home-priority-matrix';
import { HomeFundHealthList } from './dashboard/home-fund-health-list';
import { HomePortfolioHealthList } from './dashboard/home-portfolio-health-list';
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
import type { DailyBriefItem } from '@/data/mocks/hooks/dashboard-data';
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
  const { selectedFund, viewMode, funds, getFundSummary, setSelectedFund, setViewMode } = useFund();
  const dispatch = useAppDispatch();
  const {
    quickActions,
    morningBrief,
    dailyBriefItems,
    fundHealthRows,
    portfolioSignals,
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

  const openFundSetupDetails = (fundId: string) => {
    const fund = funds.find((entry) => entry.id === fundId);
    if (fund) {
      setSelectedFund(fund);
      setViewMode('individual');
    }
    dispatch(patchUIState({ key: 'back-office-fund-admin', patch: { selectedTab: 'fund-setup' } }));
    dispatch(patchUIState({ key: 'fund-setup', patch: { selectedFundId: fundId } }));
    router.push(ROUTE_PATHS.fundAdmin);
  };

  const openPortfolioDetails = (companyName: string) => {
    dispatch(patchUIState({ key: 'portfolio', patch: { selected: 'overview' } }));
    dispatch(
      patchUIState({
        key: 'advanced-table:portfolio-dashboard:companies',
        patch: { searchQuery: companyName, currentPage: 1 },
      })
    );
    router.push(ROUTE_PATHS.portfolio);
  };

  const openBriefItem = (item: DailyBriefItem) => {
    if (item.fundId) {
      const fund = funds.find((entry) => entry.id === item.fundId);
      if (fund) {
        setSelectedFund(fund);
        setViewMode('individual');
      }
    }

    if (item.route === ROUTE_PATHS.fundAdmin) {
      dispatch(
        patchUIState({
          key: 'back-office-fund-admin',
          patch: { selectedTab: item.tabTarget ?? 'capital-calls' },
        })
      );
    }

    if (item.route === ROUTE_PATHS.portfolio) {
      dispatch(patchUIState({ key: 'portfolio', patch: { selected: 'overview' } }));
      if (item.searchHint) {
        dispatch(
          patchUIState({
            key: 'advanced-table:portfolio-dashboard:companies',
            patch: { searchQuery: item.searchHint, currentPage: 1 },
          })
        );
      }
    }

    router.push(item.route);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSOLIDATED VIEW (No fund selected or consolidated mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'consolidated' || !selectedFund) {
    const routeConfig = getRouteConfig(ROUTE_PATHS.dashboard);
    const totalFundLabel = formatCountLabel(summary.totalFunds, 'fund');
    const watchFundCount = fundHealthRows.filter((row) => row.riskFlag !== 'stable').length;
    const watchPortfolioCount = portfolioSignals.filter((row) => row.riskFlag !== 'stable').length;

    return (
      <PageScaffold
        breadcrumbs={routeConfig?.breadcrumbs || [{ label: 'Dashboard' }]}
        aiSuggestion={routeConfig?.aiSuggestion}
        header={{
          title: 'GP Home',
          description: `Decision and health view across ${totalFundLabel}`,
          icon: LayoutDashboard,
          aiSummary: {
            text: morningBrief.summary,
            confidence: morningBrief.confidence,
          },
          badges: [
            {
              label: `${morningBrief.itemCount} items in 7d`,
              size: 'md',
              variant: 'flat',
              className: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
            },
            {
              label: `${morningBrief.urgentCount} urgent`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `${watchFundCount} funds on watch`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
            {
              label: `${watchPortfolioCount} companies on watch`,
              size: 'md',
              variant: 'bordered',
              className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
            },
          ],
        }}
      >
        <div className={`${sectionTopSpacingClass} ${density.page.sectionStackClass}`}>
          <HomeMorningBrief brief={morningBrief} />
          <HomePriorityMatrix items={dailyBriefItems} onItemClick={openBriefItem} />

          <div className={`grid grid-cols-1 xl:grid-cols-2 ${density.page.blockGapClass}`}>
            <HomeFundHealthList rows={fundHealthRows} onRowClick={openFundSetupDetails} />
            <HomePortfolioHealthList rows={portfolioSignals} onRowClick={openPortfolioDetails} />
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
