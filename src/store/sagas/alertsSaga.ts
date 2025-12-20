import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  alertsRequested,
  alertsFailed,
  alertsLoaded,
} from '../slices/alertsSlice';
import { fetchAlerts as fetchAlertsService } from '@/services/alertsService';
import { normalizeError } from '@/store/utils/normalizeError';

function* fetchAlertsWorker(action: ReturnType<typeof alertsRequested>): SagaIterator {
  try {
    const params = action.payload;
    // Simulate network latency and return mock alerts
    yield delay(300);
    const alerts = yield call(fetchAlertsService, params);
    yield put(alertsLoaded({ items: alerts }));
  } catch (error: unknown) {
    console.error('Failed to load alerts', error);
    yield put(alertsFailed(normalizeError(error)));
  }
}

function* watchFetchAlerts(): SagaIterator {
  yield takeLatest(alertsRequested.type, fetchAlertsWorker);
}

export function* alertsSaga(): SagaIterator {
  yield all([call(watchFetchAlerts)]);
}
