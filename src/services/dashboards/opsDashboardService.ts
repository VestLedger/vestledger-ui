import { isMockMode } from '@/config/data-mode';
import {
  opsComplianceAlerts,
  opsDashboardMetrics,
  opsUpcomingDistributions,
} from '@/data/seeds/dashboards/ops-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';
import { formatDate } from '@/utils/formatting/date';
import { formatCurrencyCompact } from '@/utils/formatting/currency';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function formatCurrency(value: unknown): string {
  const amount = readNumber(value, Number.NaN);
  if (!Number.isFinite(amount)) return '$0';
  return formatCurrencyCompact(amount);
}

function normalizeSeverity(value: unknown): 'High' | 'Medium' | 'Low' {
  const normalized = readString(value).toLowerCase();
  if (normalized === 'high' || normalized === 'critical' || normalized === 'error') return 'High';
  if (normalized === 'medium' || normalized === 'warning') return 'Medium';
  return 'Low';
}

function toDisplayDate(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDate(parsed, { month: 'short', day: 'numeric' });
    }
    return readString(value);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value, { month: 'short', day: 'numeric' });
  }
  return 'TBD';
}

export async function getOpsDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: opsDashboardMetrics, complianceAlerts: opsComplianceAlerts, upcomingDistributions: opsUpcomingDistributions };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/ops'),
    { fallbackMessage: 'Failed to fetch ops dashboard' }
  );

  const apiData: Record<string, unknown> = isRecord(result) ? result : {};
  const metricsSource = isRecord(apiData.metrics) ? apiData.metrics : {};
  const operationalMetrics = isRecord(apiData.operationalMetrics) ? apiData.operationalMetrics : {};
  const complianceStatus = isRecord(apiData.complianceStatus) ? apiData.complianceStatus : {};
  const complianceAlertsApi = Array.isArray(apiData.complianceAlerts)
    ? apiData.complianceAlerts.filter(isRecord)
    : [];
  const upcomingDistributionsApi = Array.isArray(apiData.upcomingDistributions)
    ? apiData.upcomingDistributions.filter(isRecord)
    : [];
  const upcomingDeadlines = Array.isArray(apiData.upcomingDeadlines)
    ? apiData.upcomingDeadlines.filter(isRecord)
    : [];

  const activeCapitalCalls = readNumber(metricsSource.activeCapitalCalls, readNumber(operationalMetrics.activeCapitalCalls));
  const pendingDistributions = readNumber(metricsSource.pendingDistributions, readNumber(operationalMetrics.pendingDistributions));
  const overdueResponses = readNumber(metricsSource.overdueResponses, readNumber(operationalMetrics.overdueResponses));
  const complianceRate = readNumber(
    metricsSource.complianceRate,
    readNumber(complianceStatus.totalFunds) > 0
      ? Math.round((readNumber(complianceStatus.compliantFunds) / readNumber(complianceStatus.totalFunds)) * 100)
      : 100,
  );

  const metrics = opsDashboardMetrics.map((metric) => ({ ...metric }));
  if (metrics[0]) metrics[0].value = String(activeCapitalCalls);
  if (metrics[1]) metrics[1].value = `${Math.max(0, Math.min(100, Math.round(complianceRate)))}%`;
  if (metrics[2]) metrics[2].value = formatCurrency(pendingDistributions);
  if (metrics[3]) metrics[3].value = String(overdueResponses);
  if (metrics[3]) metrics[3].change = overdueResponses > 0 ? 'Action Req' : 'Clear';

  const normalizedComplianceAlerts = complianceAlertsApi
    .map((alert) => ({
      title: readString(alert.title, 'Compliance alert'),
      fund: readString(alert.fund, 'General'),
      description: readString(alert.description, readString(alert.message, 'Action required.')),
      severity: normalizeSeverity(alert.severity ?? alert.type),
    }))
    .filter((alert) => alert.title.length > 0);

  const normalizedUpcomingDistributions = (upcomingDistributionsApi.length > 0 ? upcomingDistributionsApi : upcomingDeadlines)
    .map((dist) => ({
      event: readString(dist.event, readString(dist.fundName, readString(dist.description, 'Distribution'))),
      date: toDisplayDate(dist.date ?? dist.paymentDate),
      amount: formatCurrency(dist.amount ?? dist.totalAmount),
      status: readString(dist.status, readString(dist.type, 'Scheduled')),
    }))
    .filter((dist) => dist.event.length > 0);

  return {
    metrics,
    complianceAlerts: normalizedComplianceAlerts,
    upcomingDistributions: normalizedUpcomingDistributions,
  };
}
