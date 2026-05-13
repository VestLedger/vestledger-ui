import { isMockMode } from "@/config/data-mode";
import {
  getMockCopilotContextualResponse,
  getMockCopilotPageSuggestions,
  getMockCopilotQuickActions,
  type QuickAction,
  type Suggestion,
} from "@/data/mocks/ai/copilot";
import {
  createAIAvailableResult,
  createAIUnavailableResult,
  isAIUnavailableResult,
  type AIServiceName,
  type AIServiceResult,
} from "@/services/ai/aiDegradedMode";
import { requestJson } from "@/services/shared/httpClient";
import type {
  GetCopilotSuggestionsParams,
  CopilotSuggestionsData,
} from "@/store/slices/copilotSlice";
import type { DataModeUnavailableResult } from "@/config/data-mode";

export type { QuickAction, Suggestion };
export type CopilotResponseResult = AIServiceResult<string>;
export type CopilotQuickActionsResult = AIServiceResult<QuickAction[]>;
export type CopilotPageSuggestionsResult = AIServiceResult<Suggestion[]>;

const COPILOT_UNAVAILABLE_MESSAGES: Record<AIServiceName, string> = {
  "ai-badges":
    "AI navigation badges are unavailable until live badge scoring is implemented.",
  "copilot-contextual-response":
    "Vesta responses are unavailable in API mode until the backend assistant service is implemented.",
  "copilot-quick-actions":
    "Vesta quick actions are unavailable in API mode until live action recommendations are implemented.",
  "copilot-suggestions":
    "Vesta suggestions are unavailable in API mode until live recommendations are implemented.",
  "decision-writer":
    "Decision writer is unavailable until backend generation is implemented.",
  "dd-chat":
    "AI due diligence chat is unavailable until backend retrieval is implemented.",
  "pitch-deck-reader":
    "Pitch deck AI analysis is unavailable until backend analysis is implemented.",
};

function createCopilotUnavailableResult(
  service: Extract<
    AIServiceName,
    | "copilot-contextual-response"
    | "copilot-quick-actions"
    | "copilot-suggestions"
  >,
  sourceRef: string,
  details?: Record<string, unknown>,
): DataModeUnavailableResult {
  return createAIUnavailableResult({
    service,
    classification: "hybrid-with-explicit-state",
    reason: "provider_unavailable",
    message: COPILOT_UNAVAILABLE_MESSAGES[service],
    sourceRef,
    details,
  });
}

export async function getCopilotQuickActions(
  pathname: string,
  tab?: string | null,
): Promise<CopilotQuickActionsResult> {
  if (isMockMode("ai"))
    return createAIAvailableResult(
      getMockCopilotQuickActions(pathname, tab),
      "demo",
    );
  try {
    const data = await requestJson<QuickAction[]>("/ai/copilot/quick-actions", {
      query: { pathname, tab },
      fallbackMessage: "Failed to load copilot quick actions",
    });
    if (data) return createAIAvailableResult(data, "live");
  } catch {
    // API mode must not substitute bundled quick-action mocks.
  }

  return createCopilotUnavailableResult(
    "copilot-quick-actions",
    "GET /ai/copilot/quick-actions",
    { pathname, tab },
  );
}

export async function getCopilotPageSuggestions(
  pathname: string,
  tab?: string | null,
): Promise<CopilotPageSuggestionsResult> {
  if (isMockMode("ai"))
    return createAIAvailableResult(
      getMockCopilotPageSuggestions(pathname, tab),
      "demo",
    );
  try {
    const data = await requestJson<Suggestion[]>("/ai/copilot/suggestions", {
      query: { pathname, tab },
      fallbackMessage: "Failed to load copilot suggestions",
    });
    if (data) return createAIAvailableResult(data, "live");
  } catch {
    // API mode must not substitute bundled suggestion mocks.
  }

  return createCopilotUnavailableResult(
    "copilot-suggestions",
    "GET /ai/copilot/suggestions",
    { pathname, tab },
  );
}

export async function getCopilotContextualResponse(
  pathname: string,
  query: string,
): Promise<CopilotResponseResult> {
  if (isMockMode("ai"))
    return createAIAvailableResult(
      getMockCopilotContextualResponse(pathname, query),
      "demo",
    );
  try {
    const data = await requestJson<{ response: string }>(
      "/ai/copilot/respond",
      {
        method: "POST",
        body: { message: query, pathname },
        fallbackMessage: "Failed to get copilot response",
      },
    );
    if (data?.response) return createAIAvailableResult(data.response, "live");
  } catch {
    // API mode must not substitute contextual mock responses.
  }

  return createCopilotUnavailableResult(
    "copilot-contextual-response",
    "POST /ai/copilot/respond",
    { pathname, query },
  );
}

/**
 * GraphQL-ready function to load suggestions and quick actions together
 * Accepts params even in mock mode for seamless API migration
 */
export async function getCopilotSuggestionsAndActions(
  params: GetCopilotSuggestionsParams,
): Promise<CopilotSuggestionsData> {
  if (isMockMode("ai")) {
    return {
      suggestions: getMockCopilotPageSuggestions(params.pathname, params.tab),
      quickActions: getMockCopilotQuickActions(params.pathname, params.tab),
    };
  }

  const [suggestionsResult, quickActionsResult] = await Promise.all([
    getCopilotPageSuggestions(params.pathname, params.tab),
    getCopilotQuickActions(params.pathname, params.tab),
  ]);

  const unavailable =
    (isAIUnavailableResult(suggestionsResult) ? suggestionsResult : null) ??
    (isAIUnavailableResult(quickActionsResult) ? quickActionsResult : null) ??
    undefined;

  return {
    suggestions: suggestionsResult.ok ? suggestionsResult.data : [],
    quickActions: quickActionsResult.ok ? quickActionsResult.data : [],
    unavailable,
  };
}
