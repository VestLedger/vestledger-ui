import { isMockMode } from '@/config/data-mode';
import {
  auditorAuditTrail,
  auditorComplianceItems,
  auditorDashboardMetrics,
} from '@/data/mocks/dashboards/auditor-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getAuditorDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: auditorDashboardMetrics, auditTrail: auditorAuditTrail, complianceItems: auditorComplianceItems };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/auditor'),
    { fallbackMessage: 'Failed to fetch auditor dashboard' }
  );

  // Map API response to expected UI structure
  // The API returns: fundMetrics, capitalCallStats, recentDistributions, lpCommitmentSummary
  // We need to transform this to: metrics, auditTrail, complianceItems
  const apiData = (result as unknown) as Record<string, unknown>;

  return {
    metrics: {
      totalFundsAudited: (apiData.fundMetrics as { totalFunds: number })?.totalFunds ?? 0,
      openFindings: 0, // Placeholder - not in API yet
      complianceScore: 95, // Placeholder - not in API yet
      lastAuditDate: new Date().toISOString().split('T')[0],
    },
    auditTrail: auditorAuditTrail, // Fallback to mock - not in API yet
    complianceItems: auditorComplianceItems, // Fallback to mock - not in API yet
  };
}

