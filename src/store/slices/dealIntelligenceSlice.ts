import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DealIntelligenceData {
  activeDeals: any[];
  dealAnalyticsData: any[];
  documentCategories: any[];
  fundAnalytics: any;
  mockDocuments: any[];
}

interface DealIntelligenceState {
  data: DealIntelligenceData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DealIntelligenceState = {
  data: null,
  loading: false,
  error: null,
};

const dealIntelligenceSlice = createSlice({
  name: 'dealIntelligence',
  initialState,
  reducers: {
    dealIntelligenceRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    dealIntelligenceLoaded: (state, action: PayloadAction<DealIntelligenceData>) => {
      state.data = action.payload;
      state.loading = false;
    },
    dealIntelligenceFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  dealIntelligenceRequested,
  dealIntelligenceLoaded,
  dealIntelligenceFailed,
} = dealIntelligenceSlice.actions;

export const dealIntelligenceReducer = dealIntelligenceSlice.reducer;
