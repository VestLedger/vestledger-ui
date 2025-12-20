import { isMockMode } from '@/config/data-mode';
import {
  irDashboardMetrics,
  irRecentInteractions,
  irUpcomingTasks,
} from '@/data/mocks/dashboards/ir-dashboard';

export function getIRDashboardSnapshot() {
  if (isMockMode()) {
    return { metrics: irDashboardMetrics, recentInteractions: irRecentInteractions, upcomingTasks: irUpcomingTasks };
  }
  throw new Error('IR dashboard API not implemented yet');
}

