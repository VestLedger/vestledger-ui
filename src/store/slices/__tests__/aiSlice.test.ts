import { describe, expect, it } from 'vitest';
import {
  aiReducer,
  pitchDeckAnalysesRequested,
  pitchDeckAnalysesLoaded,
  pitchDeckAnalysesFailed,
  ddChatConversationRequested,
  ddChatConversationLoaded,
  ddChatConversationFailed,
  pitchDeckSelectors,
  ddChatSelectors,
} from '../aiSlice';
import type { RootState } from '@/store/rootReducer';
import type { NormalizedError } from '@/store/types/AsyncState';
import { mockAnalyses } from '@/data/mocks/ai/pitch-deck-reader';
import type { Message } from '@/services/ai/ddChatService';

const ddMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Runway is 18 months based on current burn.',
    timestamp: new Date('2026-02-14T00:00:00.000Z'),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'What is the main risk?',
    timestamp: new Date('2026-02-14T00:05:00.000Z'),
  },
];

const testError: NormalizedError = {
  message: 'AI request failed',
  code: 'AI_FAILED',
};

function asRootState(state: ReturnType<typeof aiReducer>): RootState {
  return { ai: state } as unknown as RootState;
}

describe('aiSlice', () => {
  it('returns expected initial state', () => {
    const state = aiReducer(undefined, { type: '@@INIT' });
    expect(state.pitchDeckState.status).toBe('idle');
    expect(state.ddChatState.status).toBe('idle');
  });

  it('handles pitch deck lifecycle and selectors', () => {
    let state = aiReducer(undefined, pitchDeckAnalysesRequested({ dealId: 'deal-1' }));
    expect(state.pitchDeckState.status).toBe('loading');

    state = aiReducer(state, pitchDeckAnalysesLoaded({ analyses: mockAnalyses.slice(0, 2) }));
    const root = asRootState(state);
    expect(pitchDeckSelectors.selectData(root)).toEqual({ analyses: mockAnalyses.slice(0, 2) });
    expect(pitchDeckSelectors.selectStatus(root)).toBe('succeeded');
    expect(pitchDeckSelectors.selectError(root)).toBeUndefined();
    expect(pitchDeckSelectors.selectIsLoading(root)).toBe(false);
    expect(pitchDeckSelectors.selectIsSucceeded(root)).toBe(true);
    expect(pitchDeckSelectors.selectIsFailed(root)).toBe(false);
    expect(pitchDeckSelectors.selectState(root)).toEqual(state.pitchDeckState);

    state = aiReducer(state, pitchDeckAnalysesFailed(testError));
    expect(pitchDeckSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles DD chat lifecycle and selectors', () => {
    let state = aiReducer(undefined, ddChatConversationRequested({ dealId: 42 }));
    expect(state.ddChatState.status).toBe('loading');

    state = aiReducer(state, ddChatConversationLoaded({ dealId: 42, messages: ddMessages.slice(0, 1) }));
    expect(state.ddChatState.data?.conversations['42']).toEqual(ddMessages.slice(0, 1));

    state = aiReducer(state, ddChatConversationLoaded({ dealId: 42, messages: ddMessages }));
    expect(state.ddChatState.data?.conversations['42']).toEqual(ddMessages);

    const root = asRootState(state);
    expect(ddChatSelectors.selectData(root)).toEqual(state.ddChatState.data);
    expect(ddChatSelectors.selectStatus(root)).toBe('succeeded');
    expect(ddChatSelectors.selectError(root)).toBeUndefined();
    expect(ddChatSelectors.selectIsLoading(root)).toBe(false);
    expect(ddChatSelectors.selectIsSucceeded(root)).toBe(true);
    expect(ddChatSelectors.selectIsFailed(root)).toBe(false);
    expect(ddChatSelectors.selectState(root)).toEqual(state.ddChatState);
    expect(ddChatSelectors.selectConversation('42')(root)).toEqual(ddMessages);
    expect(ddChatSelectors.selectConversation('999')(root)).toEqual([]);

    state = aiReducer(state, ddChatConversationFailed(testError));
    expect(ddChatSelectors.selectError(asRootState(state))).toEqual(testError);
  });
});
