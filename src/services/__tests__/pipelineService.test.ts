import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  pipelineCopilotSuggestions,
  pipelineDeals,
  pipelineStages,
} from '@/data/mocks/pipeline';

const isMockMode = vi.fn(() => true);
const createPipelineDealInApi = vi.fn();
const fetchPipelineDealsFromApi = vi.fn();
const fetchPipelineStagesFromApi = vi.fn();
const mapPipelineApiDealToPipelineDeal = vi.fn();
const updatePipelineDealInApi = vi.fn();
const formatAmountToMillions = vi.fn((amount: number) => `$${amount / 1_000_000}M`);

vi.mock('@/config/data-mode', () => ({
  isMockMode,
}));

vi.mock('@/services/shared/pipelineGateway', () => ({
  createPipelineDealInApi,
  fetchPipelineDealsFromApi,
  fetchPipelineStagesFromApi,
  mapPipelineApiDealToPipelineDeal,
  updatePipelineDealInApi,
  formatAmountToMillions,
}));

describe('pipelineService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isMockMode.mockReturnValue(true);
  });

  it('returns cloned centralized mock data in mock mode', async () => {
    const service = await import('@/services/pipelineService');

    const stages = await service.getPipelineStages();
    const deals = await service.getPipelineDeals();
    const data = await service.getPipelineData({});
    const suggestions = service.getPipelineCopilotSuggestions();

    expect(stages).toEqual(pipelineStages);
    expect(deals).toEqual(pipelineDeals);
    expect(data.stages).toEqual(pipelineStages);
    expect(data.deals).toEqual(pipelineDeals);
    expect(data.copilotSuggestions).toEqual(pipelineCopilotSuggestions);
    expect(suggestions).toEqual(pipelineCopilotSuggestions);

    expect(stages).not.toBe(pipelineStages);
    expect(deals).not.toBe(pipelineDeals);
    expect(data.copilotSuggestions).not.toBe(pipelineCopilotSuggestions);
  });

  it('loads API-backed pipeline data in api mode', async () => {
    isMockMode.mockReturnValue(false);
    fetchPipelineStagesFromApi.mockResolvedValue(['Sourced']);
    fetchPipelineDealsFromApi.mockResolvedValue([
      { id: 'deal-1' },
      { id: 'deal-2' },
    ]);
    mapPipelineApiDealToPipelineDeal
      .mockReturnValueOnce({ id: 'mapped-1' })
      .mockReturnValueOnce({ id: 'mapped-2' });

    const service = await import('@/services/pipelineService');
    const data = await service.getPipelineData({ stageFilter: 'Sourced' });

    expect(fetchPipelineStagesFromApi).toHaveBeenCalledTimes(1);
    expect(fetchPipelineDealsFromApi).toHaveBeenCalledWith({ stageFilter: 'Sourced' });
    expect(mapPipelineApiDealToPipelineDeal).toHaveBeenCalledTimes(2);
    expect(data).toEqual({
      stages: ['Sourced'],
      deals: [{ id: 'mapped-1' }, { id: 'mapped-2' }],
      copilotSuggestions: pipelineCopilotSuggestions,
    });
  });

  it('creates a mock pipeline deal locally in mock mode', async () => {
    const service = await import('@/services/pipelineService');
    const created = await service.createPipelineDeal({
      name: 'New Deal',
      stage: 'Sourced',
      sector: 'AI',
      amount: 2_500_000,
      probability: 48.9,
      founder: 'Jordan',
    });

    expect(created).toMatchObject({
      id: expect.stringMatching(/^mock-/),
      name: 'New Deal',
      stage: 'Sourced',
      sector: 'AI',
      amount: '$2.5M',
      probability: 49,
      founder: 'Jordan',
      outcome: 'active',
      lastContact: 'today',
    });
    expect(formatAmountToMillions).toHaveBeenCalledWith(2_500_000);
  });

  it('updates mock deal stage and throws when deal id is unknown', async () => {
    const service = await import('@/services/pipelineService');
    const updated = await service.updatePipelineDealStage(pipelineDeals[0].id, 'Closed');

    expect(updated).toMatchObject({
      id: pipelineDeals[0].id,
      stage: 'Closed',
    });

    await expect(service.updatePipelineDealStage('missing-id', 'Closed')).rejects.toThrow(
      'Pipeline deal not found: missing-id'
    );
  });

  it('creates and updates via API gateway in api mode', async () => {
    isMockMode.mockReturnValue(false);
    createPipelineDealInApi.mockResolvedValue({ id: 'api-created' });
    updatePipelineDealInApi.mockResolvedValue({ id: 'api-updated' });
    mapPipelineApiDealToPipelineDeal
      .mockReturnValueOnce({ id: 'mapped-created' })
      .mockReturnValueOnce({ id: 'mapped-updated' });

    const service = await import('@/services/pipelineService');
    const created = await service.createPipelineDeal({
      name: 'API Deal',
      stage: 'Sourced',
      sector: 'Health',
      amount: 4_000_000,
      probability: 70,
      founder: 'Riley',
      fundId: 'fund-1',
    });
    const updated = await service.updatePipelineDealStage('api-created', 'Due Diligence');

    expect(createPipelineDealInApi).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'API Deal',
        outcome: 'active',
        fundId: 'fund-1',
      })
    );
    expect(updatePipelineDealInApi).toHaveBeenCalledWith('api-created', { stage: 'Due Diligence' });
    expect(created).toEqual({ id: 'mapped-created' });
    expect(updated).toEqual({ id: 'mapped-updated' });
  });
});
