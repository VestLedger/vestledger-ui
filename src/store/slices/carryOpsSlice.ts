import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { CarryAccrual, CarriedInterestTerm } from '@/types/fundAdminOps';

export interface CarryOpsData {
  terms: CarriedInterestTerm[];
  accruals: CarryAccrual[];
}

interface CarryOpsState {
  data: AsyncState<CarryOpsData>;
  lastExportAt?: string;
}

const initialState: CarryOpsState = {
  data: createInitialAsyncState<CarryOpsData>(),
};

function upsertAccrual(list: CarryAccrual[], value: CarryAccrual) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

const carryOpsSlice = createSlice({
  name: 'carryOps',
  initialState,
  reducers: {
    carryRequested: (state, _action: PayloadAction<{ fundId?: string } | undefined>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    carryLoaded: (state, action: PayloadAction<CarryOpsData>) => {
      state.data.data = action.payload;
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },
    carryFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.data.status = 'failed';
      state.data.error = action.payload;
    },

    carryCalculateRequested: (state, _action: PayloadAction<{ fundId: string; fundName: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    carryApproveRequested: (state, _action: PayloadAction<{ accrualId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    carryDistributeRequested: (state, _action: PayloadAction<{ accrualId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    carryExportRequested: (
      state,
      _action: PayloadAction<{ accrualId: string; format: 'pdf' | 'excel' }>
    ) => {
      state.data.error = undefined;
    },

    carryAccrualUpserted: (state, action: PayloadAction<CarryAccrual>) => {
      if (!state.data.data) {
        state.data.data = { terms: [], accruals: [] };
      }
      upsertAccrual(state.data.data.accruals, action.payload);
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },

    carryExportSucceeded: (state, action: PayloadAction<{ exportedAt: string }>) => {
      state.lastExportAt = action.payload.exportedAt;
    },
  },
});

export const {
  carryRequested,
  carryLoaded,
  carryFailed,
  carryCalculateRequested,
  carryApproveRequested,
  carryDistributeRequested,
  carryExportRequested,
  carryAccrualUpserted,
  carryExportSucceeded,
} = carryOpsSlice.actions;

export const carryOpsSelectors = createAsyncSelectors<CarryOpsData>((state) => state.carryOps.data);

export const carryOpsReducer = carryOpsSlice.reducer;
