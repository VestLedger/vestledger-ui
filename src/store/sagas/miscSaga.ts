import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  integrationsRequested,
  integrationsLoaded,
  integrationsFailed,
  lpPortalRequested,
  lpPortalLoaded,
  lpPortalFailed,
  auditTrailRequested,
  auditTrailLoaded,
  auditTrailFailed,
  companySearchRequested,
  companySearchLoaded,
  companySearchFailed,
} from '../slices/miscSlice';
import { getCalendarSnapshot } from '@/services/integrationsService';
import { getInvestorSnapshot } from '@/services/lpPortal/lpInvestorPortalService';
import { getAuditEvents } from '@/services/blockchain/auditTrailService';
import {
  getCompanySearchCompanies,
  getCompanySearchIndustries,
  getCompanySearchStages,
} from '@/services/dealIntelligence/companySearchService';

/**
 * Worker saga: Load integrations data
 */
function* loadIntegrationsWorker(): SagaIterator {
  try {
    const data = yield call(getCalendarSnapshot);
    yield put(integrationsLoaded(data));
  } catch (error: any) {
    console.error('Failed to load integrations data', error);
    yield put(integrationsFailed(error?.message || 'Failed to load integrations data'));
  }
}

/**
 * Worker saga: Load LP portal data
 */
function* loadLPPortalWorker(): SagaIterator {
  try {
    const data = yield call(getInvestorSnapshot);
    yield put(lpPortalLoaded(data));
  } catch (error: any) {
    console.error('Failed to load LP portal data', error);
    yield put(lpPortalFailed(error?.message || 'Failed to load LP portal data'));
  }
}

/**
 * Worker saga: Load audit trail data
 */
function* loadAuditTrailWorker(): SagaIterator {
  try {
    const events = yield call(getAuditEvents);
    yield put(auditTrailLoaded({ events }));
  } catch (error: any) {
    console.error('Failed to load audit trail data', error);
    yield put(auditTrailFailed(error?.message || 'Failed to load audit trail data'));
  }
}

/**
 * Worker saga: Load company search data
 */
function* loadCompanySearchWorker(): SagaIterator {
  try {
    const [companies, industries, stages] = yield all([
      call(getCompanySearchCompanies),
      call(getCompanySearchIndustries),
      call(getCompanySearchStages),
    ]);
    yield put(companySearchLoaded({ companies, industries, stages }));
  } catch (error: any) {
    console.error('Failed to load company search data', error);
    yield put(companySearchFailed(error?.message || 'Failed to load company search data'));
  }
}

/**
 * Watcher sagas
 */
function* watchIntegrations(): SagaIterator {
  yield takeLatest(integrationsRequested.type, loadIntegrationsWorker);
}

function* watchLPPortal(): SagaIterator {
  yield takeLatest(lpPortalRequested.type, loadLPPortalWorker);
}

function* watchAuditTrail(): SagaIterator {
  yield takeLatest(auditTrailRequested.type, loadAuditTrailWorker);
}

function* watchCompanySearch(): SagaIterator {
  yield takeLatest(companySearchRequested.type, loadCompanySearchWorker);
}

/**
 * Root misc saga
 */
export function* miscSaga(): SagaIterator {
  yield all([
    call(watchIntegrations),
    call(watchLPPortal),
    call(watchAuditTrail),
    call(watchCompanySearch),
  ]);
}
