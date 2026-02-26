import { describe, expect, it } from 'vitest';
import { Sparkles } from 'lucide-react';
import {
  copilotReducer,
  setInputValue,
  clearInputValue,
  setIsTyping,
  setShowSuggestions,
  addMessage,
  setQuickActionsOverride,
  setSuggestionsOverride,
  pushExternalMessage,
  openWithQueryRequested,
  sendMessageRequested,
  quickActionInvoked,
  suggestionInvoked,
  copilotError,
  copilotSuggestionsRequested,
  copilotSuggestionsLoaded,
  copilotSuggestionsFailed,
  copilotSuggestionsSelectors,
  type CopilotMessage,
} from '../copilotSlice';
import type { RootState } from '@/store/rootReducer';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { QuickAction, Suggestion } from '@/services/ai/copilotService';

const quickActions: QuickAction[] = [
  {
    id: 'new-report',
    label: 'Generate report',
    icon: Sparkles,
    aiSuggested: true,
    confidence: 0.88,
  },
];

const suggestions: Suggestion[] = [
  {
    id: 'follow-up',
    text: 'Follow up with overdue LPs',
    reasoning: 'Three LP responses are overdue.',
    confidence: 0.92,
  },
];

const externalMessage = {
  type: 'ai' as const,
  content: 'Pipeline now prioritized by close probability.',
  confidence: 0.84,
};

const chatMessage: CopilotMessage = {
  id: 'chat-1',
  type: 'user',
  content: 'Show overdue LP actions',
  timestamp: new Date('2026-02-14T00:00:00.000Z'),
};

const testError: NormalizedError = {
  message: 'Unable to load suggestions',
  code: 'COPILOT_FAILED',
};

function asRootState(state: ReturnType<typeof copilotReducer>): RootState {
  return { copilot: state } as unknown as RootState;
}

describe('copilotSlice', () => {
  it('returns expected initial state', () => {
    const state = copilotReducer(undefined, { type: '@@INIT' });
    expect(state.inputValue).toBe('');
    expect(state.messages.length).toBeGreaterThan(0);
    expect(state.suggestionsState.status).toBe('idle');
  });

  it('updates core chat UI state', () => {
    let state = copilotReducer(undefined, setInputValue('hello'));
    expect(state.inputValue).toBe('hello');

    state = copilotReducer(state, setIsTyping(true));
    expect(state.isTyping).toBe(true);

    state = copilotReducer(state, setShowSuggestions(false));
    expect(state.showSuggestions).toBe(false);

    state = copilotReducer(state, clearInputValue());
    expect(state.inputValue).toBe('');
  });

  it('handles message and override actions', () => {
    let state = copilotReducer(undefined, addMessage(chatMessage));
    expect(state.messages.at(-1)).toEqual(chatMessage);

    state = copilotReducer(state, pushExternalMessage(externalMessage));
    expect(state.messages.at(-1)?.content).toBe(externalMessage.content);
    expect(state.messages.at(-1)?.type).toBe('ai');

    state = copilotReducer(state, setQuickActionsOverride(quickActions));
    state = copilotReducer(state, setSuggestionsOverride(suggestions));
    expect(state.quickActionsOverride).toEqual(quickActions);
    expect(state.suggestionsOverride).toEqual(suggestions);
  });

  it('keeps state stable for request-only chat actions and clears error', () => {
    let state = copilotReducer(undefined, copilotError('stale'));
    expect(state.error).toBe('stale');

    state = copilotReducer(state, openWithQueryRequested({ pathname: '/pipeline', query: 'New tasks' }));
    expect(state.error).toBeNull();

    state = copilotReducer(state, sendMessageRequested({ pathname: '/pipeline', content: 'Summarize risks' }));
    state = copilotReducer(state, quickActionInvoked({ pathname: '/home', action: quickActions[0] }));
    state = copilotReducer(state, suggestionInvoked({ suggestion: suggestions[0] }));
    expect(state.error).toBeNull();
  });

  it('handles async suggestions lifecycle and selectors', () => {
    let state = copilotReducer(undefined, copilotSuggestionsRequested({ pathname: '/pipeline' }));
    expect(state.suggestionsState.status).toBe('loading');

    state = copilotReducer(state, copilotSuggestionsLoaded({ suggestions, quickActions }));
    const root = asRootState(state);
    expect(copilotSuggestionsSelectors.selectData(root)).toEqual({ suggestions, quickActions });
    expect(copilotSuggestionsSelectors.selectStatus(root)).toBe('succeeded');
    expect(copilotSuggestionsSelectors.selectError(root)).toBeUndefined();
    expect(copilotSuggestionsSelectors.selectIsLoading(root)).toBe(false);
    expect(copilotSuggestionsSelectors.selectIsSucceeded(root)).toBe(true);
    expect(copilotSuggestionsSelectors.selectIsFailed(root)).toBe(false);
    expect(copilotSuggestionsSelectors.selectState(root)).toEqual(state.suggestionsState);

    state = copilotReducer(state, copilotSuggestionsFailed(testError));
    const failedRoot = asRootState(state);
    expect(copilotSuggestionsSelectors.selectStatus(failedRoot)).toBe('failed');
    expect(copilotSuggestionsSelectors.selectError(failedRoot)).toEqual(testError);
    expect(copilotSuggestionsSelectors.selectIsFailed(failedRoot)).toBe(true);
  });
});
