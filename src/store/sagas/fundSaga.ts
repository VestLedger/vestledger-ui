import { call, delay, put, race, select, take, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { RootState } from '@/store/rootReducer';
import type { Fund, FundViewMode } from '@/types/fund';
import { fundHydrated, fundsLoaded, fundsFailed, fundsRequested, setSelectedFundId, setViewMode } from '@/store/slices/fundSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { fetchFunds } from '@/services/fundsService';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';

const STORAGE_SELECTED_FUND_ID = 'vestledger-selected-fund-id';
const STORAGE_FUND_VIEW_MODE = 'vestledger-fund-view-mode';

function* hydrateFundWorker(): SagaIterator {
  const rawFundId = safeLocalStorage.getItem(STORAGE_SELECTED_FUND_ID);
  const rawViewMode = safeLocalStorage.getItem(STORAGE_FUND_VIEW_MODE) as FundViewMode | null;

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
      : 'individual';

  yield put(fundHydrated({ selectedFundId, viewMode }));
}

function* persistSelectedFundIdWorker(): SagaIterator {
  const selectedFundId: string | null = yield select((state: RootState) => state.fund.selectedFundId);
  safeLocalStorage.setItem(STORAGE_SELECTED_FUND_ID, selectedFundId === null ? 'null' : selectedFundId);
}

function* persistViewModeWorker(): SagaIterator {
  const viewMode: FundViewMode = yield select((state: RootState) => state.fund.viewMode);
  safeLocalStorage.setItem(STORAGE_FUND_VIEW_MODE, viewMode);
}

function* loadFundsWorker(): SagaIterator {
  try {
    yield put(fundsRequested());
    const funds: Fund[] = yield call(fetchFunds);
    yield put(fundsLoaded(funds));
  } catch (error: any) {
    console.error('Failed to load funds', error);
    yield put(fundsFailed(error?.message || 'Failed to load funds'));
  }
}

export function* fundSaga(): SagaIterator {
  if (typeof window !== 'undefined') {
    // Wait for clientMounted with a 5 second timeout fallback
    yield race({
      mounted: take(clientMounted.type),
      timeout: delay(5000),
    });
  }
  yield call(loadFundsWorker);
  yield call(hydrateFundWorker);
  yield takeLatest(setSelectedFundId.type, persistSelectedFundIdWorker);
  yield takeLatest(setViewMode.type, persistViewModeWorker);
}
