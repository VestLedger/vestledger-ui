import { beforeEach, describe, expect, it, vi } from 'vitest';
import { portfolioCompanies } from '@/data/mocks/mock-portfolio-data';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('portfolioDataService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isMockMode.mockReturnValue(true);
  });

  it('returns cloned centralized mock snapshot in mock mode', async () => {
    const service = await import('@/services/portfolio/portfolioDataService');
    const snapshot = await service.fetchPortfolioSnapshot('fund-1');

    expect(snapshot.companies).toEqual(portfolioCompanies);
    expect(snapshot.companies).not.toBe(portfolioCompanies);
    expect(snapshot.pageMetrics.totalCompanies).toBe(portfolioCompanies.length);
  });

  it('maps API portfolio data and stores cache in api mode', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockImplementation(async (path: string) => {
      if (path === '/funds/fund-api/portfolio') {
        return [
          {
            id: 'co-1',
            name: 'Axiom Health',
            sector: 'HealthTech',
            stage: 'series-a',
            investmentDate: '2024-03-10',
            initialInvestment: 5_000_000,
            currentValue: 18_000_000,
            ownership: 22,
            health: 84,
            healthChange: 6,
            runway: 20,
            burnRate: 350000,
            updatedAt: '2026-02-01',
          },
          {
            id: 'co-2',
            name: 'BridgeCore',
            sector: 'FinTech',
            stage: 'seed',
            investmentDate: '2023-06-15',
            initialInvestment: 3_000_000,
            currentValue: 2_700_000,
            ownership: 18,
            health: 58,
            healthChange: -9,
            status: 'written-off',
            updatedAt: '2026-01-20',
          },
        ];
      }

      if (path === '/funds/fund-api/portfolio/health') {
        return {
          summary: {
            totalCompanies: 2,
            atRiskCount: 1,
            healthyCount: 1,
          },
        };
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    const service = await import('@/services/portfolio/portfolioDataService');
    const snapshot = await service.fetchPortfolioSnapshot('fund-api');

    expect(snapshot.companies).toHaveLength(2);
    expect(snapshot.summary.totalCompanies).toBe(2);
    expect(snapshot.pageMetrics.atRiskCompanies).toBe(1);
    expect(snapshot.healthyCompanies).toBe(1);
    expect(snapshot.companies[0].stage).toBe('Series A');
    expect(snapshot.companies[1].status).toBe('at-risk');
    expect(snapshot.updates.length).toBeGreaterThan(0);

    const cachedCompanies = service.getPortfolioCompanies();
    expect(cachedCompanies).toHaveLength(2);
  });

  it('falls back to cached snapshot when api request fails', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockImplementation(async (path: string) => {
      if (path === '/funds/fund-ok/portfolio') {
        return [
          {
            id: 'co-ok',
            name: 'Orbit',
            sector: 'SaaS',
            stage: 'growth',
            investmentDate: '2022-08-01',
            initialInvestment: 7_000_000,
            currentValue: 21_000_000,
            ownership: 20,
            updatedAt: '2026-02-01',
          },
        ];
      }

      if (path === '/funds/fund-ok/portfolio/health') {
        return { summary: { totalCompanies: 1, atRiskCount: 0, healthyCount: 1 } };
      }

      throw new Error('network down');
    });

    const service = await import('@/services/portfolio/portfolioDataService');
    const first = await service.fetchPortfolioSnapshot('fund-ok');
    expect(first.companies).toHaveLength(1);

    requestJson.mockRejectedValue(new Error('network down'));
    const second = await service.fetchPortfolioSnapshot('fund-failing');

    expect(second.companies).toHaveLength(1);
    expect(second.summary.totalCompanies).toBe(1);
  });

  it('clears cache and returns mock fallback when no fund id provided', async () => {
    isMockMode.mockReturnValue(false);

    const service = await import('@/services/portfolio/portfolioDataService');
    service.clearPortfolioSnapshotCache();

    const fallback = await service.fetchPortfolioSnapshot('');
    expect(fallback.companies.length).toBeGreaterThan(0);
    expect(fallback.summary.totalCompanies).toBeGreaterThan(0);
  });
});
