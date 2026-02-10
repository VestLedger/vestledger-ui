import { call, delay, put, race, select, take, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { RootState } from '@/store/rootReducer';
import type { Fund, FundViewMode } from '@/types/fund';
import {
  archiveFundFailed,
  archiveFundRequested,
  archiveFundSucceeded,
  closeFundFailed,
  closeFundRequested,
  closeFundSucceeded,
  createFundFailed,
  createFundRequested,
  createFundSucceeded,
  fundHydrated,
  fundsLoaded,
  fundsFailed,
  fundsRequested,
  setSelectedFundId,
  setViewMode,
  unarchiveFundFailed,
  unarchiveFundRequested,
  unarchiveFundSucceeded,
  updateFundFailed,
  updateFundRequested,
  updateFundSucceeded,
} from '@/store/slices/fundSlice';
import { authSelectors, loginSucceeded } from '@/store/slices/authSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import {
  archiveFundLocal,
  closeFund,
  createFund,
  fetchFunds,
  unarchiveFundLocal,
  updateFund,
} from '@/services/fundsService';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { normalizeError } from '@/store/utils/normalizeError';
import { logger } from '@/lib/logger';

const STORAGE_SELECTED_FUND_ID = 'vestledger-selected-fund-id';
const STORAGE_FUND_VIEW_MODE = 'vestledger-fund-view-mode';
const STORAGE_ARCHIVED_FUND_IDS = 'vestledger-archived-fund-ids';

function parseArchivedFundIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

function* hydrateFundWorker(): SagaIterator {
  const rawFundId = safeLocalStorage.getItem(STORAGE_SELECTED_FUND_ID);
  const rawViewMode = safeLocalStorage.getItem(STORAGE_FUND_VIEW_MODE) as FundViewMode | null;
  const rawArchivedFundIds = safeLocalStorage.getItem(STORAGE_ARCHIVED_FUND_IDS);

  const currentSelectedFundId: string | null = yield select(
    (state: RootState) => state.fund.selectedFundId
  );

  const selectedFundId =
    rawFundId === null || rawFundId === 'null'
      ? currentSelectedFundId
      : rawFundId;

  const viewMode: FundViewMode =
    rawViewMode === 'individual' || rawViewMode === 'consolidated' || rawViewMode === 'comparison'
      ? rawViewMode
      : 'consolidated';

  const normalizedSelectedFundId = viewMode === 'consolidated' ? null : selectedFundId;
  const archivedFundIds = parseArchivedFundIds(rawArchivedFundIds);

  yield put(fundHydrated({ selectedFundId: normalizedSelectedFundId, viewMode, archivedFundIds }));
}

function* persistSelectedFundIdWorker(): SagaIterator {
  const selectedFundId: string | null = yield select((state: RootState) => state.fund.selectedFundId);
  safeLocalStorage.setItem(STORAGE_SELECTED_FUND_ID, selectedFundId === null ? 'null' : selectedFundId);
}

function* persistViewModeWorker(): SagaIterator {
  const viewMode: FundViewMode = yield select((state: RootState) => state.fund.viewMode);
  safeLocalStorage.setItem(STORAGE_FUND_VIEW_MODE, viewMode);
}

function* persistArchivedFundIdsWorker(): SagaIterator {
  const archivedFundIds: string[] = yield select((state: RootState) => state.fund.archivedFundIds);
  safeLocalStorage.setItem(STORAGE_ARCHIVED_FUND_IDS, JSON.stringify(archivedFundIds));
}

export function* loadFundsWorker(action: ReturnType<typeof fundsRequested>): SagaIterator {
  try {
    const params = action.payload;
    const funds: Fund[] = yield call(fetchFunds, params);
    yield put(fundsLoaded({ funds }));
  } catch (error: unknown) {
    logger.error('Failed to load funds', error);
    yield put(fundsFailed(normalizeError(error)));
  }
}

export function* createFundWorker(
  action: ReturnType<typeof createFundRequested>
): SagaIterator {
  try {
    const fund: Fund = yield call(createFund, action.payload);
    yield put(createFundSucceeded(fund));
  } catch (error: unknown) {
    logger.error('Failed to create fund', error);
    yield put(createFundFailed(normalizeError(error)));
  }
}

export function* updateFundWorker(
  action: ReturnType<typeof updateFundRequested>
): SagaIterator {
  try {
    const fund: Fund = yield call(updateFund, action.payload.fundId, action.payload.data);
    yield put(updateFundSucceeded(fund));
  } catch (error: unknown) {
    logger.error('Failed to update fund', error);
    yield put(updateFundFailed(normalizeError(error)));
  }
}

export function* closeFundWorker(
  action: ReturnType<typeof closeFundRequested>
): SagaIterator {
  try {
    const fund: Fund = yield call(closeFund, action.payload.fundId);
    yield put(closeFundSucceeded(fund));
  } catch (error: unknown) {
    logger.error('Failed to close fund', error);
    yield put(closeFundFailed(normalizeError(error)));
  }
}

export function* archiveFundWorker(
  action: ReturnType<typeof archiveFundRequested>
): SagaIterator {
  try {
    const result: { fundId: string } = yield call(archiveFundLocal, action.payload.fundId);
    yield put(archiveFundSucceeded(result));
  } catch (error: unknown) {
    logger.error('Failed to archive fund', error);
    yield put(archiveFundFailed(normalizeError(error)));
  }
}

export function* unarchiveFundWorker(
  action: ReturnType<typeof unarchiveFundRequested>
): SagaIterator {
  try {
    const result: { fundId: string } = yield call(unarchiveFundLocal, action.payload.fundId);
    yield put(unarchiveFundSucceeded(result));
  } catch (error: unknown) {
    logger.error('Failed to unarchive fund', error);
    yield put(unarchiveFundFailed(normalizeError(error)));
  }
}

export function* fundSaga(): SagaIterator {
  if (typeof window !== 'undefined') {
    yield race({
      mounted: take(clientMounted.type),
      timeout: delay(5000),
    });
  }

  yield takeLatest(fundsRequested.type, loadFundsWorker);
  yield takeLatest(setSelectedFundId.type, persistSelectedFundIdWorker);
  yield takeLatest(setViewMode.type, persistViewModeWorker);

  yield takeLatest(createFundRequested.type, createFundWorker);
  yield takeLatest(updateFundRequested.type, updateFundWorker);
  yield takeLatest(closeFundRequested.type, closeFundWorker);
  yield takeLatest(archiveFundRequested.type, archiveFundWorker);
  yield takeLatest(unarchiveFundRequested.type, unarchiveFundWorker);
  yield takeLatest(archiveFundSucceeded.type, persistArchivedFundIdsWorker);
  yield takeLatest(unarchiveFundSucceeded.type, persistArchivedFundIdsWorker);

  yield call(hydrateFundWorker);

  const isAuthenticated: boolean = yield select(authSelectors.selectIsAuthenticated);
  if (isAuthenticated) {
    yield put(fundsRequested({}));
  }

  yield takeLatest(loginSucceeded.type, function* () {
    yield put(fundsRequested({}));
  });
}
