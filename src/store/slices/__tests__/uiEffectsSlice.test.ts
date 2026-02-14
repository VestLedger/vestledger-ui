import { describe, expect, it } from 'vitest';
import {
  uiEffectsReducer,
  clientMounted,
  eoiSubmitRequested,
  startupApplicationSubmitRequested,
  decisionWriterGenerateRequested,
  decisionWriterCopyRequested,
  pitchDeckUploadRequested,
  ddChatSendRequested,
  reportExportRequested,
  uiEffectsSelectors,
} from '../uiEffectsSlice';

describe('uiEffectsSlice', () => {
  it('returns expected initial state', () => {
    const state = uiEffectsReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({});
  });

  it('keeps state unchanged for trigger actions', () => {
    const actions = [
      clientMounted(),
      eoiSubmitRequested(),
      startupApplicationSubmitRequested(),
      decisionWriterGenerateRequested(),
      decisionWriterCopyRequested(),
      pitchDeckUploadRequested(),
      ddChatSendRequested({ key: 'deal-1', query: 'Top risks?', dealName: 'Acme AI' }),
      reportExportRequested(),
    ];

    let state = uiEffectsReducer(undefined, { type: '@@INIT' });
    for (const action of actions) {
      state = uiEffectsReducer(state, action);
      expect(state).toEqual({});
    }
  });

  it('exposes selector object for consistency', () => {
    expect(uiEffectsSelectors).toEqual({});
  });
});
