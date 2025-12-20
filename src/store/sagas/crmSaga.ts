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
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Load all CRM data
 */
function* loadCRMDataWorker(action: ReturnType<typeof crmDataRequested>): SagaIterator {
  try {
    const params = action.payload;

    // Load all CRM data in parallel
    const [contacts, emailAccounts, interactions, timelineInteractions] = yield all([
      call(getCRMContacts, params),
      call(getCRMEmailAccounts, params),
      call(getCRMInteractions, params),
      call(getCRMTimelineInteractions, params),
    ]);

    yield put(crmDataLoaded({
      contacts,
      emailAccounts,
      interactions,
      timelineInteractions,
    }));
  } catch (error: unknown) {
    console.error('Failed to load CRM data', error);
    yield put(crmDataFailed(normalizeError(error)));
  }
}

/**
 * Root CRM saga
 */
export function* crmSaga(): SagaIterator {
  yield takeLatest(crmDataRequested.type, loadCRMDataWorker);
}
