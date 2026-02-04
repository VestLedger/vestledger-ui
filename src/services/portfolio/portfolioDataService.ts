import { isMockMode } from '@/config/data-mode';
import {
  assetAllocation,
  performanceData,
  portfolioCompanies,
  portfolioSummary,
  portfolioUpdates,
} from '@/data/mocks/mock-portfolio-data';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';
import type { components } from '@/api/generated/openapi';

export type {
  AssetAllocation,
  PortfolioCompanyMetrics,
  PortfolioUpdate,
} from '@/data/mocks/mock-portfolio-data';

import type { PortfolioCompanyMetrics } from '@/data/mocks/mock-portfolio-data';

type ApiPortfolioCompany = components['schemas']['CreatePortfolioCompanyDto'] & {
  id: string;
  fundId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Map API portfolio company to UI PortfolioCompanyMetrics type
 * Preserves all UI data structure fields with sensible defaults
 */
function mapApiToPortfolioCompanyMetrics(api: ApiPortfolioCompany): PortfolioCompanyMetrics {
  const initialInvestment = api.initialInvestment;
  const currentValue = api.currentValue;

  return {
    id: api.id,
    companyName: api.name,
    sector: api.sector,
    stage: api.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert 'series-a' to 'Series A'
    investmentDate: api.investmentDate,
    initialInvestment,
    currentValuation: currentValue,
    ownership: api.ownership,
    // Performance metrics - these would come from additional API or be computed
    arr: 0, // Placeholder - would need additional API
    arrGrowth: 0,
    burnRate: api.burnRate ?? 0,
    runway: api.runway ?? 0,
    headcount: 0, // Placeholder
    // Funding
    totalRaised: initialInvestment,
    lastRoundDate: api.investmentDate,
    lastRoundAmount: initialInvestment,
    lastRoundValuation: currentValue,
    // Returns - computed from investment vs current value
    moic: currentValue / initialInvestment,
    irr: 0, // Would need time-based calculation
    // Status
    status: api.status === 'active' ? 'active' : api.status === 'exited' ? 'exited' : 'at-risk',
    healthScore: api.health ?? 70,
    lastUpdateDate: api.updatedAt.split('T')[0],
  };
}

/**
 * Get portfolio companies (synchronous - for mock mode compatibility)
 * Use fetchPortfolioCompanies for async API calls
 */
export function getPortfolioCompanies(): PortfolioCompanyMetrics[] {
  // Always return mock data synchronously - component expects sync call
  return portfolioCompanies;
}

/**
 * Fetch portfolio companies from API (async)
 * @param fundId - Fund ID to fetch companies for (required for API mode)
 */
export async function fetchPortfolioCompanies(fundId: string): Promise<PortfolioCompanyMetrics[]> {
  if (isMockMode('portfolio')) return portfolioCompanies;

  const result = await unwrapApiResult(
    apiClient.GET('/funds/{fundId}/portfolio', {
      params: { path: { fundId } },
    }),
    { fallbackMessage: 'Failed to fetch portfolio companies' }
  );

  return ((result as unknown as ApiPortfolioCompany[]) ?? []).map(mapApiToPortfolioCompanyMetrics);
}

export function getPortfolioUpdates() {
  if (isMockMode('portfolio')) return portfolioUpdates;
  // Portfolio updates not yet implemented in backend
  return portfolioUpdates; // Fallback to mock for now
}

export function getPortfolioSummary() {
  if (isMockMode('portfolio')) return portfolioSummary;
  // Portfolio summary not yet implemented in backend
  return portfolioSummary; // Fallback to mock for now
}

export function getPortfolioPerformanceData() {
  if (isMockMode('portfolio')) return performanceData;
  // Performance data not yet implemented in backend
  return performanceData; // Fallback to mock for now
}

export function getPortfolioAssetAllocation() {
  if (isMockMode('portfolio')) return assetAllocation;
  // Asset allocation not yet implemented in backend
  return assetAllocation; // Fallback to mock for now
}
