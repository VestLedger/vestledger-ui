import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Fund, FundViewMode } from '@/types/fund';

interface FundState {
  hydrated: boolean;
  funds: Fund[];
  selectedFundId: string | null;
  viewMode: FundViewMode;
}

const initialState: FundState = {
  hydrated: false,
  funds: [],
  selectedFundId: null,
  viewMode: 'individual',
};

const fundSlice = createSlice({
  name: 'fund',
  initialState,
  reducers: {
    fundsLoaded: (state, action: PayloadAction<Fund[]>) => {
      state.funds = action.payload;
      if (state.selectedFundId === null && action.payload.length > 0) {
        state.selectedFundId = action.payload[0]!.id;
      }
    },
    fundHydrated: (state, action: PayloadAction<{ selectedFundId: string | null; viewMode: FundViewMode }>) => {
      state.hydrated = true;
      state.selectedFundId = action.payload.selectedFundId;
      state.viewMode = action.payload.viewMode;
    },
    setSelectedFundId: (state, action: PayloadAction<string | null>) => {
      state.selectedFundId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<FundViewMode>) => {
      state.viewMode = action.payload;
    },
  },
});

export const { fundsLoaded, fundHydrated, setSelectedFundId, setViewMode } = fundSlice.actions;
export const fundReducer = fundSlice.reducer;
