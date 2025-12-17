import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { Fund, FundViewMode } from '@/types/fund';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface FundsData {
  funds: Fund[];
}

export interface GetFundsParams extends Partial<StandardQueryParams> {
  // Add filters as needed (e.g., status, type)
}

interface FundState extends AsyncState<FundsData> {
  // UI state (not part of async data)
  hydrated: boolean;
  selectedFundId: string | null;
  viewMode: FundViewMode;
}

const initialState: FundState = {
  ...createInitialAsyncState<FundsData>(),
  hydrated: false,
  selectedFundId: null,
  viewMode: 'individual',
};

const fundSlice = createSlice({
  name: 'fund',
  initialState,
  reducers: {
    fundsRequested: (state, action: PayloadAction<GetFundsParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    fundsLoaded: (state, action: PayloadAction<FundsData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;

      // Auto-select first fund if none selected
      if (state.selectedFundId === null && action.payload.funds.length > 0) {
        state.selectedFundId = action.payload.funds[0]!.id;
      }
    },
    fundsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    fundHydrated: (state, action: PayloadAction<{ selectedFundId: string | null; viewMode: FundViewMode }>) => {
      state.hydrated = true;
      state.selectedFundId = action.payload.selectedFundId;
      state.viewMode = action.payload.viewMode;
    },
    setSelectedFundId: (state, action: PayloadAction<string | null>) => {
      state.selectedFundId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<FundViewMode>) => {
      state.viewMode = action.payload;
    },
  },
});

export const { fundsRequested, fundsLoaded, fundsFailed, fundHydrated, setSelectedFundId, setViewMode } = fundSlice.actions;

// Centralized selectors for funds data
export const fundsSelectors = createAsyncSelectors<FundsData>('fund');

// Additional custom selectors for UI state
export const fundUISelectors = {
  selectHydrated: (state: any) => state.fund.hydrated,
  selectSelectedFundId: (state: any) => state.fund.selectedFundId,
  selectViewMode: (state: any) => state.fund.viewMode,
  selectSelectedFund: (state: any) => {
    const fundId = state.fund.selectedFundId;
    const funds = state.fund.data?.funds || [];
    return funds.find((f: Fund) => f.id === fundId) || null;
  },
};

export const fundReducer = fundSlice.reducer;
