import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { PitchDeckAnalysis } from '@/services/ai/pitchDeckService';
import type { Message } from '@/services/ai/ddChatService';
import type { StandardQueryParams } from '@/types/serviceParams';
import type { RootState } from '../rootReducer';

// Data types
export interface PitchDeckData {
  analyses: PitchDeckAnalysis[];
}

export interface DDChatData {
  conversations: Record<string, Message[]>;
}

// Param types
export interface GetPitchDeckAnalysesParams extends Partial<StandardQueryParams> {
  dealId?: string | number;
}

export interface GetDDChatConversationParams extends Partial<StandardQueryParams> {
  dealId: number;
}

// Nested async state structure (similar to copilotSlice)
interface AIState {
  pitchDeckState: AsyncState<PitchDeckData>;
  ddChatState: AsyncState<DDChatData>;
}

const initialState: AIState = {
  pitchDeckState: createInitialAsyncState<PitchDeckData>(),
  ddChatState: createInitialAsyncState<DDChatData>(),
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Pitch Deck actions
    pitchDeckAnalysesRequested: (state, action: PayloadAction<GetPitchDeckAnalysesParams>) => {
      state.pitchDeckState.status = 'loading';
      state.pitchDeckState.error = undefined;
    },
    pitchDeckAnalysesLoaded: (state, action: PayloadAction<PitchDeckData>) => {
      state.pitchDeckState.data = action.payload;
      state.pitchDeckState.status = 'succeeded';
      state.pitchDeckState.error = undefined;
    },
    pitchDeckAnalysesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.pitchDeckState.status = 'failed';
      state.pitchDeckState.error = action.payload;
    },

    // DD Chat actions
    ddChatConversationRequested: (state, action: PayloadAction<GetDDChatConversationParams>) => {
      state.ddChatState.status = 'loading';
      state.ddChatState.error = undefined;
    },
    ddChatConversationLoaded: (state, action: PayloadAction<{ dealId: number; messages: Message[] }>) => {
      if (!state.ddChatState.data) {
        state.ddChatState.data = { conversations: {} };
      }
      state.ddChatState.data.conversations[action.payload.dealId.toString()] = action.payload.messages;
      state.ddChatState.status = 'succeeded';
      state.ddChatState.error = undefined;
    },
    ddChatConversationFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.ddChatState.status = 'failed';
      state.ddChatState.error = action.payload;
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

// Custom selectors for nested pitch deck state
export const pitchDeckSelectors = {
  selectData: (state: RootState) => state.ai.pitchDeckState.data,
  selectStatus: (state: RootState) => state.ai.pitchDeckState.status,
  selectError: (state: RootState) => state.ai.pitchDeckState.error,
  selectIsLoading: (state: RootState) => state.ai.pitchDeckState.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.ai.pitchDeckState.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.ai.pitchDeckState.status === 'failed',
  selectState: (state: RootState) => state.ai.pitchDeckState,
};

// Custom selectors for nested DD chat state
export const ddChatSelectors = {
  selectData: (state: RootState) => state.ai.ddChatState.data,
  selectStatus: (state: RootState) => state.ai.ddChatState.status,
  selectError: (state: RootState) => state.ai.ddChatState.error,
  selectIsLoading: (state: RootState) => state.ai.ddChatState.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.ai.ddChatState.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.ai.ddChatState.status === 'failed',
  selectState: (state: RootState) => state.ai.ddChatState,
  selectConversation: (dealId: string) => (state: RootState) =>
    state.ai.ddChatState.data?.conversations[dealId] || [],
};

export const aiReducer = aiSlice.reducer;
