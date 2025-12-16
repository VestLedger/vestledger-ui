import { call, put, select, take, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { RootState } from '@/store/rootReducer';
import type { Fund, FundViewMode } from '@/types/fund';
import { fundHydrated, fundsLoaded, setSelectedFundId, setViewMode } from '@/store/slices/fundSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { fetchFunds } from '@/services/fundsService';

const STORAGE_SELECTED_FUND_ID = 'vestledger-selected-fund-id';
const STORAGE_FUND_VIEW_MODE = 'vestledger-fund-view-mode';

function* hydrateFundWorker(): SagaIterator {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    yield put(fundHydrated({ selectedFundId: null, viewMode: 'individual' }));
    return;
  }

  try {
    const rawFundId = localStorage.getItem(STORAGE_SELECTED_FUND_ID);
    const rawViewMode = localStorage.getItem(STORAGE_FUND_VIEW_MODE) as FundViewMode | null;

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
  } catch (error) {
    console.error('Failed to hydrate fund preferences from localStorage', error);
    const currentSelectedFundId: string | null = yield select(
      (state: RootState) => state.fund.selectedFundId
    );
    yield put(fundHydrated({ selectedFundId: currentSelectedFundId, viewMode: 'individual' }));
  }
}

function* persistSelectedFundIdWorker(): SagaIterator {
  const selectedFundId: string | null = yield select((state: RootState) => state.fund.selectedFundId);
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SELECTED_FUND_ID, selectedFundId === null ? 'null' : selectedFundId);
  } catch (error) {
    console.error('Failed to persist selected fund id', error);
  }
}

function* persistViewModeWorker(): SagaIterator {
  const viewMode: FundViewMode = yield select((state: RootState) => state.fund.viewMode);
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_FUND_VIEW_MODE, viewMode);
  } catch (error) {
    console.error('Failed to persist fund view mode', error);
  }
}

function* loadFundsWorker(): SagaIterator {
  try {
    const funds: Fund[] = yield call(fetchFunds);
    yield put(fundsLoaded(funds));
  } catch (error) {
    console.error('Failed to load funds', error);
  }
}

export function* fundSaga(): SagaIterator {
  if (typeof window !== 'undefined') {
    yield take(clientMounted.type);
  }
  yield call(loadFundsWorker);
  yield call(hydrateFundWorker);
  yield takeLatest(setSelectedFundId.type, persistSelectedFundIdWorker);
  yield takeLatest(setViewMode.type, persistViewModeWorker);
}
