import { isMockMode } from '@/config/data-mode';
import {
  auditorAuditTrail,
  auditorComplianceItems,
  auditorDashboardMetrics,
} from '@/data/mocks/dashboards/auditor-dashboard';

export function getAuditorDashboardSnapshot() {
  if (isMockMode()) {
    return { metrics: auditorDashboardMetrics, auditTrail: auditorAuditTrail, complianceItems: auditorComplianceItems };
  }
  throw new Error('Auditor dashboard API not implemented yet');
}

