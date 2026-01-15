import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  pipelineDataRequested,
  pipelineDataLoaded,
  pipelineDataFailed,
} from '../slices/pipelineSlice';
import { getPipelineData } from '@/services/pipelineService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load pipeline data (stages, deals, copilot suggestions)
 */
export function* loadPipelineDataWorker(action: ReturnType<typeof pipelineDataRequested>): SagaIterator {
  try {
    const params = action.payload;
    const data = yield call(getPipelineData, params);
    yield put(pipelineDataLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load pipeline data', error);
    yield put(pipelineDataFailed(normalizeError(error)));
  }
}

/**
 * Watcher saga: Watch for pipeline data requests
 */
function* watchPipelineDataRequested(): SagaIterator {
  yield takeLatest(pipelineDataRequested.type, loadPipelineDataWorker);
}

/**
 * Root pipeline saga
 */
export function* pipelineSaga(): SagaIterator {
  yield call(watchPipelineDataRequested);
}
