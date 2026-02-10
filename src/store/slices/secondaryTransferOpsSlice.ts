import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { LPTransfer, ROFRExercise } from '@/types/fundAdminOps';

export interface SecondaryTransferOpsData {
  transfers: LPTransfer[];
  rofrExercises: ROFRExercise[];
}

interface SecondaryTransferOpsState {
  data: AsyncState<SecondaryTransferOpsData>;
}

const initialState: SecondaryTransferOpsState = {
  data: createInitialAsyncState<SecondaryTransferOpsData>(),
};

function upsertTransfer(list: LPTransfer[], value: LPTransfer) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

const secondaryTransferOpsSlice = createSlice({
  name: 'secondaryTransferOps',
  initialState,
  reducers: {
    secondaryTransfersRequested: (
      state,
      _action: PayloadAction<{ fundId?: string } | undefined>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransfersLoaded: (state, action: PayloadAction<SecondaryTransferOpsData>) => {
      state.data.data = action.payload;
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },
    secondaryTransfersFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.data.status = 'failed';
      state.data.error = action.payload;
    },

    secondaryTransferInitiateRequested: (
      state,
      _action: PayloadAction<{
        transfer: Omit<
          LPTransfer,
          'id' | 'transferNumber' | 'requestedDate' | 'documents' | 'status'
        >;
      }>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferReviewRequested: (state, _action: PayloadAction<{ transferId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferApproveRequested: (state, _action: PayloadAction<{ transferId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferRejectRequested: (
      state,
      _action: PayloadAction<{ transferId: string; reason: string }>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferCompleteRequested: (state, _action: PayloadAction<{ transferId: string }>) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferUploadDocumentRequested: (
      state,
      _action: PayloadAction<{ transferId: string; docName: string }>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },
    secondaryTransferExerciseROFRRequested: (
      state,
      _action: PayloadAction<{ transferId: string; exercisedByName?: string }>
    ) => {
      state.data.status = 'loading';
      state.data.error = undefined;
    },

    secondaryTransferUpserted: (state, action: PayloadAction<LPTransfer>) => {
      if (!state.data.data) {
        state.data.data = { transfers: [], rofrExercises: [] };
      }
      upsertTransfer(state.data.data.transfers, action.payload);
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },
    secondaryTransferROFRAdded: (state, action: PayloadAction<ROFRExercise>) => {
      if (!state.data.data) {
        state.data.data = { transfers: [], rofrExercises: [] };
      }
      const existing = state.data.data.rofrExercises.find((item) => item.id === action.payload.id);
      if (!existing) {
        state.data.data.rofrExercises.unshift(action.payload);
      }
      state.data.status = 'succeeded';
      state.data.error = undefined;
    },
  },
});

export const {
  secondaryTransfersRequested,
  secondaryTransfersLoaded,
  secondaryTransfersFailed,
  secondaryTransferInitiateRequested,
  secondaryTransferReviewRequested,
  secondaryTransferApproveRequested,
  secondaryTransferRejectRequested,
  secondaryTransferCompleteRequested,
  secondaryTransferUploadDocumentRequested,
  secondaryTransferExerciseROFRRequested,
  secondaryTransferUpserted,
  secondaryTransferROFRAdded,
} = secondaryTransferOpsSlice.actions;

export const secondaryTransferOpsSelectors = createAsyncSelectors<SecondaryTransferOpsData>(
  (state) => state.secondaryTransferOps.data
);

export const secondaryTransferOpsReducer = secondaryTransferOpsSlice.reducer;
