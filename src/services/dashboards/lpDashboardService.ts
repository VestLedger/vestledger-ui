import { isMockMode } from '@/config/data-mode';
import {
  lpDashboardCapitalActivity,
  lpDashboardCommitment,
  lpDashboardDocuments,
  lpDashboardMetrics,
  pendingCalls,
  pendingSignatures,
} from '@/data/mocks/dashboards/lp-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

export async function getLPDashboardSnapshot(lpId?: string) {
  if (isMockMode('dashboards')) {
    return {
      metrics: lpDashboardMetrics,
      documents: lpDashboardDocuments,
      capitalActivity: lpDashboardCapitalActivity,
      pendingCalls,
      pendingSignatures,
      commitment: lpDashboardCommitment,
    };
  }

  // API mode - requires lpId
  if (!lpId) {
    // Fallback to mock if no lpId provided
    return {
      metrics: lpDashboardMetrics,
      documents: lpDashboardDocuments,
      capitalActivity: lpDashboardCapitalActivity,
      pendingCalls,
      pendingSignatures,
      commitment: lpDashboardCommitment,
    };
  }

  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/lp/{lpId}', {
      params: { path: { lpId } },
    }),
    { fallbackMessage: 'Failed to fetch LP dashboard' }
  );

  // Map API response to expected UI structure
  const apiData = (result as unknown) as {
    lp: { id: string; name: string; type: string };
    commitments: Array<{
      fundId: string;
      fundName: string;
      commitment: number;
      calledAmount: number;
      distributedAmount: number;
      ownership: number;
    }>;
    pendingCapitalCalls: Array<{
      id: string;
      fundName: string;
      amount: number;
      dueDate: string;
    }>;
    recentDistributions: Array<{
      id: string;
      fundName: string;
      amount: number;
      date: string;
    }>;
  };

  const totalCommitment = apiData.commitments?.reduce((sum, c) => sum + c.commitment, 0) ?? 0;
  const totalCalled = apiData.commitments?.reduce((sum, c) => sum + c.calledAmount, 0) ?? 0;
  const totalDistributed = apiData.commitments?.reduce((sum, c) => sum + c.distributedAmount, 0) ?? 0;

  return {
    metrics: {
      totalCommitment,
      calledCapital: totalCalled,
      distributions: totalDistributed,
      nav: totalCalled - totalDistributed, // Simplified NAV calculation
    },
    documents: lpDashboardDocuments, // Fallback - not in API yet
    capitalActivity: apiData.recentDistributions?.map((d) => ({
      id: d.id,
      type: 'distribution' as const,
      amount: d.amount,
      date: d.date,
      fundName: d.fundName,
    })) ?? lpDashboardCapitalActivity,
    pendingCalls: apiData.pendingCapitalCalls?.map((c) => ({
      id: c.id,
      fundName: c.fundName,
      amount: c.amount,
      dueDate: c.dueDate,
    })) ?? pendingCalls,
    pendingSignatures,
    commitment: {
      total: totalCommitment,
      called: totalCalled,
      remaining: totalCommitment - totalCalled,
    },
  };
}
