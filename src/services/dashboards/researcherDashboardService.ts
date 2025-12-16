import { isMockMode } from '@/config/data-mode';
import {
  researcherDashboardMetrics,
  researcherRecentReports,
  researcherTrendingTopics,
} from '@/data/mocks/dashboards/researcher-dashboard';

export function getResearcherDashboardSnapshot() {
  if (isMockMode()) {
    return { metrics: researcherDashboardMetrics, recentReports: researcherRecentReports, trendingTopics: researcherTrendingTopics };
  }
  throw new Error('Researcher dashboard API not implemented yet');
}

