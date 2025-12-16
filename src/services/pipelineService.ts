import { isMockMode } from '@/config/data-mode';
import {
  pipelineCopilotSuggestions,
  pipelineDeals,
  pipelineStages,
  type PipelineDeal,
  type PipelineDealOutcome,
} from '@/data/mocks/pipeline';

export type { PipelineDeal, PipelineDealOutcome };

export function getPipelineStages(): string[] {
  if (isMockMode()) return pipelineStages;
  throw new Error('Pipeline API not implemented yet');
}

export function getPipelineDeals(): PipelineDeal[] {
  if (isMockMode()) return pipelineDeals;
  throw new Error('Pipeline API not implemented yet');
}

export function getPipelineCopilotSuggestions() {
  if (isMockMode()) return pipelineCopilotSuggestions;
  return [];
}

