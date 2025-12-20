import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  dealflowDealsRequested,
  dealflowDealsLoaded,
  dealflowDealsFailed,
} from '../slices/dealflowSlice';
import { getDealflowDeals } from '@/services/dealflow/dealflowReviewService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load dealflow deals
 */
function* loadDealflowDealsWorker(
  action: ReturnType<typeof dealflowDealsRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const deals = yield call(getDealflowDeals, params);
    yield put(dealflowDealsLoaded({ deals }));
  } catch (error: unknown) {
    console.error('Failed to load dealflow deals', error);
    yield put(dealflowDealsFailed(normalizeError(error)));
  }
}

/**
 * Root dealflow saga
 */
export function* dealflowSaga(): SagaIterator {
  yield takeLatest(dealflowDealsRequested.type, loadDealflowDealsWorker);
}
