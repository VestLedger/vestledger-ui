import { isMockMode } from '@/config/data-mode';
import {
  getMockCopilotContextualResponse,
  getMockCopilotPageSuggestions,
  getMockCopilotQuickActions,
  type QuickAction,
  type Suggestion,
} from '@/data/mocks/ai/copilot';

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

