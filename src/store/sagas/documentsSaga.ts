import { all, call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { listDocuments } from '@/services/documentsService';
import {
  documentsFailed,
  documentsLoaded,
  documentsRequested,
} from '@/store/slices/documentsSlice';
import { normalizeError } from '@/store/utils/normalizeError';

function* loadDocumentsWorker(action: ReturnType<typeof documentsRequested>): SagaIterator {
  try {
    const params = action.payload;
    const { documents, folders } = yield call(listDocuments, params);
    yield put(documentsLoaded({ documents, folders }));
  } catch (error: unknown) {
    console.error('Failed to load documents', error);
    yield put(documentsFailed(normalizeError(error)));
  }
}

function* watchDocumentsRequested(): SagaIterator {
  yield takeLatest(documentsRequested.type, loadDocumentsWorker);
}

export function* documentsSaga(): SagaIterator {
  yield all([call(watchDocumentsRequested)]);
}
