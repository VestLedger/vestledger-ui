import { isMockMode } from "@/config/data-mode";
import {
  calculateAIBadges,
  type BadgeData,
} from "@/data/mocks/hooks/ai-badges";
import {
  createAIAvailableResult,
  createAIUnavailableResult,
  type AIServiceResult,
} from "@/services/ai/aiDegradedMode";
import { requestJson } from "@/services/shared/httpClient";

export type { BadgeData };
export type AIBadgesResult = AIServiceResult<BadgeData>;

const AI_BADGES_UNAVAILABLE_MESSAGE =
  "AI navigation badges are unavailable in API mode until live badge scoring is backed by tenant-scoped evidence.";

export async function calculateBadges(): Promise<AIBadgesResult> {
  if (isMockMode("ai"))
    return createAIAvailableResult(calculateAIBadges(), "demo");
  try {
    const data = await requestJson<BadgeData>("/ai/badges", {
      fallbackMessage: "Failed to load AI badges",
    });
    if (data) return createAIAvailableResult(data, "live");
  } catch {
    // API mode must not substitute the demo badge calculations.
  }

  return createAIUnavailableResult({
    service: "ai-badges",
    classification: "hybrid-with-explicit-state",
    reason: "provider_unavailable",
    message: AI_BADGES_UNAVAILABLE_MESSAGE,
    sourceRef: "GET /ai/badges",
  });
}
