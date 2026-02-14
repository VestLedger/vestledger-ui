import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
} from '@/store/slices/portfolioSlice';
import { fetchPortfolioSnapshot } from '@/services/portfolio/portfolioDataService';
import { fetchPortfolioDocumentsSnapshot } from '@/services/portfolio/portfolioDocumentsService';
import { normalizeError } from '@/store/utils/normalizeError';
import { logger } from '@/lib/logger';

/**
 * Worker saga: Load portfolio updates
 */
export function* loadPortfolioUpdatesWorker(
  action: ReturnType<typeof portfolioUpdatesRequested>
): SagaIterator {
  try {
    const fundId = action.payload?.fundId ?? null;
    const snapshot = yield call(fetchPortfolioSnapshot, fundId);
    yield call(fetchPortfolioDocumentsSnapshot, fundId);
    yield put(portfolioUpdatesLoaded({ updates: snapshot.updates }));
  } catch (error: unknown) {
    logger.error('Failed to load portfolio updates', error);
    yield put(portfolioUpdatesFailed(normalizeError(error)));
  }
}

/**
 * Root portfolio saga
 */
export function* portfolioSaga(): SagaIterator {
  yield takeLatest(portfolioUpdatesRequested.type, loadPortfolioUpdatesWorker);
}
