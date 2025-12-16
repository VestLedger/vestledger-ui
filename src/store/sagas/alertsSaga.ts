import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  fetchAlerts,
  fetchAlertsFailure,
  fetchAlertsSuccess,
} from '../slices/alertsSlice';
import { fetchAlerts as fetchAlertsService } from '@/services/alertsService';

function* fetchAlertsWorker(): SagaIterator {
  try {
    // Simulate network latency and return mock alerts.
    yield delay(300);
    const alerts = yield call(fetchAlertsService);
    yield put(fetchAlertsSuccess(alerts));
  } catch (error: any) {
    yield put(fetchAlertsFailure(error?.message ?? 'Failed to load alerts'));
  }
}

function* watchFetchAlerts(): SagaIterator {
  yield takeLatest(fetchAlerts.type, fetchAlertsWorker);
}

export function* alertsSaga(): SagaIterator {
  yield all([call(watchFetchAlerts)]);
}
