import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockHistory,
  mockStrikePrices,
  mockValuations,
} from '@/data/mocks/back-office/valuation-409a';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('valuation409aService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized 409A mock data in mock mode', async () => {
    const service = await import('@/services/backOffice/valuation409aService');

    await expect(service.getValuations409a()).resolves.toEqual(mockValuations);
    await expect(service.getStrikePrices()).resolves.toEqual(mockStrikePrices);
    await expect(service.getValuationHistory()).resolves.toEqual(mockHistory);
  });

  it('falls back to cached mock data in API mode when requests fail', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/backOffice/valuation409aService');

    const valuations = await service.getValuations409a();
    const strikePrices = await service.getStrikePrices();
    const history = await service.getValuationHistory();

    expect(valuations).toEqual(mockValuations);
    expect(strikePrices).toEqual(mockStrikePrices);
    expect(history).toEqual(mockHistory);
  });

  it('maps API valuation payloads when endpoints are available', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockImplementation(async (path: string) => {
      if (path === '/valuations/409a') {
        return [
          {
            id: 'api-valuation-1',
            company: 'API Company',
            valuationDate: '2025-12-01',
            expirationDate: '2026-12-01',
            fairMarketValue: 18.25,
            commonStock: 18.25,
            preferredStock: 32.5,
            status: 'current',
            provider: 'API Provider',
            reportUrl: '/reports/api-valuation-1.pdf',
            methodology: 'Hybrid',
          },
        ];
      }

      if (path === '/valuations/409a/strike-prices') {
        return [
          {
            id: 'api-strike-1',
            grantDate: '2025-12-10',
            strikePrice: 18.25,
            sharesGranted: 10000,
            recipient: 'API Recipient',
            vestingSchedule: '4-year',
            status: 'active',
          },
        ];
      }

      if (path === '/valuations/409a/history') {
        return [
          {
            id: 'api-history-1',
            date: '2025-12-01',
            fmv: 18.25,
            change: 14.3,
            trigger: 'Annual refresh',
          },
        ];
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const service = await import('@/services/backOffice/valuation409aService');

    const valuations = await service.getValuations409a();
    const strikePrices = await service.getStrikePrices();
    const history = await service.getValuationHistory();

    expect(valuations[0].id).toBe('api-valuation-1');
    expect(strikePrices[0].id).toBe('api-strike-1');
    expect(history[0].id).toBe('api-history-1');
  });
});
