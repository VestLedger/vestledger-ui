import { isMockMode } from '@/config/data-mode';
import { mockAnalyses, type PitchDeckAnalysis } from '@/data/mocks/ai/pitch-deck-reader';

export type { PitchDeckAnalysis };

export function getPitchDeckAnalyses(): PitchDeckAnalysis[] {
  if (isMockMode()) return mockAnalyses;
  throw new Error('Pitch deck API not implemented yet');
}

