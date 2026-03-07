import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type {
  ActiveDeal,
  Document,
  DealAnalytics,
  FundAnalytics,
  DocumentCategory,
} from '@/services/dealIntelligence/dealIntelligenceService';
import type { LucideIcon } from 'lucide-react';
import type { StandardQueryParams } from '@/types/serviceParams';

export interface DealIntelligenceData {
  activeDeals: ActiveDeal[];
  dealAnalyticsData: DealAnalytics[];
  documentCategories: Array<{
    id: DocumentCategory;
    name: string;
    icon: LucideIcon;
    color: string;
  }>;
  fundAnalytics: FundAnalytics;
  documents: Document[];
}

export type GetDealIntelligenceParams = Partial<StandardQueryParams>;

type DealIntelligenceState = AsyncState<DealIntelligenceData>;

const initialState: DealIntelligenceState = createInitialAsyncState<DealIntelligenceData>();

const dealIntelligenceSlice = createSlice({
  name: 'dealIntelligence',
  initialState,
  reducers: {
    dealIntelligenceRequested: (state, _action: PayloadAction<GetDealIntelligenceParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    dealIntelligenceLoaded: (state, action: PayloadAction<DealIntelligenceData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },
    dealIntelligenceFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  dealIntelligenceLoaded,
  dealIntelligenceFailed,
} = dealIntelligenceSlice.actions;

// Centralized selectors
export const dealIntelligenceSelectors = createAsyncSelectors<DealIntelligenceData>('dealIntelligence');

export const dealIntelligenceReducer = dealIntelligenceSlice.reducer;
