import { isMockMode } from '@/config/data-mode';
import { mockAnalyses, type PitchDeckAnalysis } from '@/data/mocks/ai/pitch-deck-reader';
import type { GetPitchDeckAnalysesParams } from '@/store/slices/aiSlice';

export type { PitchDeckAnalysis };

/**
 * Get pitch deck analyses with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getPitchDeckAnalyses(_params: GetPitchDeckAnalysesParams): PitchDeckAnalysis[] {
  if (isMockMode('ai')) {
    // Mock mode: Accept params but return static data
    // Future: Filter by dealId, apply pagination
    return mockAnalyses;
  }

  return mockAnalyses;
}
