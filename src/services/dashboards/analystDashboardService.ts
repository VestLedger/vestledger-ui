import { isMockMode } from '@/config/data-mode';
import {
  analystDashboardMetrics,
  analystRecentDeals,
  analystUrgentTasks,
} from '@/data/mocks/dashboards/analyst-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getAnalystDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: analystDashboardMetrics, recentDeals: analystRecentDeals, urgentTasks: analystUrgentTasks };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/analyst'),
    { fallbackMessage: 'Failed to fetch analyst dashboard' }
  );

  // Map API response to expected UI structure
  const apiData = (result as unknown) as {
    portfolioOverview: {
      totalCompanies: number;
      activeCompanies: number;
      averageHealth: number;
      atRiskCount: number;
    };
    pendingDueDiligence: Array<{
      id: string;
      companyName: string;
      stage: string;
      deadline: string;
    }>;
    recentUpdates: Array<{
      companyId: string;
      companyName: string;
      updateType: string;
      date: string;
    }>;
  };

  return {
    metrics: {
      activeDealsPipeline: apiData.portfolioOverview?.totalCompanies ?? 0,
      dealsUnderDD: apiData.pendingDueDiligence?.length ?? 0,
      pendingMemos: apiData.pendingDueDiligence?.length ?? 0,
      averageHealthScore: apiData.portfolioOverview?.averageHealth ?? 0,
    },
    recentDeals: apiData.recentUpdates?.map((u) => ({
      id: u.companyId,
      name: u.companyName,
      stage: 'Under Review',
      lastUpdate: u.date,
    })) ?? analystRecentDeals,
    urgentTasks: apiData.pendingDueDiligence?.map((dd) => ({
      id: dd.id,
      task: `Complete DD for ${dd.companyName}`,
      dueDate: dd.deadline,
      priority: 'high' as const,
    })) ?? analystUrgentTasks,
  };
}

