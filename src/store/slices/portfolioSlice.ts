import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { PortfolioUpdate } from '@/services/portfolio/portfolioDataService';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface PortfolioPageMetrics {
  totalCompanies: number;
  atRiskCompanies: number;
  pendingUpdates: number;
}

export interface PortfolioUpdatesData {
  updates: PortfolioUpdate[];
}

export interface GetPortfolioUpdatesParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
}

type PortfolioState = AsyncState<PortfolioUpdatesData>;

const initialState: PortfolioState = createInitialAsyncState<PortfolioUpdatesData>();

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    portfolioUpdatesRequested: (state, action: PayloadAction<GetPortfolioUpdatesParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    portfolioUpdatesLoaded: (state, action: PayloadAction<PortfolioUpdatesData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    portfolioUpdatesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
} = portfolioSlice.actions;

// Centralized selectors
export const portfolioSelectors = createAsyncSelectors<PortfolioUpdatesData>('portfolio');

export const portfolioReducer = portfolioSlice.reducer;
