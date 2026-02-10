import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { NAVCalculation } from '@/types/fundAdminOps';

export interface NAVOpsData {
  calculations: NAVCalculation[];
}

interface NAVOpsState {
  calculations: AsyncState<NAVOpsData>;
  lastExportAt?: string;
}

const initialState: NAVOpsState = {
  calculations: createInitialAsyncState<NAVOpsData>(),
};

function upsertCalculation(list: NAVCalculation[], value: NAVCalculation) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

const navOpsSlice = createSlice({
  name: 'navOps',
  initialState,
  reducers: {
    navRequested: (state, _action: PayloadAction<{ fundId?: string } | undefined>) => {
      state.calculations.status = 'loading';
      state.calculations.error = undefined;
    },
    navLoaded: (state, action: PayloadAction<NAVOpsData>) => {
      state.calculations.data = action.payload;
      state.calculations.status = 'succeeded';
      state.calculations.error = undefined;
    },
    navFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.calculations.status = 'failed';
      state.calculations.error = action.payload;
    },

    navCalculateRequested: (state, _action: PayloadAction<{ fundId: string; fundName: string }>) => {
      state.calculations.status = 'loading';
      state.calculations.error = undefined;
    },
    navReviewRequested: (state, _action: PayloadAction<{ calculationId: string; reviewedBy: string }>) => {
      state.calculations.status = 'loading';
      state.calculations.error = undefined;
    },
    navPublishRequested: (state, _action: PayloadAction<{ calculationId: string; publishedBy: string }>) => {
      state.calculations.status = 'loading';
      state.calculations.error = undefined;
    },
    navExportRequested: (
      state,
      _action: PayloadAction<{ calculationId: string; format: 'pdf' | 'excel' }>
    ) => {
      state.calculations.error = undefined;
    },

    navCalculationUpserted: (state, action: PayloadAction<NAVCalculation>) => {
      if (!state.calculations.data) {
        state.calculations.data = { calculations: [] };
      }
      upsertCalculation(state.calculations.data.calculations, action.payload);
      state.calculations.status = 'succeeded';
      state.calculations.error = undefined;
    },

    navExportSucceeded: (state, action: PayloadAction<{ exportedAt: string }>) => {
      state.lastExportAt = action.payload.exportedAt;
    },
  },
});

export const {
  navRequested,
  navLoaded,
  navFailed,
  navCalculateRequested,
  navReviewRequested,
  navPublishRequested,
  navExportRequested,
  navCalculationUpserted,
  navExportSucceeded,
} = navOpsSlice.actions;

export const navOpsSelectors = createAsyncSelectors<NAVOpsData>((state) => state.navOps.calculations);

export const navOpsReducer = navOpsSlice.reducer;
