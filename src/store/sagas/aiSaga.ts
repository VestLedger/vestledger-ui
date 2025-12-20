import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
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
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load pitch deck analyses
 */
function* loadPitchDeckAnalysesWorker(
  action: ReturnType<typeof pitchDeckAnalysesRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const analyses = yield call(getPitchDeckAnalyses, params);
    yield put(pitchDeckAnalysesLoaded({ analyses }));
  } catch (error: unknown) {
    console.error('Failed to load pitch deck analyses', error);
    yield put(pitchDeckAnalysesFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load DD chat conversation
 */
function* loadDDChatConversationWorker(
  action: ReturnType<typeof ddChatConversationRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const messages = yield call(getInitialDDChatConversation, params);
    yield put(ddChatConversationLoaded({ dealId: params.dealId, messages }));
  } catch (error: unknown) {
    console.error('Failed to load DD chat conversation', error);
    yield put(ddChatConversationFailed(normalizeError(error)));
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
