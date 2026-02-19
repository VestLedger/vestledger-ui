import { isMockMode } from '@/config/data-mode';
import { getMockDashboardData } from '@/data/mocks/hooks/dashboard-data';
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
    if (!payload || !Array.isArray(payload.fundTrustRows)) return fallback;
    return payload;
  } catch {
    return getMockDashboardData(selectedFund, viewMode, funds);
  }
}
