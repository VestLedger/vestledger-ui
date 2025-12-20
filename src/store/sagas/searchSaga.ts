import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  searchRequested,
  searchLoaded,
  searchFailed,
} from '../slices/searchSlice';
import { searchTopbar } from '@/services/topbarSearchService';
import { normalizeError } from '@/store/utils/normalizeError';

/**
 * Worker saga: Perform search
 * Debounced to avoid excessive calls while user types
 */
function* searchWorker(
  action: ReturnType<typeof searchRequested>
): SagaIterator {
  try {
    const { query } = action.payload;

    // If query is empty, clear results
    if (!query.trim()) {
      yield put(searchLoaded({ results: [], query: '' }));
      return;
    }

    const results = yield call(searchTopbar, query);
    yield put(searchLoaded({ results, query }));
  } catch (error: unknown) {
    console.error('Failed to perform search', error);
    yield put(searchFailed(normalizeError(error)));
  }
}

/**
 * Root search saga
 * Uses debounce to wait 300ms after user stops typing
 */
export function* searchSaga(): SagaIterator {
  yield debounce(300, searchRequested.type, searchWorker);
}
