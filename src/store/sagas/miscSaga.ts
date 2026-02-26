import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  integrationsRequested,
  integrationsLoaded,
  integrationsFailed,
  lpPortalRequested,
  lpPortalLoaded,
  lpPortalFailed,
  lpManagementRequested,
  lpManagementLoaded,
  lpManagementFailed,
  auditTrailRequested,
  auditTrailLoaded,
  auditTrailFailed,
  companySearchRequested,
  companySearchLoaded,
  companySearchFailed,
  collaborationRequested,
  collaborationLoaded,
  collaborationFailed,
} from '../slices/miscSlice';
import { getIntegrationsSnapshot } from '@/services/integrationsService';
import { getInvestorSnapshot } from '@/services/lpPortal/lpInvestorPortalService';
import { getLPManagementSnapshot } from '@/services/lpPortal/lpManagementService';
import { getAuditEvents } from '@/services/blockchain/auditTrailService';
import {
  getCompanySearchCompanies,
  getCompanySearchIndustries,
  getCompanySearchStages,
} from '@/services/dealIntelligence/companySearchService';
import { getCollaborationSnapshot } from '@/services/collaboration/collaborationService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load integrations data
 */
function* loadIntegrationsWorker(): SagaIterator {
  try {
    const data = yield call(getIntegrationsSnapshot);
    yield put(integrationsLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load integrations data', error);
    yield put(integrationsFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load LP portal data
 */
function* loadLPPortalWorker(): SagaIterator {
  try {
    const data = yield call(getInvestorSnapshot);
    yield put(lpPortalLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load LP portal data', error);
    yield put(lpPortalFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load LP management data
 */
function* loadLPManagementWorker(): SagaIterator {
  try {
    const data = yield call(getLPManagementSnapshot);
    yield put(lpManagementLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load LP management data', error);
    yield put(lpManagementFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load audit trail data
 */
function* loadAuditTrailWorker(): SagaIterator {
  try {
    const events = yield call(getAuditEvents);
    yield put(auditTrailLoaded({ events }));
  } catch (error: unknown) {
    console.error('Failed to load audit trail data', error);
    yield put(auditTrailFailed(normalizeError(error)));
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
  } catch (error: unknown) {
    console.error('Failed to load company search data', error);
    yield put(companySearchFailed(normalizeError(error)));
  }
}

/**
 * Worker saga: Load collaboration workspace data
 */
function* loadCollaborationWorker(): SagaIterator {
  try {
    const data = yield call(getCollaborationSnapshot);
    yield put(collaborationLoaded(data));
  } catch (error: unknown) {
    console.error('Failed to load collaboration data', error);
    yield put(collaborationFailed(normalizeError(error)));
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

function* watchLPManagement(): SagaIterator {
  yield takeLatest(lpManagementRequested.type, loadLPManagementWorker);
}

function* watchAuditTrail(): SagaIterator {
  yield takeLatest(auditTrailRequested.type, loadAuditTrailWorker);
}

function* watchCompanySearch(): SagaIterator {
  yield takeLatest(companySearchRequested.type, loadCompanySearchWorker);
}

function* watchCollaboration(): SagaIterator {
  yield takeLatest(collaborationRequested.type, loadCollaborationWorker);
}

/**
 * Root misc saga
 */
export function* miscSaga(): SagaIterator {
  yield all([
    call(watchIntegrations),
    call(watchLPPortal),
    call(watchLPManagement),
    call(watchAuditTrail),
    call(watchCompanySearch),
    call(watchCollaboration),
  ]);
}
