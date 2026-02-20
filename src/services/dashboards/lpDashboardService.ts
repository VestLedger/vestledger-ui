import { isMockMode } from '@/config/data-mode';
import {
  lpDashboardCapitalActivity,
  lpDashboardCommitment,
  lpDashboardDocuments,
  lpDashboardMetrics,
  pendingCalls,
  pendingSignatures,
} from '@/data/seeds/dashboards/lp-dashboard';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';
import { logger } from '@/lib/logger';
import type { LPDashboardData } from '@/store/slices/dashboardsSlice';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function buildMetrics({
  capitalAccount,
  distributions,
  nav,
}: {
  capitalAccount: number;
  distributions: number;
  nav: number;
}): LPDashboardData['metrics'] {
  const metrics = clone(lpDashboardMetrics);

  if (metrics[0]) {
    metrics[0].value = formatCurrency(capitalAccount);
  }
  if (metrics[1]) {
    metrics[1].value = formatCurrency(distributions);
  }
  if (metrics[2]) {
    metrics[2].value = formatCurrency(nav);
  }

  return metrics;
}

function buildFallbackSnapshot(): LPDashboardData {
  return {
    metrics: clone(lpDashboardMetrics),
    documents: clone(lpDashboardDocuments),
    capitalActivity: clone(lpDashboardCapitalActivity),
    pendingCalls: clone(pendingCalls),
    pendingSignatures: clone(pendingSignatures),
    commitment: clone(lpDashboardCommitment),
  };
}

function normalizePendingCallStatus(value: unknown): 'pending' | 'overdue' | 'partial' {
  return value === 'pending' || value === 'overdue' || value === 'partial' ? value : 'pending';
}

function normalizePendingSignatureUrgency(value: unknown): 'high' | 'medium' | 'low' {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium';
}

function normalizeApiSnapshot(data: unknown): LPDashboardData | null {
  if (!isRecord(data)) {
    return null;
  }

  // Current API shape from backend dashboard service
  if (isRecord(data.metrics) && isRecord(data.commitment)) {
    const metrics = data.metrics;
    const commitment = data.commitment;

    const totalCommitment = readNumber(commitment.total, readNumber(metrics.totalCommitment));
    const calledAmount = readNumber(commitment.called, readNumber(metrics.calledCapital));
    const distributionsAmount = readNumber(metrics.distributions);
    const navAmount = readNumber(metrics.nav, totalCommitment - calledAmount + distributionsAmount);

    const normalizedDocuments = Array.isArray(data.documents)
      ? data.documents
          .filter(isRecord)
          .map((item) => ({
            name: readString(item.name, 'Document'),
            type: readString(item.type, 'Document'),
            date: readString(item.date, new Date().toLocaleDateString()),
          }))
      : clone(lpDashboardDocuments);

    const normalizedCapitalActivity = Array.isArray(data.capitalActivity)
      ? data.capitalActivity
          .filter(isRecord)
          .map((item) => ({
            type: readString(item.type, 'Distribution'),
            amount: formatCurrency(readNumber(item.amount)),
            date: readString(item.date, new Date().toLocaleDateString()),
            status: readString(item.status, 'Processed'),
          }))
      : clone(lpDashboardCapitalActivity);

    const normalizedPendingCalls = Array.isArray(data.pendingCalls)
      ? data.pendingCalls
          .filter(isRecord)
          .map((item, index) => ({
            id: readString(item.id, `call-${index}`),
            fundName: readString(item.fundName, 'Fund'),
            callNumber: readNumber(item.callNumber, index + 1),
            amount: readNumber(item.amount),
            dueDate: parseDate(item.dueDate),
            status: normalizePendingCallStatus(item.status),
            paidAmount: readNumber(item.paidAmount),
          }))
      : clone(pendingCalls);

    const normalizedPendingSignatures = Array.isArray(data.pendingSignatures)
      ? data.pendingSignatures
          .filter(isRecord)
          .map((item, index) => ({
            id: readString(item.id, `sig-${index}`),
            documentName: readString(item.documentName, 'Document'),
            documentType: readString(item.documentType, 'Document'),
            requestedDate: parseDate(item.requestedDate),
            urgency: normalizePendingSignatureUrgency(item.urgency),
          }))
      : clone(pendingSignatures);

    return {
      metrics: buildMetrics({
        capitalAccount: navAmount,
        distributions: distributionsAmount,
        nav: navAmount,
      }),
      documents: normalizedDocuments,
      capitalActivity: normalizedCapitalActivity,
      pendingCalls: normalizedPendingCalls,
      pendingSignatures: normalizedPendingSignatures,
      commitment: {
        totalCommitment,
        calledAmount,
      },
    };
  }

  // Legacy API shape
  if (Array.isArray(data.commitments)) {
    const commitments = data.commitments.filter(isRecord);
    const totalCommitment = commitments.reduce((sum, item) => sum + readNumber(item.commitment), 0);
    const calledAmount = commitments.reduce((sum, item) => sum + readNumber(item.calledAmount), 0);
    const distributionsAmount = commitments.reduce((sum, item) => sum + readNumber(item.distributedAmount), 0);
    const navAmount = totalCommitment - calledAmount + distributionsAmount;

    const normalizedPendingCalls = Array.isArray(data.pendingCapitalCalls)
      ? data.pendingCapitalCalls
          .filter(isRecord)
          .map((item, index) => ({
            id: readString(item.id, `call-${index}`),
            fundName: readString(item.fundName, 'Fund'),
            callNumber: readNumber(item.callNumber, index + 1),
            amount: readNumber(item.amount),
            dueDate: parseDate(item.dueDate),
            status: normalizePendingCallStatus(item.status),
            paidAmount: readNumber(item.paidAmount),
          }))
      : clone(pendingCalls);

    const normalizedCapitalActivity = Array.isArray(data.recentDistributions)
      ? data.recentDistributions
          .filter(isRecord)
          .map((item) => ({
            type: 'Distribution',
            amount: formatCurrency(readNumber(item.amount)),
            date: readString(item.date, new Date().toLocaleDateString()),
            status: 'Received',
          }))
      : clone(lpDashboardCapitalActivity);

    return {
      metrics: buildMetrics({
        capitalAccount: navAmount,
        distributions: distributionsAmount,
        nav: navAmount,
      }),
      documents: clone(lpDashboardDocuments),
      capitalActivity: normalizedCapitalActivity,
      pendingCalls: normalizedPendingCalls,
      pendingSignatures: clone(pendingSignatures),
      commitment: {
        totalCommitment,
        calledAmount,
      },
    };
  }

  return null;
}

export async function getLPDashboardSnapshot(lpId?: string) {
  if (isMockMode('dashboards')) {
    return buildFallbackSnapshot();
  }

  if (!lpId) {
    return buildFallbackSnapshot();
  }

  try {
    const result = await unwrapApiResult(
      apiClient.GET('/dashboard/lp/{lpId}', {
        params: { path: { lpId } },
      }),
      { fallbackMessage: 'Failed to fetch LP dashboard' },
    );

    const normalized = normalizeApiSnapshot(result);
    if (normalized) {
      return normalized;
    }

    logger.warn('Unexpected LP dashboard response shape. Falling back to defaults.', {
      component: 'lpDashboardService',
      lpId,
      result,
    });
    return buildFallbackSnapshot();
  } catch (error) {
    logger.warn('Failed to fetch LP dashboard. Falling back to defaults.', {
      component: 'lpDashboardService',
      lpId,
      error,
    });
    return buildFallbackSnapshot();
  }
}
