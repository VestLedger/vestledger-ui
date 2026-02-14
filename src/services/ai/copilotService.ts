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
  if (isMockMode('ai')) return getMockCopilotQuickActions(pathname);
  return getMockCopilotQuickActions(pathname);
}

export function getCopilotPageSuggestions(pathname: string): Suggestion[] {
  if (isMockMode('ai')) return getMockCopilotPageSuggestions(pathname);
  return getMockCopilotPageSuggestions(pathname);
}

export function getCopilotContextualResponse(pathname: string, query: string): string {
  if (isMockMode('ai')) return getMockCopilotContextualResponse(pathname, query);
  return getMockCopilotContextualResponse(pathname, query);
}

/**
 * GraphQL-ready function to load suggestions and quick actions together
 * Accepts params even in mock mode for seamless API migration
 */
export function getCopilotSuggestionsAndActions(params: GetCopilotSuggestionsParams): CopilotSuggestionsData {
  if (isMockMode('ai')) {
    // Accept params and pass pathname + tab to mock functions
    return {
      suggestions: getMockCopilotPageSuggestions(params.pathname, params.tab),
      quickActions: getMockCopilotQuickActions(params.pathname, params.tab),
    };
  }

  return {
    suggestions: getMockCopilotPageSuggestions(params.pathname, params.tab),
    quickActions: getMockCopilotQuickActions(params.pathname, params.tab),
  };
}
