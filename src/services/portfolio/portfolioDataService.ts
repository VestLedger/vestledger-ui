import { isMockMode } from '@/config/data-mode';
import {
  assetAllocation,
  performanceData,
  portfolioCompanies,
  portfolioSummary,
  portfolioUpdates,
} from '@/data/mocks/mock-portfolio-data';

export type {
  AssetAllocation,
  PortfolioCompanyMetrics,
  PortfolioUpdate,
} from '@/data/mocks/mock-portfolio-data';

export function getPortfolioCompanies() {
  if (isMockMode()) return portfolioCompanies;
  throw new Error('Portfolio API not implemented yet');
}

export function getPortfolioUpdates() {
  if (isMockMode()) return portfolioUpdates;
  throw new Error('Portfolio API not implemented yet');
}

export function getPortfolioSummary() {
  if (isMockMode()) return portfolioSummary;
  throw new Error('Portfolio API not implemented yet');
}

export function getPortfolioPerformanceData() {
  if (isMockMode()) return performanceData;
  throw new Error('Portfolio API not implemented yet');
}

export function getPortfolioAssetAllocation() {
  if (isMockMode()) return assetAllocation;
  throw new Error('Portfolio API not implemented yet');
}
