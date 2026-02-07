import type { Alert, GetAlertsParams, AlertType } from '@/store/slices/alertsSlice';
import { isMockMode } from '@/config/data-mode';
import { mockAlerts } from '@/data/mocks/store/alerts';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

interface ApiAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  fundId?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

/**
 * Map API alert to UI Alert type
 */
function mapApiToAlert(api: ApiAlert): Alert {
  // Map API type to UI type
  const typeMap: Record<string, AlertType> = {
    capital_call: 'alert',
    portfolio: 'deal',
    compliance: 'system',
    deadline: 'alert',
    report: 'report',
  };

  // Calculate relative time
  const createdAt = new Date(api.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let time: string;
  if (diffMins < 60) {
    time = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    time = `${diffHours}h ago`;
  } else {
    time = `${diffDays}d ago`;
  }

  return {
    id: api.id,
    type: typeMap[api.type] ?? 'system',
    title: api.title,
    message: api.message,
    time,
    unread: !api.isRead,
  };
}

/**
 * Fetch alerts with optional filters
 * Uses real API when in API mode, mock data when in mock mode
 */
export async function fetchAlerts(params: GetAlertsParams): Promise<Alert[]> {
  if (isMockMode('alerts')) {
    // Mock mode: Apply filters to mock data
    let alerts = [...mockAlerts];

    if (params.unreadOnly) {
      alerts = alerts.filter((a) => a.unread);
    }

    return alerts;
  }

  // API mode: Call real endpoint
  const result = await unwrapApiResult(
    apiClient.GET('/dashboard/alerts', {
      params: {
        query: {},
      },
    }),
    { fallbackMessage: 'Failed to fetch alerts' }
  );

  let alerts = ((result as unknown as ApiAlert[]) ?? []).map(mapApiToAlert);

  // Apply filters
  if (params.unreadOnly) {
    alerts = alerts.filter((a) => a.unread);
  }

  return alerts;
}
