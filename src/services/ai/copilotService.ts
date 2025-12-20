import { isMockMode } from '@/config/data-mode';
import {
  getMockCopilotContextualResponse,
  getMockCopilotPageSuggestions,
  getMockCopilotQuickActions,
  type QuickAction,
  type Suggestion,
} from '@/data/mocks/ai/copilot';
import type { GetCopilotSuggestionsParams, CopilotSuggestionsData } from '@/store/slices/copilotSlice';

export type { QuickAction, Suggestion };

export function getCopilotQuickActions(pathname: string): QuickAction[] {
  if (isMockMode()) return getMockCopilotQuickActions(pathname);
  return [];
}

export function getCopilotPageSuggestions(pathname: string): Suggestion[] {
  if (isMockMode()) return getMockCopilotPageSuggestions(pathname);
  return [];
}

export function getCopilotContextualResponse(pathname: string, query: string): string {
  if (isMockMode()) return getMockCopilotContextualResponse(pathname, query);
  throw new Error('Copilot API not implemented yet');
}

/**
 * GraphQL-ready function to load suggestions and quick actions together
 * Accepts params even in mock mode for seamless API migration
 */
export function getCopilotSuggestionsAndActions(params: GetCopilotSuggestionsParams): CopilotSuggestionsData {
  if (isMockMode()) {
    // Accept params and pass pathname + tab to mock functions
    return {
      suggestions: getMockCopilotPageSuggestions(params.pathname, params.tab),
      quickActions: getMockCopilotQuickActions(params.pathname, params.tab),
    };
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_COPILOT_SUGGESTIONS, variables: params })
  throw new Error('Copilot suggestions API not implemented yet');
}

