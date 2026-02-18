import { isMockMode } from '@/config/data-mode';
import {
  getMockCopilotContextualResponse,
  getMockCopilotPageSuggestions,
  getMockCopilotQuickActions,
  type QuickAction,
  type Suggestion,
} from '@/data/mocks/ai/copilot';
import { requestJson } from '@/services/shared/httpClient';
import type { GetCopilotSuggestionsParams, CopilotSuggestionsData } from '@/store/slices/copilotSlice';

export type { QuickAction, Suggestion };

export async function getCopilotQuickActions(pathname: string): Promise<QuickAction[]> {
  if (isMockMode('ai')) return getMockCopilotQuickActions(pathname);
  try {
    const data = await requestJson<QuickAction[]>('/ai/copilot/quick-actions', {
      query: { pathname },
      fallbackMessage: 'Failed to load copilot quick actions',
    });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCopilotPageSuggestions(pathname: string): Promise<Suggestion[]> {
  if (isMockMode('ai')) return getMockCopilotPageSuggestions(pathname);
  try {
    const data = await requestJson<Suggestion[]>('/ai/copilot/suggestions', {
      query: { pathname },
      fallbackMessage: 'Failed to load copilot suggestions',
    });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCopilotContextualResponse(pathname: string, query: string): Promise<string> {
  if (isMockMode('ai')) return getMockCopilotContextualResponse(pathname, query);
  try {
    const data = await requestJson<{ response: string }>('/ai/copilot/respond', {
      method: 'POST',
      body: { message: query, pathname },
      fallbackMessage: 'Failed to get copilot response',
    });
    return data?.response ?? '';
  } catch {
    return '';
  }
}

/**
 * GraphQL-ready function to load suggestions and quick actions together
 * Accepts params even in mock mode for seamless API migration
 */
export async function getCopilotSuggestionsAndActions(params: GetCopilotSuggestionsParams): Promise<CopilotSuggestionsData> {
  if (isMockMode('ai')) {
    return {
      suggestions: getMockCopilotPageSuggestions(params.pathname, params.tab),
      quickActions: getMockCopilotQuickActions(params.pathname, params.tab),
    };
  }

  try {
    const [suggestions, quickActions] = await Promise.all([
      requestJson<Suggestion[]>('/ai/copilot/suggestions', {
        query: { pathname: params.pathname, tab: params.tab },
        fallbackMessage: 'Failed to load copilot suggestions',
      }),
      requestJson<QuickAction[]>('/ai/copilot/quick-actions', {
        query: { pathname: params.pathname, tab: params.tab },
        fallbackMessage: 'Failed to load copilot quick actions',
      }),
    ]);
    return { suggestions: suggestions ?? [], quickActions: quickActions ?? [] };
  } catch {
    return { suggestions: [], quickActions: [] };
  }
}
