import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestJson = vi.fn();

vi.mock('@/services/shared/httpClient', () => ({
  requestJson,
}));

describe('pipelineGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('formats pipeline amounts in millions', async () => {
    const gateway = await import('@/services/shared/pipelineGateway');

    expect(gateway.formatAmountToMillions(25_000_000)).toBe('$25M');
    expect(gateway.formatAmountToMillions(8_500_000)).toBe('$8.5M');
    expect(gateway.formatAmountToMillions(-100)).toBe('$0.0M');
  });

  it('formats relative timestamps for common intervals', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-14T12:00:00.000Z'));

    const gateway = await import('@/services/shared/pipelineGateway');

    expect(gateway.formatRelativeTimestamp('2026-02-14T10:00:00.000Z')).toBe('today');
    expect(gateway.formatRelativeTimestamp('2026-02-13T12:00:00.000Z')).toBe('1 day ago');
    expect(gateway.formatRelativeTimestamp('2026-01-01T00:00:00.000Z')).toBe('1 month ago');
    expect(gateway.formatRelativeTimestamp('invalid')).toBe('Unknown');
    expect(gateway.formatRelativeTimestamp(null)).toBe('No recent contact');
  });

  it('maps API deal payloads to UI pipeline model', async () => {
    const gateway = await import('@/services/shared/pipelineGateway');

    const mapped = gateway.mapPipelineApiDealToPipelineDeal({
      id: 'deal-1',
      name: 'Deal One',
      stage: 'Due Diligence',
      outcome: 'won',
      sector: 'FinTech',
      amount: 12_300_000,
      probability: 74.6,
      founder: 'Taylor',
      updatedAt: '2026-02-14T10:00:00.000Z',
    });

    expect(mapped).toMatchObject({
      id: 'deal-1',
      name: 'Deal One',
      stage: 'Due Diligence',
      outcome: 'won',
      sector: 'FinTech',
      amount: '$12M',
      probability: 75,
      founder: 'Taylor',
      lastContact: 'today',
    });
  });

  it('loads deals and stages via requestJson with normalized responses', async () => {
    requestJson
      .mockResolvedValueOnce({ data: [{ id: 'a', name: 'A' }] })
      .mockResolvedValueOnce([]);

    const gateway = await import('@/services/shared/pipelineGateway');

    const deals = await gateway.fetchPipelineDealsFromApi({
      stageFilter: 'Sourced',
      limit: 10,
    });
    const stages = await gateway.fetchPipelineStagesFromApi();

    expect(deals).toEqual([{ id: 'a', name: 'A' }]);
    expect(stages).toEqual(['Sourced', 'First Meeting', 'Due Diligence', 'Term Sheet', 'Closed']);
    expect(requestJson).toHaveBeenNthCalledWith(
      1,
      '/pipeline/deals',
      expect.objectContaining({
        method: 'GET',
        query: expect.objectContaining({ stage: 'Sourced', limit: 10 }),
      })
    );
    expect(requestJson).toHaveBeenNthCalledWith(
      2,
      '/pipeline/stages',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('creates and updates deals through API gateway endpoints', async () => {
    requestJson
      .mockResolvedValueOnce({ id: 'new-deal' })
      .mockResolvedValueOnce({ id: 'new-deal', stage: 'Closed' });

    const gateway = await import('@/services/shared/pipelineGateway');

    const created = await gateway.createPipelineDealInApi({
      name: 'Created Deal',
      stage: 'Sourced',
      sector: 'Software',
      amount: 1_000_000,
      probability: 30,
      founder: 'Alex',
    });
    const updated = await gateway.updatePipelineDealInApi('new-deal', { stage: 'Closed' });

    expect(created).toEqual({ id: 'new-deal' });
    expect(updated).toEqual({ id: 'new-deal', stage: 'Closed' });

    expect(requestJson).toHaveBeenNthCalledWith(
      1,
      '/pipeline/deals',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ name: 'Created Deal' }),
      })
    );
    expect(requestJson).toHaveBeenNthCalledWith(
      2,
      '/pipeline/deals/new-deal',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({ stage: 'Closed' }),
      })
    );
  });
});
