import { isMockMode } from '@/config/data-mode';
import {
  analystDashboardMetrics,
  analystRecentDeals,
  analystUrgentTasks,
} from '@/data/mocks/dashboards/analyst-dashboard';

export function getAnalystDashboardSnapshot() {
  if (isMockMode()) {
    return { metrics: analystDashboardMetrics, recentDeals: analystRecentDeals, urgentTasks: analystUrgentTasks };
  }
  throw new Error('Analyst dashboard API not implemented yet');
}

