import { isMockMode } from '@/config/data-mode';
import {
  auditorAuditTrail,
  auditorComplianceItems,
  auditorDashboardMetrics,
} from '@/data/seeds/dashboards/auditor-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toDisplayDate(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return readString(value);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return 'N/A';
}

export async function getAuditorDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: auditorDashboardMetrics, auditTrail: auditorAuditTrail, complianceItems: auditorComplianceItems };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/auditor'),
    { fallbackMessage: 'Failed to fetch auditor dashboard' }
  );

  const apiData: Record<string, unknown> = isRecord(result) ? result : {};
  const metricsSource = isRecord(apiData.metrics) ? apiData.metrics : {};
  const auditTrailApi = Array.isArray(apiData.auditTrail)
    ? apiData.auditTrail.filter(isRecord)
    : [];
  const complianceItemsApi = Array.isArray(apiData.complianceItems)
    ? apiData.complianceItems.filter(isRecord)
    : [];

  const totalFundsAudited = readNumber(metricsSource.totalFundsAudited);
  const openFindings = readNumber(metricsSource.openFindings);
  const complianceScore = readNumber(metricsSource.complianceScore);
  const lastAuditDate = readString(metricsSource.lastAuditDate, '');

  const metrics = auditorDashboardMetrics.map((metric) => ({ ...metric }));
  if (metrics[0]) metrics[0].value = String(totalFundsAudited || auditorAuditTrail.length);
  if (metrics[1]) metrics[1].value = String(openFindings);
  if (metrics[2]) metrics[2].value = `${Math.max(0, Math.min(100, Math.round(complianceScore || 95)))}%`;
  if (metrics[3]) metrics[3].value = toDisplayDate(lastAuditDate || new Date().toISOString());

  const normalizedAuditTrail = auditTrailApi
    .map((item) => ({
      action: readString(item.action, readString(item.description, 'Audit event')),
      fund: readString(item.fund, readString(item.entity, 'General')),
      date: toDisplayDate(item.date ?? item.timestamp),
      hash: readString(item.hash, readString(item.txHash, 'n/a')),
    }))
    .filter((item) => item.action.length > 0);

  const normalizedComplianceItems = complianceItemsApi
    .map((item) => ({
      item: readString(item.item, readString(item.title, 'Compliance item')),
      status: readString(item.status, 'Pending'),
      lastCheck: toDisplayDate(item.lastCheck ?? item.updatedAt ?? item.dueDate),
    }))
    .filter((item) => item.item.length > 0);

  return {
    metrics,
    auditTrail: normalizedAuditTrail.length > 0 ? normalizedAuditTrail : auditorAuditTrail,
    complianceItems: normalizedComplianceItems.length > 0 ? normalizedComplianceItems : auditorComplianceItems,
  };
}
