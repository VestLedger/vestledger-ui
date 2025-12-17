import type { Alert, GetAlertsParams } from '@/store/slices/alertsSlice';
import { isMockMode } from '@/config/data-mode';
import { mockAlerts } from '@/data/mocks/store/alerts';

/**
 * Fetch alerts with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export async function fetchAlerts(params: GetAlertsParams): Promise<Alert[]> {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Filter by fundId, unreadOnly, etc.
    return mockAlerts;
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_ALERTS, variables: params })
  throw new Error('Alerts API not implemented yet');
}
