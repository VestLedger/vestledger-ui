import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { QuickAction, Suggestion } from '@/services/ai/copilotService';

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

interface CopilotState {
  messages: CopilotMessage[];
  inputValue: string;
  isTyping: boolean;
  showSuggestions: boolean;
  quickActionsOverride: QuickAction[] | null;
  suggestionsOverride: Suggestion[] | null;
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
      void state;
    },
    sendMessageRequested: (
      state,
      _action: PayloadAction<{ pathname: string; content: string }>
    ) => {
      void state;
    },
    quickActionInvoked: (
      state,
      _action: PayloadAction<{ pathname: string; action: QuickAction }>
    ) => {
      void state;
    },
    suggestionInvoked: (
      state,
      _action: PayloadAction<{ suggestion: Suggestion }>
    ) => {
      void state;
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
} = copilotSlice.actions;

export const copilotReducer = copilotSlice.reducer;
