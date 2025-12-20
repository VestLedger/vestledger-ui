import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  dealIntelligenceRequested,
  dealIntelligenceLoaded,
  dealIntelligenceFailed,
} from '../slices/dealIntelligenceSlice';
import { getDealIntelligenceData } from '@/services/dealIntelligence/dealIntelligenceService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load deal intelligence data
 */
function* loadDealIntelligenceWorker(
  action: ReturnType<typeof dealIntelligenceRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const data = yield call(getDealIntelligenceData, params);
    yield put(dealIntelligenceLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load deal intelligence data', error);
    yield put(dealIntelligenceFailed(normalizeError(error)));
  }
}

/**
 * Root deal intelligence saga
 */
export function* dealIntelligenceSaga(): SagaIterator {
  yield takeLatest(dealIntelligenceRequested.type, loadDealIntelligenceWorker);
}
