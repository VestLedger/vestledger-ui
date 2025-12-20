import { isMockMode } from '@/config/data-mode';
import {
  opsComplianceAlerts,
  opsDashboardMetrics,
  opsUpcomingDistributions,
} from '@/data/mocks/dashboards/ops-dashboard';

export function getOpsDashboardSnapshot() {
  if (isMockMode()) {
    return { metrics: opsDashboardMetrics, complianceAlerts: opsComplianceAlerts, upcomingDistributions: opsUpcomingDistributions };
  }
  throw new Error('Ops dashboard API not implemented yet');
}

