import { all, call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { listDocuments } from '@/services/documentsService';
import {
  documentsFailed,
  documentsLoaded,
  documentsRequested,
} from '@/store/slices/documentsSlice';

function* loadDocumentsWorker(): SagaIterator {
  try {
    const { documents, folders } = yield call(listDocuments);
    yield put(documentsLoaded({ documents, folders }));
  } catch (error: any) {
    yield put(documentsFailed(error?.message ?? 'Failed to load documents'));
  }
}

function* watchDocumentsRequested(): SagaIterator {
  yield takeLatest(documentsRequested.type, loadDocumentsWorker);
}

export function* documentsSaga(): SagaIterator {
  yield all([call(watchDocumentsRequested)]);
}
