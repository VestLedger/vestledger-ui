import { isMockMode } from '@/config/data-mode';
import {
  pipelineCopilotSuggestions,
  pipelineDeals,
  pipelineStages,
  type PipelineDeal,
  type PipelineDealOutcome,
} from '@/data/mocks/pipeline';
import type { GetPipelineParams, PipelineData } from '@/store/slices/pipelineSlice';
import {
  createPipelineDealInApi,
  fetchPipelineDealsFromApi,
  fetchPipelineStagesFromApi,
  formatAmountToMillions,
  mapPipelineApiDealToPipelineDeal,
  updatePipelineDealInApi,
} from './shared/pipelineGateway';

export type { PipelineDeal, PipelineDealOutcome };

export interface CreatePipelineDealParams {
  name: string;
  stage: string;
  sector: string;
  amount: number;
  probability: number;
  founder: string;
  fundId?: string | null;
}

const clone = <T>(value: T): T => structuredClone(value);

/**
 * Get pipeline stages
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export async function getPipelineStages(): Promise<string[]> {
  if (isMockMode('pipeline')) return clone(pipelineStages);
  return fetchPipelineStagesFromApi();
}

/**
 * Get pipeline deals
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export async function getPipelineDeals(params: GetPipelineParams = {}): Promise<PipelineDeal[]> {
  if (isMockMode('pipeline')) return clone(pipelineDeals);
  const deals = await fetchPipelineDealsFromApi(params);
  return deals.map(mapPipelineApiDealToPipelineDeal);
}

/**
 * Get copilot suggestions for pipeline
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export function getPipelineCopilotSuggestions() {
  if (isMockMode('pipeline')) return clone(pipelineCopilotSuggestions);
  return [];
}

/**
 * GraphQL-ready function to load complete pipeline data
 * Accepts params even in mock mode for seamless API migration
 */
export async function getPipelineData(params: GetPipelineParams): Promise<PipelineData> {
  if (isMockMode('pipeline')) {
    // Mock mode: Accept params but return static data
    // Future: Filter by stageFilter, apply pagination
    return {
      stages: clone(pipelineStages),
      deals: clone(pipelineDeals),
      copilotSuggestions: clone(pipelineCopilotSuggestions),
    };
  }

  const [stages, apiDeals] = await Promise.all([
    fetchPipelineStagesFromApi(),
    fetchPipelineDealsFromApi(params),
  ]);

  return {
    stages,
    deals: apiDeals.map(mapPipelineApiDealToPipelineDeal),
    // Keep copilot guidance available in API mode until dedicated AI endpoints are available.
    copilotSuggestions: clone(pipelineCopilotSuggestions),
  };
}

export async function createPipelineDeal(input: CreatePipelineDealParams): Promise<PipelineDeal> {
  if (isMockMode('pipeline')) {
    return {
      id: `mock-${Date.now()}`,
      name: input.name,
      stage: input.stage,
      outcome: 'active',
      sector: input.sector,
      amount: formatAmountToMillions(input.amount),
      probability: Math.round(input.probability),
      founder: input.founder,
      lastContact: 'today',
    };
  }

  const created = await createPipelineDealInApi({
    name: input.name,
    stage: input.stage,
    sector: input.sector,
    amount: input.amount,
    probability: input.probability,
    founder: input.founder,
    outcome: 'active',
    fundId: input.fundId,
  });

  return mapPipelineApiDealToPipelineDeal(created);
}

export async function updatePipelineDealStage(
  dealId: number | string,
  stage: string
): Promise<PipelineDeal> {
  if (isMockMode('pipeline')) {
    const existing = pipelineDeals.find((deal) => deal.id === dealId);
    if (!existing) {
      throw new Error(`Pipeline deal not found: ${dealId}`);
    }
    return { ...existing, stage };
  }

  const updated = await updatePipelineDealInApi(String(dealId), { stage });
  return mapPipelineApiDealToPipelineDeal(updated);
}
