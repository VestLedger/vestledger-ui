import { isMockMode } from '@/config/data-mode';
import {
  opsComplianceAlerts,
  opsDashboardMetrics,
  opsUpcomingDistributions,
} from '@/data/mocks/dashboards/ops-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getOpsDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: opsDashboardMetrics, complianceAlerts: opsComplianceAlerts, upcomingDistributions: opsUpcomingDistributions };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/ops'),
    { fallbackMessage: 'Failed to fetch ops dashboard' }
  );

  // Map API response to expected UI structure
  const apiData = (result as unknown) as {
    operationalMetrics: { activeCapitalCalls: number; pendingDistributions: number; overdueResponses: number };
    complianceStatus: { compliantFunds: number; totalFunds: number };
    upcomingDeadlines: Array<{ type: string; date: string; description: string }>;
  };

  return {
    metrics: {
      activeCapitalCalls: apiData.operationalMetrics?.activeCapitalCalls ?? 0,
      pendingDistributions: apiData.operationalMetrics?.pendingDistributions ?? 0,
      overdueResponses: apiData.operationalMetrics?.overdueResponses ?? 0,
      complianceRate: apiData.complianceStatus
        ? Math.round((apiData.complianceStatus.compliantFunds / apiData.complianceStatus.totalFunds) * 100)
        : 100,
    },
    complianceAlerts: opsComplianceAlerts, // Fallback - not fully in API yet
    upcomingDistributions: apiData.upcomingDeadlines?.filter((d) => d.type === 'distribution').map((d) => ({
      id: `dist-${Date.now()}-${Math.random()}`,
      fundName: d.description,
      amount: 0, // Not in deadline data
      date: d.date,
    })) ?? opsUpcomingDistributions,
  };
}

