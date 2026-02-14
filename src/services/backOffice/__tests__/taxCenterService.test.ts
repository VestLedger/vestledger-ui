import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockFilingDeadline,
  mockPortfolioTax,
  mockTaxDocuments,
  mockTaxSummaries,
} from '@/data/mocks/back-office/tax-center';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('taxCenterService', () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it('returns centralized mock tax data in mock mode', async () => {
    const service = await import('@/services/backOffice/taxCenterService');

    const filingDeadline = await service.getTaxFilingDeadline();
    const documents = await service.getTaxDocuments();
    const summaries = await service.getTaxSummaries();
    const portfolioTax = await service.getPortfolioTax();

    expect(filingDeadline.getTime()).toBe(mockFilingDeadline.getTime());
    expect(documents).toEqual(mockTaxDocuments);
    expect(summaries).toEqual(mockTaxSummaries);
    expect(portfolioTax).toEqual(mockPortfolioTax);
  });

  it('falls back to cached mock tax data in API mode when requests fail', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/backOffice/taxCenterService');

    const filingDeadline = await service.getTaxFilingDeadline();
    const documents = await service.getTaxDocuments();
    const summaries = await service.getTaxSummaries();
    const portfolioTax = await service.getPortfolioTax();

    expect(filingDeadline.getTime()).toBe(mockFilingDeadline.getTime());
    expect(documents).toEqual(mockTaxDocuments);
    expect(summaries).toEqual(mockTaxSummaries);
    expect(portfolioTax).toEqual(mockPortfolioTax);
  });

  it('maps API tax payloads when endpoints are available', async () => {
    isMockMode.mockReturnValue(false);
    requestJson.mockImplementation(async (path: string) => {
      if (path === '/tax/deadline') {
        return { filingDeadline: '2026-03-20' };
      }

      if (path === '/tax/documents') {
        return [
          {
            id: 'api-tax-doc-1',
            documentType: 'Schedule K-1',
            taxYear: 2025,
            recipientType: 'LP',
            recipientName: 'API LP',
            status: 'ready',
          },
        ];
      }

      if (path === '/tax/summaries') {
        return [
          {
            id: 'api-tax-summary-1',
            fundName: 'Fund API',
            taxYear: 2025,
            k1sIssued: 3,
            k1sTotal: 5,
            form1099Issued: 1,
            form1099Total: 2,
            estimatedTaxesPaid: 150000,
            totalDistributions: 2000000,
            filingDeadline: '2026-03-20',
          },
        ];
      }

      if (path === '/tax/portfolio') {
        return [
          {
            id: 'api-portfolio-tax-1',
            companyName: 'API Company',
            ownership: 22.5,
            taxClassification: 'LLC',
            k1Required: true,
            k1Received: false,
            contactEmail: 'tax@api-company.com',
          },
        ];
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const service = await import('@/services/backOffice/taxCenterService');

    const filingDeadline = await service.getTaxFilingDeadline();
    const documents = await service.getTaxDocuments();
    const summaries = await service.getTaxSummaries();
    const portfolioTax = await service.getPortfolioTax();

    expect(filingDeadline.toISOString().slice(0, 10)).toBe('2026-03-20');
    expect(documents[0].id).toBe('api-tax-doc-1');
    expect(summaries[0].id).toBe('api-tax-summary-1');
    expect(portfolioTax[0].id).toBe('api-portfolio-tax-1');
  });
});
