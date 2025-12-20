import { isMockMode } from '@/config/data-mode';
import {
  portfolioPageHealthyCompanies,
  portfolioPageMetrics,
} from '@/data/mocks/portfolio/page-metrics';

export function getPortfolioPageMetrics() {
  if (isMockMode()) return portfolioPageMetrics;
  throw new Error('Portfolio metrics API not implemented yet');
}

export function getPortfolioHealthyCompanies() {
  if (isMockMode()) return portfolioPageHealthyCompanies;
  throw new Error('Portfolio metrics API not implemented yet');
}

