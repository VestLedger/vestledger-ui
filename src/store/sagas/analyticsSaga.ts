import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { isMockMode } from '@/config/data-mode';
import {
  analyticsRequested,
  analyticsLoaded,
  analyticsFailed,
} from '@/store/slices/analyticsSlice';
import { fetchFundAnalyticsSnapshot } from '@/services/analytics/fundAnalyticsService';
import { normalizeError } from '@/store/utils/normalizeError';
import { logger } from '@/lib/logger';

export function* loadAnalyticsWorker(
  action: ReturnType<typeof analyticsRequested>
): SagaIterator {
  try {
    const fundId = action.payload?.fundId ?? null;
    yield call(fetchFundAnalyticsSnapshot, fundId);

    yield put(analyticsLoaded({
      fundId,
      loadedAt: new Date().toISOString(),
      source: isMockMode('analytics') ? 'mock' : 'api',
    }));
  } catch (error: unknown) {
    logger.error('Failed to load analytics snapshot', error);
    yield put(analyticsFailed(normalizeError(error)));
  }
}

export function* analyticsSaga(): SagaIterator {
  yield takeLatest(analyticsRequested.type, loadAnalyticsWorker);
}
