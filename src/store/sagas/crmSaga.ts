import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  crmDataRequested,
  crmDataLoaded,
  crmDataFailed,
} from '../slices/crmSlice';
import {
  getCRMContacts,
  getCRMEmailAccounts,
  getCRMInteractions,
  getCRMTimelineInteractions,
} from '@/services/crm/contactsService';

/**
 * Worker saga: Load all CRM data
 */
function* loadCRMDataWorker(): SagaIterator {
  try {
    // Load all CRM data in parallel
    const [contacts, emailAccounts, interactions, timelineInteractions] = yield all([
      call(getCRMContacts),
      call(getCRMEmailAccounts),
      call(getCRMInteractions),
      call(getCRMTimelineInteractions),
    ]);

    yield put(crmDataLoaded({
      contacts,
      emailAccounts,
      interactions,
      timelineInteractions,
    }));
  } catch (error: any) {
    console.error('Failed to load CRM data', error);
    yield put(crmDataFailed(error?.message || 'Failed to load CRM data'));
  }
}

/**
 * Root CRM saga
 */
export function* crmSaga(): SagaIterator {
  yield takeLatest(crmDataRequested.type, loadCRMDataWorker);
}
