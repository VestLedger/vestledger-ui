import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface AnalyticsLoadParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
}

export interface AnalyticsLoadData {
  fundId: string | null;
  loadedAt: string;
  source: 'mock' | 'api';
}

type AnalyticsState = AsyncState<AnalyticsLoadData>;

const initialState: AnalyticsState = createInitialAsyncState<AnalyticsLoadData>();

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    analyticsRequested: (state, _action: PayloadAction<AnalyticsLoadParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    analyticsLoaded: (state, action: PayloadAction<AnalyticsLoadData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    analyticsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  analyticsRequested,
  analyticsLoaded,
  analyticsFailed,
} = analyticsSlice.actions;

export const analyticsSelectors = createAsyncSelectors<AnalyticsLoadData>('analytics');

export const analyticsReducer = analyticsSlice.reducer;
