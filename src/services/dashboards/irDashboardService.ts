import { isMockMode } from '@/config/data-mode';
import {
  irDashboardMetrics,
  irRecentInteractions,
  irUpcomingTasks,
} from '@/data/mocks/dashboards/ir-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getIRDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: irDashboardMetrics, recentInteractions: irRecentInteractions, upcomingTasks: irUpcomingTasks };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/ir'),
    { fallbackMessage: 'Failed to fetch IR dashboard' }
  );

  // Map API response to expected UI structure
  const apiData = (result as unknown) as {
    lpEngagement: { totalLps: number; activeLps: number; averageEngagementScore: number };
    upcomingEvents: Array<{ type: string; date: string; lpName?: string }>;
    pendingCapitalCalls: Array<{ id: string; fundName: string }>;
    lpBreakdown: { institutional: number; individual: number; strategic: number };
  };

  return {
    metrics: {
      totalLPs: apiData.lpEngagement?.totalLps ?? 0,
      activeLPs: apiData.lpEngagement?.activeLps ?? 0,
      engagementScore: apiData.lpEngagement?.averageEngagementScore ?? 0,
      pendingRequests: apiData.pendingCapitalCalls?.length ?? 0,
    },
    recentInteractions: irRecentInteractions, // Fallback - not fully in API yet
    upcomingTasks: apiData.upcomingEvents?.map((event) => ({
      id: `event-${Date.now()}-${Math.random()}`,
      task: event.type,
      dueDate: event.date,
      lpName: event.lpName ?? 'Various',
    })) ?? irUpcomingTasks,
  };
}

