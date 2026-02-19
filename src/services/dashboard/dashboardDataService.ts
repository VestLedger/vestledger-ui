import { isMockMode } from '@/config/data-mode';
import { getMockDashboardData } from '@/data/mocks/hooks/dashboard-data';
import { logger } from '@/lib/logger';
import { requestJson } from '@/services/shared/httpClient';
import type { Fund, FundViewMode } from '@/types/fund';

export type DashboardData = ReturnType<typeof getMockDashboardData>;

export async function getDashboardData(selectedFund: Fund | null, viewMode: FundViewMode, funds: Fund[] = []): Promise<DashboardData> {
  if (isMockMode('dashboards')) {
    return getMockDashboardData(selectedFund, viewMode, funds);
  }

  try {
    const payload = await requestJson<DashboardData>('/dashboard', {
      query: {
        fundId: selectedFund?.id,
        viewMode,
      },
      fallbackMessage: 'Failed to load dashboard data',
    });
    const fallback = getMockDashboardData(selectedFund, viewMode, funds);
    if (!payload) {
      logger.warn('Empty dashboard payload from API; using fallback', {
        component: 'dashboardDataService',
        fundId: selectedFund?.id,
        viewMode,
      });
      return fallback;
    }
    if (!Array.isArray(payload.fundTrustRows)) {
      logger.warn('Malformed dashboard payload from API; using fallback', {
        component: 'dashboardDataService',
        fundId: selectedFund?.id,
        viewMode,
      });
      return fallback;
    }
    return payload;
  } catch (error) {
    logger.warn('Dashboard API request failed; using fallback', {
      component: 'dashboardDataService',
      fundId: selectedFund?.id,
      viewMode,
      error,
    });
    return getMockDashboardData(selectedFund, viewMode, funds);
  }
}
