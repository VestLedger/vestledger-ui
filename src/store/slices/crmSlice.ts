import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { StandardQueryParams } from '@/types/serviceParams';

// TODO: Replace 'any' with proper types when CRM types are defined
export interface CRMData {
  contacts: any[];
  emailAccounts: any[];
  interactions: any[];
  timelineInteractions: any[];
}

export interface GetCRMDataParams extends Partial<StandardQueryParams> {
  fundId?: string | null;
  contactType?: string;
}

type CRMState = AsyncState<CRMData>;

const initialState: CRMState = createInitialAsyncState<CRMData>();

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    crmDataRequested: (state, action: PayloadAction<GetCRMDataParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    crmDataLoaded: (state, action: PayloadAction<CRMData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    crmDataFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  crmDataRequested,
  crmDataLoaded,
  crmDataFailed,
} = crmSlice.actions;

// Centralized selectors
export const crmSelectors = createAsyncSelectors<CRMData>('crm');

export const crmReducer = crmSlice.reducer;
