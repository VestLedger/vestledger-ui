import { isMockMode } from '@/config/data-mode';
import { mockAnalyses, type PitchDeckAnalysis } from '@/data/mocks/ai/pitch-deck-reader';
import type { GetPitchDeckAnalysesParams } from '@/store/slices/aiSlice';

export type { PitchDeckAnalysis };

/**
 * Get pitch deck analyses with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getPitchDeckAnalyses(params: GetPitchDeckAnalysesParams): PitchDeckAnalysis[] {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Filter by dealId, apply pagination
    return mockAnalyses;
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_PITCH_DECK_ANALYSES, variables: params })
  throw new Error('Pitch deck API not implemented yet');
}
