import { isMockMode } from '@/config/data-mode';
import {
  pipelineCopilotSuggestions,
  pipelineDeals,
  pipelineStages,
  type PipelineDeal,
  type PipelineDealOutcome,
} from '@/data/mocks/pipeline';
import type { GetPipelineParams, PipelineData } from '@/store/slices/pipelineSlice';

export type { PipelineDeal, PipelineDealOutcome };

/**
 * Get pipeline stages
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export function getPipelineStages(): string[] {
  if (isMockMode()) return pipelineStages;
  throw new Error('Pipeline API not implemented yet');
}

/**
 * Get pipeline deals
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export function getPipelineDeals(): PipelineDeal[] {
  if (isMockMode()) return pipelineDeals;
  throw new Error('Pipeline API not implemented yet');
}

/**
 * Get copilot suggestions for pipeline
 * @deprecated Use getPipelineData() instead for full pipeline data
 */
export function getPipelineCopilotSuggestions() {
  if (isMockMode()) return pipelineCopilotSuggestions;
  return [];
}

/**
 * GraphQL-ready function to load complete pipeline data
 * Accepts params even in mock mode for seamless API migration
 */
export function getPipelineData(params: GetPipelineParams): PipelineData {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Filter by fundId, stageFilter, apply pagination
    return {
      stages: pipelineStages,
      deals: pipelineDeals,
      copilotSuggestions: pipelineCopilotSuggestions,
    };
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_PIPELINE, variables: params })
  throw new Error('Pipeline API not implemented yet');
}
