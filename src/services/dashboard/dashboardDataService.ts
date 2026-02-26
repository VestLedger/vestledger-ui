import { isMockMode } from '@/config/data-mode';
import type { DashboardData as SeedDashboardData } from '@/data/seeds/hooks/dashboard-data';
import { requestJson } from '@/services/shared/httpClient';
import type { Fund, FundViewMode } from '@/types/fund';

export type DashboardData = SeedDashboardData;

export function createEmptyDashboardData(): DashboardData {
  return {
    capitalCalls: [],
    portfolioCompanies: [],
    alerts: [],
    quickActions: [],
    tasks: [],
    morningBrief: {
      summary: '',
      confidence: 0,
      asOf: new Date(),
      horizonDays: 7,
      itemCount: 0,
      urgentCount: 0,
      importantCount: 0,
    },
    dailyBriefItems: [],
    fundHealthRows: [],
    portfolioSignals: [],
    fundTrustRows: [],
    portfolioRevenueRows: [],
    blockers: [],
    opportunities: [],
    revenueDistribution: [],
    portfolioRevenueTrend: [],
    metrics: {
      overdueCapitalCalls: 0,
      upcomingDeadlines: 0,
      atRiskCompanies: 0,
      healthyCompanies: 0,
      totalTasks: 0,
      urgentTasks: 0,
    },
    selectedFundName: '',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeDashboardPayload(payload: unknown): DashboardData {
  const base = createEmptyDashboardData();
  if (!isRecord(payload)) return base;

  const metrics = isRecord(payload.metrics) ? payload.metrics : {};
  const morningBrief = isRecord(payload.morningBrief) ? payload.morningBrief : {};

  return {
    capitalCalls: ensureArray(payload.capitalCalls),
    portfolioCompanies: ensureArray(payload.portfolioCompanies),
    alerts: ensureArray(payload.alerts),
    quickActions: ensureArray(payload.quickActions),
    tasks: ensureArray(payload.tasks),
    morningBrief: {
      summary: typeof morningBrief.summary === 'string' ? morningBrief.summary : '',
      confidence:
        typeof morningBrief.confidence === 'number' && Number.isFinite(morningBrief.confidence)
          ? morningBrief.confidence
          : 0,
      asOf:
        typeof morningBrief.asOf === 'string' || morningBrief.asOf instanceof Date
          ? new Date(morningBrief.asOf)
          : new Date(),
      horizonDays:
        typeof morningBrief.horizonDays === 'number' && Number.isFinite(morningBrief.horizonDays)
          ? morningBrief.horizonDays
          : 7,
      itemCount:
        typeof morningBrief.itemCount === 'number' && Number.isFinite(morningBrief.itemCount)
          ? morningBrief.itemCount
          : 0,
      urgentCount:
        typeof morningBrief.urgentCount === 'number' && Number.isFinite(morningBrief.urgentCount)
          ? morningBrief.urgentCount
          : 0,
      importantCount:
        typeof morningBrief.importantCount === 'number' && Number.isFinite(morningBrief.importantCount)
          ? morningBrief.importantCount
          : 0,
    },
    dailyBriefItems: ensureArray(payload.dailyBriefItems),
    fundHealthRows: ensureArray(payload.fundHealthRows),
    portfolioSignals: ensureArray(payload.portfolioSignals),
    fundTrustRows: ensureArray(payload.fundTrustRows),
    portfolioRevenueRows: ensureArray(payload.portfolioRevenueRows),
    blockers: ensureArray(payload.blockers),
    opportunities: ensureArray(payload.opportunities),
    revenueDistribution: ensureArray(payload.revenueDistribution),
    portfolioRevenueTrend: ensureArray(payload.portfolioRevenueTrend),
    metrics: {
      overdueCapitalCalls:
        typeof metrics.overdueCapitalCalls === 'number' && Number.isFinite(metrics.overdueCapitalCalls)
          ? metrics.overdueCapitalCalls
          : 0,
      upcomingDeadlines:
        typeof metrics.upcomingDeadlines === 'number' && Number.isFinite(metrics.upcomingDeadlines)
          ? metrics.upcomingDeadlines
          : 0,
      atRiskCompanies:
        typeof metrics.atRiskCompanies === 'number' && Number.isFinite(metrics.atRiskCompanies)
          ? metrics.atRiskCompanies
          : 0,
      healthyCompanies:
        typeof metrics.healthyCompanies === 'number' && Number.isFinite(metrics.healthyCompanies)
          ? metrics.healthyCompanies
          : 0,
      totalTasks:
        typeof metrics.totalTasks === 'number' && Number.isFinite(metrics.totalTasks)
          ? metrics.totalTasks
          : 0,
      urgentTasks:
        typeof metrics.urgentTasks === 'number' && Number.isFinite(metrics.urgentTasks)
          ? metrics.urgentTasks
          : 0,
    },
    selectedFundName: typeof payload.selectedFundName === 'string' ? payload.selectedFundName : '',
  };
}

export async function getDashboardData(
  selectedFund: Fund | null,
  viewMode: FundViewMode,
  _funds: Fund[] = []
): Promise<DashboardData> {
  if (isMockMode('dashboards')) {
    return createEmptyDashboardData();
  }

  const payload = await requestJson<unknown>('/dashboard', {
    query: {
      fundId: selectedFund?.id,
      viewMode,
    },
    fallbackMessage: 'Failed to load dashboard data',
  });

  return normalizeDashboardPayload(payload);
}
