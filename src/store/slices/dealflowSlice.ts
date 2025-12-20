import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { Deal } from '@/services/dealflow/dealflowReviewService';
import type { CompanyScoreData } from '@/services/dealflow/companyScoringService';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface DealflowDealsData {
  deals: Deal[];
}

export interface GetDealflowDealsParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
}

type DealflowState = AsyncState<DealflowDealsData>;

const initialState: DealflowState = createInitialAsyncState<DealflowDealsData>();

const dealflowSlice = createSlice({
  name: 'dealflow',
  initialState,
  reducers: {
    dealflowDealsRequested: (state, action: PayloadAction<GetDealflowDealsParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    dealflowDealsLoaded: (state, action: PayloadAction<DealflowDealsData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    dealflowDealsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  dealflowDealsRequested,
  dealflowDealsLoaded,
  dealflowDealsFailed,
} = dealflowSlice.actions;

// Centralized selectors
export const dealflowSelectors = createAsyncSelectors<DealflowDealsData>('dealflow');

export const dealflowReducer = dealflowSlice.reducer;
