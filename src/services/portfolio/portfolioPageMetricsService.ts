import { isMockMode } from '@/config/data-mode';
import {
  portfolioPageHealthyCompanies,
  portfolioPageMetrics,
} from '@/data/mocks/portfolio/page-metrics';
import {
  getPortfolioHealthyCompaniesCount,
  getPortfolioPageMetricsSnapshot,
} from '@/services/portfolio/portfolioDataService';

export function getPortfolioPageMetrics() {
  if (isMockMode('portfolio')) return portfolioPageMetrics;
  return getPortfolioPageMetricsSnapshot();
}

export function getPortfolioHealthyCompanies() {
  if (isMockMode('portfolio')) return portfolioPageHealthyCompanies;
  return getPortfolioHealthyCompaniesCount();
}
