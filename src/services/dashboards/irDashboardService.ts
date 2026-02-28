import { isMockMode } from '@/config/data-mode';
import {
  irDashboardMetrics,
  irRecentInteractions,
  irUpcomingTasks,
} from '@/data/seeds/dashboards/ir-dashboard';
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
  return 'Soon';
}

function normalizePriority(value: unknown): 'High' | 'Medium' | 'Low' {
  if (typeof value === 'number') {
    if (value >= 8) return 'High';
    if (value >= 5) return 'Medium';
    return 'Low';
  }

  const normalized = readString(value).toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  return 'Low';
}

export async function getIRDashboardSnapshot() {
  if (isMockMode('dashboards')) {
    return { metrics: irDashboardMetrics, recentInteractions: irRecentInteractions, upcomingTasks: irUpcomingTasks };
  }

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/ir'),
    { fallbackMessage: 'Failed to fetch IR dashboard' }
  );

  const apiData: Record<string, unknown> = isRecord(result) ? result : {};
  const metricsSource = isRecord(apiData.metrics) ? apiData.metrics : {};
  const lpEngagement = isRecord(apiData.lpEngagement) ? apiData.lpEngagement : {};
  const pendingCapitalCalls = Array.isArray(apiData.pendingCapitalCalls)
    ? apiData.pendingCapitalCalls.filter(isRecord)
    : [];
  const upcomingEvents = Array.isArray(apiData.upcomingEvents)
    ? apiData.upcomingEvents.filter(isRecord)
    : [];
  const recentInteractionsApi = Array.isArray(apiData.recentInteractions)
    ? apiData.recentInteractions.filter(isRecord)
    : [];
  const upcomingTasksApi = Array.isArray(apiData.upcomingTasks)
    ? apiData.upcomingTasks.filter(isRecord)
    : [];

  const totalLPs = readNumber(metricsSource.totalLPs, readNumber(lpEngagement.totalLps));
  const activeLPs = readNumber(metricsSource.activeLPs, readNumber(lpEngagement.activeLps));
  const engagementScore = readNumber(metricsSource.engagementScore, readNumber(lpEngagement.averageEngagementScore));
  const pendingRequests = readNumber(metricsSource.pendingRequests, pendingCapitalCalls.length || upcomingTasksApi.length);

  const metrics = irDashboardMetrics.map((metric) => ({ ...metric }));
  if (metrics[0]) metrics[0].value = String(totalLPs);
  if (metrics[0]) metrics[0].change = `Active ${activeLPs}`;
  if (metrics[1]) metrics[1].value = String(pendingRequests);
  if (metrics[2]) metrics[2].value = String(recentInteractionsApi.length || irRecentInteractions.length);
  if (metrics[3]) metrics[3].value = `${Math.max(0, Math.min(100, Math.round(engagementScore)))}%`;
  if (metrics[1]) metrics[1].change = pendingRequests > 0 ? 'Action Req' : 'Clear';

  const normalizedInteractions = recentInteractionsApi
    .map((item) => ({
      lp: readString(item.lp, readString(item.lpName, readString(item.name, 'LP'))),
      type: readString(item.type, 'Interaction'),
      date: toDisplayDate(item.date),
      notes: readString(item.notes, readString(item.description, 'Recent interaction logged.')),
    }))
    .filter((item) => item.lp.length > 0);

  const normalizedUpcomingTasks = (upcomingTasksApi.length > 0 ? upcomingTasksApi : upcomingEvents)
    .map((item) => ({
      task: readString(item.task, readString(item.type, 'Follow-up')),
      due: toDisplayDate(item.due ?? item.dueDate ?? item.date),
      priority: normalizePriority(item.priority ?? item.urgency),
    }))
    .filter((item) => item.task.length > 0);

  return {
    metrics,
    recentInteractions: normalizedInteractions.length > 0 ? normalizedInteractions : irRecentInteractions,
    upcomingTasks: normalizedUpcomingTasks.length > 0 ? normalizedUpcomingTasks : irUpcomingTasks,
  };
}
