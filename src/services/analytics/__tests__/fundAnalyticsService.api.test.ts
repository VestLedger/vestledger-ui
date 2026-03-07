import { beforeEach, describe, expect, it, vi } from 'vitest';

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('fundAnalyticsService API mode', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  it('returns an empty analytics snapshot when API requests fail', async () => {
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('../fundAnalyticsService');
    const snapshot = await service.fetchFundAnalyticsSnapshot('fund-1');

    expect(snapshot.fundMetrics.fundId).toBe('fund-1');
    expect(snapshot.fundMetrics.fundName).toBe('Fund');
    expect(snapshot.fundMetrics.fundSize).toBe(0);
    expect(snapshot.benchmark).toEqual([]);
    expect(snapshot.jCurve).toEqual([]);
    expect(snapshot.valuationTrends).toEqual([]);
    expect(snapshot.deploymentPacing).toEqual([]);
    expect(snapshot.concentration).toEqual({
      byCompany: [],
      bySector: [],
      byStage: [],
    });
  });

  it('keeps consolidated API reads empty until a real aggregated payload exists', async () => {
    const service = await import('../fundAnalyticsService');
    const snapshot = await service.fetchFundAnalyticsSnapshot('all');

    expect(requestJson).not.toHaveBeenCalled();
    expect(snapshot.fundMetrics.fundId).toBe('all');
    expect(snapshot.fundMetrics.fundName).toBe('All Funds');
    expect(snapshot.cohortsVintage).toEqual([]);
  });
});
