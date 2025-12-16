import type { Alert } from '@/store/slices/alertsSlice';
import { isMockMode } from '@/config/data-mode';
import { mockAlerts } from '@/data/mocks/store/alerts';

export async function fetchAlerts(): Promise<Alert[]> {
  if (isMockMode()) {
    return mockAlerts;
  }

  throw new Error('Alerts API not implemented yet');
}

