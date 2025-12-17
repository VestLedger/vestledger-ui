import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  pitchDeckAnalysesRequested,
  pitchDeckAnalysesLoaded,
  pitchDeckAnalysesFailed,
  ddChatConversationRequested,
  ddChatConversationLoaded,
  ddChatConversationFailed,
} from '../slices/aiSlice';
import { getPitchDeckAnalyses } from '@/services/ai/pitchDeckService';
import { getInitialDDChatConversation } from '@/services/ai/ddChatService';

/**
 * Worker saga: Load pitch deck analyses
 */
function* loadPitchDeckAnalysesWorker(): SagaIterator {
  try {
    const analyses = yield call(getPitchDeckAnalyses);
    yield put(pitchDeckAnalysesLoaded(analyses));
  } catch (error: any) {
    console.error('Failed to load pitch deck analyses', error);
    yield put(pitchDeckAnalysesFailed(error?.message || 'Failed to load pitch deck analyses'));
  }
}

/**
 * Worker saga: Load DD chat conversation
 */
function* loadDDChatConversationWorker(action: PayloadAction<number>): SagaIterator {
  try {
    const dealId = action.payload;
    const messages = yield call(getInitialDDChatConversation);
    yield put(ddChatConversationLoaded({ dealId, messages }));
  } catch (error: any) {
    console.error('Failed to load DD chat conversation', error);
    yield put(ddChatConversationFailed(error?.message || 'Failed to load DD chat conversation'));
  }
}

/**
 * Watcher sagas
 */
function* watchPitchDeckAnalyses(): SagaIterator {
  yield takeLatest(pitchDeckAnalysesRequested.type, loadPitchDeckAnalysesWorker);
}

function* watchDDChatConversation(): SagaIterator {
  yield takeLatest(ddChatConversationRequested.type, loadDDChatConversationWorker);
}

/**
 * Root AI saga
 */
export function* aiSaga(): SagaIterator {
  yield all([
    call(watchPitchDeckAnalyses),
    call(watchDDChatConversation),
  ]);
}
