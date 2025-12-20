import { isMockMode } from '@/config/data-mode';
import {
  lpDashboardCapitalActivity,
  lpDashboardDocuments,
  lpDashboardMetrics,
  pendingCalls,
  pendingSignatures,
} from '@/data/mocks/dashboards/lp-dashboard';

export function getLPDashboardSnapshot() {
  if (isMockMode()) {
    return {
      metrics: lpDashboardMetrics,
      documents: lpDashboardDocuments,
      capitalActivity: lpDashboardCapitalActivity,
      pendingCalls,
      pendingSignatures,
      commitment: {
        totalCommitment: 10_000_000,
        calledAmount: 6_500_000,
      },
    };
  }
  throw new Error('LP dashboard API not implemented yet');
}
