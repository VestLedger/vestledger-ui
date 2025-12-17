import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  dealIntelligenceRequested,
  dealIntelligenceLoaded,
  dealIntelligenceFailed,
} from '../slices/dealIntelligenceSlice';
import { getDealIntelligenceData } from '@/services/dealIntelligence/dealIntelligenceService';

/**
 * Worker saga: Load deal intelligence data
 */
function* loadDealIntelligenceWorker(): SagaIterator {
  try {
    const data = yield call(getDealIntelligenceData);
    yield put(dealIntelligenceLoaded(data));
  } catch (error: any) {
    console.error('Failed to load deal intelligence data', error);
    yield put(dealIntelligenceFailed(error?.message || 'Failed to load deal intelligence data'));
  }
}

/**
 * Root deal intelligence saga
 */
export function* dealIntelligenceSaga(): SagaIterator {
  yield takeLatest(dealIntelligenceRequested.type, loadDealIntelligenceWorker);
}
