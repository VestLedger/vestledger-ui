import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CRMData {
  contacts: any[];
  emailAccounts: any[];
  interactions: any[];
  timelineInteractions: any[];
}

interface CRMState {
  data: CRMData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CRMState = {
  data: null,
  loading: false,
  error: null,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    crmDataRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    crmDataLoaded: (state, action: PayloadAction<CRMData>) => {
      state.data = action.payload;
      state.loading = false;
    },
    crmDataFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  crmDataRequested,
  crmDataLoaded,
  crmDataFailed,
} = crmSlice.actions;

export const crmReducer = crmSlice.reducer;
