import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
} from '@/store/slices/portfolioSlice';
import { getPortfolioUpdates } from '@/services/portfolio/portfolioDataService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load portfolio updates
 */
function* loadPortfolioUpdatesWorker(
  action: ReturnType<typeof portfolioUpdatesRequested>
): SagaIterator {
  try {
    const params = action.payload;
    const updates = yield call(getPortfolioUpdates);
    yield put(portfolioUpdatesLoaded({ updates }));
  } catch (error: unknown) {
    console.error('Failed to load portfolio updates', error);
    yield put(portfolioUpdatesFailed(normalizeError(error)));
  }
}

/**
 * Root portfolio saga
 */
export function* portfolioSaga(): SagaIterator {
  yield takeLatest(portfolioUpdatesRequested.type, loadPortfolioUpdatesWorker);
}
