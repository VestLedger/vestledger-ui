import { isMockMode } from "@/config/data-mode";
import {
  mockAnalyses,
  type PitchDeckAnalysis,
} from "@/data/mocks/ai/pitch-deck-reader";
import {
  createAIAvailableResult,
  createAIUnavailableResult,
  type AIServiceResult,
} from "@/services/ai/aiDegradedMode";
import type { GetPitchDeckAnalysesParams } from "@/store/slices/aiSlice";

export type { PitchDeckAnalysis };
export type PitchDeckAnalysesResult = AIServiceResult<PitchDeckAnalysis[]>;

const PITCH_DECK_UNAVAILABLE_MESSAGE =
  "Pitch deck AI analysis is unavailable in API mode until the backend extraction and analysis workflow is implemented.";

/**
 * Get pitch deck analyses with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getPitchDeckAnalyses(
  params: GetPitchDeckAnalysesParams,
): PitchDeckAnalysesResult {
  if (isMockMode("ai")) {
    // Mock mode: Accept params but return static data
    // Future: Filter by dealId, apply pagination
    return createAIAvailableResult(mockAnalyses, "demo");
  }

  return createAIUnavailableResult({
    service: "pitch-deck-reader",
    message: PITCH_DECK_UNAVAILABLE_MESSAGE,
    sourceRef: "ai/pitch-deck-reader",
    details: { dealId: params.dealId ?? null },
  });
}
