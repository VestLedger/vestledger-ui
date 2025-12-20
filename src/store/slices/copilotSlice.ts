import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { QuickAction, Suggestion } from '@/services/ai/copilotService';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface CopilotMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
}

export type ExternalCopilotMessage = {
  content: string;
  type?: 'user' | 'ai';
  confidence?: number;
};

export interface CopilotSuggestionsData {
  suggestions: Suggestion[];
  quickActions: QuickAction[];
}

export interface GetCopilotSuggestionsParams extends Partial<StandardQueryParams> {
  pathname: string;
  tab?: string | null; // Current active tab on the page
  context?: Record<string, any>; // Additional context (selected items, filters, etc.)
}

interface CopilotState {
  // Chat messages and UI state
  messages: CopilotMessage[];
  inputValue: string;
  isTyping: boolean;
  showSuggestions: boolean;
  quickActionsOverride: QuickAction[] | null;
  suggestionsOverride: Suggestion[] | null;

  // Async state for suggestions/actions
  suggestionsState: AsyncState<CopilotSuggestionsData>;

  // Legacy error for chat operations
  error: string | null;
}

const initialState: CopilotState = {
  messages: [
    {
      id: '1',
      type: 'ai',
      content:
        "Hi! I'm Vesta, your AI assistant. I'm here to help you navigate VestLedger, analyze data, and automate tasks. What would you like to do today?",
      timestamp: new Date(),
      confidence: 0.95,
    },
  ],
  inputValue: '',
  isTyping: false,
  showSuggestions: true,
  quickActionsOverride: null,
  suggestionsOverride: null,
  suggestionsState: createInitialAsyncState<CopilotSuggestionsData>(),
  error: null,
};

const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.inputValue = action.payload;
    },
    clearInputValue: (state) => {
      state.inputValue = '';
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setShowSuggestions: (state, action: PayloadAction<boolean>) => {
      state.showSuggestions = action.payload;
    },
    addMessage: (state, action: PayloadAction<CopilotMessage>) => {
      state.messages = [...state.messages, action.payload];
    },
    setQuickActionsOverride: (state, action: PayloadAction<QuickAction[] | null>) => {
      state.quickActionsOverride = action.payload;
    },
    setSuggestionsOverride: (state, action: PayloadAction<Suggestion[] | null>) => {
      state.suggestionsOverride = action.payload;
    },
    pushExternalMessage: (state, action: PayloadAction<ExternalCopilotMessage>) => {
      state.messages = [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: action.payload.type || 'ai',
          content: action.payload.content,
          timestamp: new Date(),
          confidence: action.payload.confidence,
        },
      ];
    },
    openWithQueryRequested: (
      state,
      _action: PayloadAction<{ pathname: string; query: string }>
    ) => {
      state.error = null;
    },
    sendMessageRequested: (
      state,
      _action: PayloadAction<{ pathname: string; content: string }>
    ) => {
      state.error = null;
    },
    quickActionInvoked: (
      state,
      _action: PayloadAction<{ pathname: string; action: QuickAction }>
    ) => {
      state.error = null;
    },
    suggestionInvoked: (
      state,
      _action: PayloadAction<{ suggestion: Suggestion }>
    ) => {
      state.error = null;
    },
    copilotError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isTyping = false;
    },

    // Async actions for loading suggestions/quick actions
    copilotSuggestionsRequested: (state, action: PayloadAction<GetCopilotSuggestionsParams>) => {
      state.suggestionsState.status = 'loading';
      state.suggestionsState.error = undefined;
    },
    copilotSuggestionsLoaded: (state, action: PayloadAction<CopilotSuggestionsData>) => {
      state.suggestionsState.data = action.payload;
      state.suggestionsState.status = 'succeeded';
      state.suggestionsState.error = undefined;
    },
    copilotSuggestionsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.suggestionsState.status = 'failed';
      state.suggestionsState.error = action.payload;
    },
  },
});

export const {
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
} = copilotSlice.actions;

// Custom selectors for nested suggestions state
import type { RootState } from '../rootReducer';

export const copilotSuggestionsSelectors = {
  selectData: (state: RootState) => state.copilot.suggestionsState.data,
  selectStatus: (state: RootState) => state.copilot.suggestionsState.status,
  selectError: (state: RootState) => state.copilot.suggestionsState.error,
  selectIsLoading: (state: RootState) => state.copilot.suggestionsState.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.copilot.suggestionsState.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.copilot.suggestionsState.status === 'failed',
  selectState: (state: RootState) => state.copilot.suggestionsState,
};

export const copilotReducer = copilotSlice.reducer;
