import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Deal } from '@/services/dealflow/dealflowReviewService';
import type { CompanyScoreData } from '@/services/dealflow/companyScoringService';

interface DealflowState {
  // Dealflow Review
  deals: Deal[];
  dealsLoading: boolean;
  dealsError: string | null;

  // Company Scoring
  scoreData: CompanyScoreData | null;
  scoreLoading: boolean;
  scoreError: string | null;
}

const initialState: DealflowState = {
  deals: [],
  dealsLoading: false,
  dealsError: null,
  scoreData: null,
  scoreLoading: false,
  scoreError: null,
};

const dealflowSlice = createSlice({
  name: 'dealflow',
  initialState,
  reducers: {
    // Dealflow Review - Deals
    dealflowDealsRequested: (state) => {
      state.dealsLoading = true;
      state.dealsError = null;
    },
    dealflowDealsLoaded: (state, action: PayloadAction<Deal[]>) => {
      state.deals = action.payload;
      state.dealsLoading = false;
      state.dealsError = null;
    },
    dealflowDealsFailed: (state, action: PayloadAction<string>) => {
      state.dealsLoading = false;
      state.dealsError = action.payload;
    },

    // Company Scoring
    companyScoringRequested: (state) => {
      state.scoreLoading = true;
      state.scoreError = null;
    },
    companyScoringLoaded: (state, action: PayloadAction<CompanyScoreData>) => {
      state.scoreData = action.payload;
      state.scoreLoading = false;
      state.scoreError = null;
    },
    companyScoringFailed: (state, action: PayloadAction<string>) => {
      state.scoreLoading = false;
      state.scoreError = action.payload;
    },
  },
});

export const {
  dealflowDealsRequested,
  dealflowDealsLoaded,
  dealflowDealsFailed,
  companyScoringRequested,
  companyScoringLoaded,
  companyScoringFailed,
} = dealflowSlice.actions;

export const dealflowReducer = dealflowSlice.reducer;
