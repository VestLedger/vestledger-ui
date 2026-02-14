import { beforeEach, describe, expect, it, vi } from 'vitest';
import { portfolioDocuments } from '@/data/mocks/portfolio/documents';

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();
const fetchPortfolioSnapshot = vi.fn();

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

vi.mock('@/services/portfolio/portfolioDataService', () => ({
  fetchPortfolioSnapshot,
}));

describe('portfolioDocumentsService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isMockMode.mockReturnValue(true);
  });

  it('returns mock snapshot in mock mode', async () => {
    const service = await import('@/services/portfolio/portfolioDocumentsService');
    const snapshot = await service.fetchPortfolioDocumentsSnapshot('fund-1');

    expect(snapshot.documents).toEqual(portfolioDocuments);
    expect(snapshot.documents).not.toBe(portfolioDocuments);
  });

  it('maps API documents and applies company status counts in api mode', async () => {
    isMockMode.mockReturnValue(false);
    fetchPortfolioSnapshot.mockResolvedValue({
      companies: [
        { id: 'co-1', companyName: 'Axiom Health', sector: 'HealthTech', stage: 'Series A' },
        { id: 'co-2', companyName: 'BridgeCore', sector: 'FinTech', stage: 'Seed' },
      ],
    });
    requestJson.mockResolvedValue([
      {
        id: 'doc-1',
        name: 'Board Minutes Q1',
        uploadedBy: 'Analyst',
        uploadedDate: '2026-01-20',
        size: 4_000_000,
      },
      {
        id: 'doc-2',
        name: 'Compliance SOC 2 Report',
        uploadedBy: 'Ops',
        uploadedDate: '2024-01-01',
        size: 850_000,
        requiresSignature: true,
        signedBy: [],
      },
    ]);

    const service = await import('@/services/portfolio/portfolioDocumentsService');
    const snapshot = await service.fetchPortfolioDocumentsSnapshot('fund-api');

    expect(snapshot.documents).toHaveLength(2);
    expect(snapshot.documents[0].category).toBe('board-materials');
    expect(snapshot.documents[1].status).toBe('pending-review');
    expect(snapshot.companies.length).toBe(2);
    expect(snapshot.companies.some((company) => company.pendingCount > 0)).toBe(true);
  });

  it('falls back to cached snapshot when api returns no documents', async () => {
    isMockMode.mockReturnValue(false);
    fetchPortfolioSnapshot.mockResolvedValue({
      companies: [{ id: 'co-1', companyName: 'Axiom Health', sector: 'HealthTech', stage: 'Series A' }],
    });
    requestJson.mockResolvedValue([
      {
        id: 'doc-1',
        name: 'Investor Update',
        uploadedDate: '2026-01-10',
      },
    ]);

    const service = await import('@/services/portfolio/portfolioDocumentsService');
    const first = await service.fetchPortfolioDocumentsSnapshot('fund-a');
    expect(first.documents).toHaveLength(1);

    requestJson.mockResolvedValue([]);
    const second = await service.fetchPortfolioDocumentsSnapshot('fund-b');
    expect(second.documents).toHaveLength(1);
  });

  it('clears cache and exposes snapshot accessor in api mode', async () => {
    isMockMode.mockReturnValue(false);
    fetchPortfolioSnapshot.mockResolvedValue({
      companies: [{ id: 'co-1', companyName: 'Axiom Health', sector: 'HealthTech', stage: 'Series A' }],
    });
    requestJson.mockRejectedValue(new Error('network down'));

    const service = await import('@/services/portfolio/portfolioDocumentsService');
    const fallback = await service.fetchPortfolioDocumentsSnapshot('fund-fail');
    expect(fallback.documents.length).toBeGreaterThan(0);

    service.clearPortfolioDocumentsSnapshotCache();
    const fromAccessor = service.getPortfolioDocumentsSnapshot();
    expect(fromAccessor.documents.length).toBeGreaterThan(0);
  });
});
