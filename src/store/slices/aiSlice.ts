import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PitchDeckAnalysis } from '@/services/ai/pitchDeckService';
import type { Message } from '@/services/ai/ddChatService';

interface AIState {
  // Pitch Deck Reader
  pitchDeck: {
    analyses: PitchDeckAnalysis[];
    loading: boolean;
    error: string | null;
  };

  // DD Chat Assistant
  ddChat: {
    conversations: Record<string, Message[]>;
    loading: boolean;
    error: string | null;
  };
}

const initialState: AIState = {
  pitchDeck: {
    analyses: [],
    loading: false,
    error: null,
  },
  ddChat: {
    conversations: {},
    loading: false,
    error: null,
  },
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Pitch Deck actions
    pitchDeckAnalysesRequested: (state) => {
      state.pitchDeck.loading = true;
      state.pitchDeck.error = null;
    },
    pitchDeckAnalysesLoaded: (state, action: PayloadAction<PitchDeckAnalysis[]>) => {
      state.pitchDeck.analyses = action.payload;
      state.pitchDeck.loading = false;
    },
    pitchDeckAnalysesFailed: (state, action: PayloadAction<string>) => {
      state.pitchDeck.error = action.payload;
      state.pitchDeck.loading = false;
    },

    // DD Chat actions
    ddChatConversationRequested: (state, action: PayloadAction<number>) => {
      state.ddChat.loading = true;
      state.ddChat.error = null;
    },
    ddChatConversationLoaded: (state, action: PayloadAction<{ dealId: number; messages: Message[] }>) => {
      state.ddChat.conversations[action.payload.dealId.toString()] = action.payload.messages;
      state.ddChat.loading = false;
    },
    ddChatConversationFailed: (state, action: PayloadAction<string>) => {
      state.ddChat.error = action.payload;
      state.ddChat.loading = false;
    },
  },
});

export const {
  pitchDeckAnalysesRequested,
  pitchDeckAnalysesLoaded,
  pitchDeckAnalysesFailed,
  ddChatConversationRequested,
  ddChatConversationLoaded,
  ddChatConversationFailed,
} = aiSlice.actions;

export const aiReducer = aiSlice.reducer;
