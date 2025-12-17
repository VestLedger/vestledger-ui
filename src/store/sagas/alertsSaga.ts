import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  alertsRequested,
  alertsFailed,
  alertsLoaded,
} from '../slices/alertsSlice';
import { fetchAlerts as fetchAlertsService } from '@/services/alertsService';

function* fetchAlertsWorker(): SagaIterator {
  try {
    // Simulate network latency and return mock alerts.
    yield delay(300);
    const alerts = yield call(fetchAlertsService);
    yield put(alertsLoaded(alerts));
  } catch (error: any) {
    yield put(alertsFailed(error?.message ?? 'Failed to load alerts'));
  }
}

function* watchFetchAlerts(): SagaIterator {
  yield takeLatest(alertsRequested.type, fetchAlertsWorker);
}

export function* alertsSaga(): SagaIterator {
  yield all([call(watchFetchAlerts)]);
}
