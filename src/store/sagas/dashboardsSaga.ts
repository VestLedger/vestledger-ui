import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  lpDashboardRequested,
  lpDashboardLoaded,
  lpDashboardFailed,
  analystDashboardRequested,
  analystDashboardLoaded,
  analystDashboardFailed,
  opsDashboardRequested,
  opsDashboardLoaded,
  opsDashboardFailed,
  auditorDashboardRequested,
  auditorDashboardLoaded,
  auditorDashboardFailed,
  irDashboardRequested,
  irDashboardLoaded,
  irDashboardFailed,
  researcherDashboardRequested,
  researcherDashboardLoaded,
  researcherDashboardFailed,
  type LPDashboardData,
  type AnalystDashboardData,
  type OpsDashboardData,
  type AuditorDashboardData,
  type IRDashboardData,
  type ResearcherDashboardData,
} from '../slices/dashboardsSlice';
import { getLPDashboardSnapshot } from '@/services/dashboards/lpDashboardService';
import { getAnalystDashboardSnapshot } from '@/services/dashboards/analystDashboardService';
import { getOpsDashboardSnapshot } from '@/services/dashboards/opsDashboardService';
import { getAuditorDashboardSnapshot } from '@/services/dashboards/auditorDashboardService';
import { getIRDashboardSnapshot } from '@/services/dashboards/irDashboardService';
import { getResearcherDashboardSnapshot } from '@/services/dashboards/researcherDashboardService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load LP dashboard data
 */
function* loadLPDashboardWorker(): SagaIterator {
  try {
    const data: LPDashboardData = yield call(getLPDashboardSnapshot);
    yield put(lpDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load LP dashboard', error);
    yield put(lpDashboardFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load analyst dashboard data
 */
function* loadAnalystDashboardWorker(): SagaIterator {
  try {
    const data: AnalystDashboardData = yield call(getAnalystDashboardSnapshot);
    yield put(analystDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load analyst dashboard', error);
    yield put(analystDashboardFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load ops dashboard data
 */
function* loadOpsDashboardWorker(): SagaIterator {
  try {
    const data: OpsDashboardData = yield call(getOpsDashboardSnapshot);
    yield put(opsDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load ops dashboard', error);
    yield put(opsDashboardFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load auditor dashboard data
 */
function* loadAuditorDashboardWorker(): SagaIterator {
  try {
    const data: AuditorDashboardData = yield call(getAuditorDashboardSnapshot);
    yield put(auditorDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load auditor dashboard', error);
    yield put(auditorDashboardFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load IR dashboard data
 */
function* loadIRDashboardWorker(): SagaIterator {
  try {
    const data: IRDashboardData = yield call(getIRDashboardSnapshot);
    yield put(irDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load IR dashboard', error);
    yield put(irDashboardFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load researcher dashboard data
 */
function* loadResearcherDashboardWorker(): SagaIterator {
  try {
    const data: ResearcherDashboardData = yield call(getResearcherDashboardSnapshot);
    yield put(researcherDashboardLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load researcher dashboard', error);
    yield put(researcherDashboardFailed(normalizeError(error)));
  }
}

/**
 * Watcher sagas
 */
function* watchLPDashboard(): SagaIterator {
  yield takeLatest(lpDashboardRequested.type, loadLPDashboardWorker);
}

function* watchAnalystDashboard(): SagaIterator {
  yield takeLatest(analystDashboardRequested.type, loadAnalystDashboardWorker);
}

function* watchOpsDashboard(): SagaIterator {
  yield takeLatest(opsDashboardRequested.type, loadOpsDashboardWorker);
}

function* watchAuditorDashboard(): SagaIterator {
  yield takeLatest(auditorDashboardRequested.type, loadAuditorDashboardWorker);
}

function* watchIRDashboard(): SagaIterator {
  yield takeLatest(irDashboardRequested.type, loadIRDashboardWorker);
}

function* watchResearcherDashboard(): SagaIterator {
  yield takeLatest(researcherDashboardRequested.type, loadResearcherDashboardWorker);
}

/**
 * Root dashboards saga
 */
export function* dashboardsSaga(): SagaIterator {
  yield all([
    call(watchLPDashboard),
    call(watchAnalystDashboard),
    call(watchOpsDashboard),
    call(watchAuditorDashboard),
    call(watchIRDashboard),
    call(watchResearcherDashboard),
  ]);
}
