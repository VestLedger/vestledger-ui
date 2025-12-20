import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * UI Effects Slice
 *
 * This slice has no state and serves solely as a trigger mechanism for sagas.
 * Actions defined here are meant to be intercepted by sagas to perform side effects
 * (e.g., API calls, localStorage operations, navigation, etc.) without storing data
 * in Redux state.
 *
 * This pattern is useful for:
 * - One-off operations that don't need state (e.g., export reports, copy to clipboard)
 * - Coordinating multiple saga operations from a single action
 * - Lifecycle events (e.g., clientMounted for hydration timing)
 */
interface UIEffectsState {}

const initialState: UIEffectsState = {};

const uiEffectsSlice = createSlice({
  name: 'uiEffects',
  initialState,
  reducers: {
    clientMounted: (state) => {
      void state;
    },
    eoiSubmitRequested: (state) => {
      void state;
    },
    startupApplicationSubmitRequested: (state) => {
      void state;
    },
    decisionWriterGenerateRequested: (state) => {
      void state;
    },
    decisionWriterCopyRequested: (state) => {
      void state;
    },
    pitchDeckUploadRequested: (state) => {
      void state;
    },
    ddChatSendRequested: (
      state,
      _action: PayloadAction<{ key: string; query: string; dealName?: string }>
    ) => {
      void state;
    },
    reportExportRequested: (state) => {
      void state;
    },
  },
});

export const {
  clientMounted,
  eoiSubmitRequested,
  startupApplicationSubmitRequested,
  decisionWriterGenerateRequested,
  decisionWriterCopyRequested,
  pitchDeckUploadRequested,
  ddChatSendRequested,
  reportExportRequested,
} = uiEffectsSlice.actions;

// Selectors (no state to select, included for consistency)
export const uiEffectsSelectors = {
  // No state - this slice only triggers side effects
};

export const uiEffectsReducer = uiEffectsSlice.reducer;
