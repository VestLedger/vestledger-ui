import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type { Fund, FundStatus, FundStrategy, FundViewMode } from '@/types/fund';
import type { StandardQueryParams } from '@/types/serviceParams';
import type { RootState } from '@/store/rootReducer';

export interface FundsData {
  funds: Fund[];
}

export type GetFundsParams = Partial<StandardQueryParams>;

export interface CreateFundParams {
  name: string;
  displayName: string;
  fundNumber: number;
  status: FundStatus;
  strategy: FundStrategy;
  vintage: number;
  fundTerm: number;
  totalCommitment: number;
  deployedCapital: number;
  availableCapital: number;
  portfolioValue: number;
  minInvestment: number;
  maxInvestment: number;
  targetSectors: string[];
  targetStages: string[];
  managers: string[];
  startDate: string;
  endDate?: string;
  description?: string;
  irr?: number;
  tvpi?: number;
  dpi?: number;
  moic?: number;
}

interface FundState extends AsyncState<FundsData> {
  hydrated: boolean;
  selectedFundId: string | null;
  viewMode: FundViewMode;
  archivedFundIds: string[];
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationError: NormalizedError | undefined;
}

const initialState: FundState = {
  ...createInitialAsyncState<FundsData>(),
  hydrated: false,
  selectedFundId: null,
  viewMode: 'consolidated',
  archivedFundIds: [],
  mutationStatus: 'idle',
  mutationError: undefined,
};

const fundSlice = createSlice({
  name: 'fund',
  initialState,
  reducers: {
    fundsRequested: (state, _action: PayloadAction<GetFundsParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },
    fundsLoaded: (state, action: PayloadAction<FundsData>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = undefined;

      if (
        state.selectedFundId === null
        && state.viewMode === 'individual'
        && action.payload.funds.length > 0
      ) {
        const visible = action.payload.funds.filter((fund) => !state.archivedFundIds.includes(fund.id));
        state.selectedFundId = visible[0]?.id ?? null;
      }
    },
    fundsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    fundHydrated: (
      state,
      action: PayloadAction<{
        selectedFundId: string | null;
        viewMode: FundViewMode;
        archivedFundIds?: string[];
      }>
    ) => {
      state.hydrated = true;
      state.selectedFundId = action.payload.selectedFundId;
      state.viewMode = action.payload.viewMode;
      state.archivedFundIds = action.payload.archivedFundIds ?? [];
    },
    setSelectedFundId: (state, action: PayloadAction<string | null>) => {
      state.selectedFundId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<FundViewMode>) => {
      state.viewMode = action.payload;
    },

    createFundRequested: (state, _action: PayloadAction<CreateFundParams>) => {
      state.mutationStatus = 'loading';
      state.mutationError = undefined;
    },
    createFundSucceeded: (state, action: PayloadAction<Fund>) => {
      if (!state.data) {
        state.data = { funds: [] };
      }
      state.data.funds.unshift(action.payload);
      state.mutationStatus = 'succeeded';
      state.mutationError = undefined;
      if (state.viewMode === 'individual') {
        state.selectedFundId = action.payload.id;
      }
    },
    createFundFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.mutationStatus = 'failed';
      state.mutationError = action.payload;
    },

    updateFundRequested: (
      state,
      _action: PayloadAction<{ fundId: string; data: Partial<CreateFundParams> }>
    ) => {
      state.mutationStatus = 'loading';
      state.mutationError = undefined;
    },
    updateFundSucceeded: (state, action: PayloadAction<Fund>) => {
      if (!state.data) {
        state.data = { funds: [] };
      }
      const index = state.data.funds.findIndex((fund) => fund.id === action.payload.id);
      if (index === -1) {
        state.data.funds.unshift(action.payload);
      } else {
        state.data.funds[index] = action.payload;
      }
      state.mutationStatus = 'succeeded';
      state.mutationError = undefined;
    },
    updateFundFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.mutationStatus = 'failed';
      state.mutationError = action.payload;
    },

    closeFundRequested: (state, _action: PayloadAction<{ fundId: string }>) => {
      state.mutationStatus = 'loading';
      state.mutationError = undefined;
    },
    closeFundSucceeded: (state, action: PayloadAction<Fund>) => {
      if (!state.data) {
        state.data = { funds: [] };
      }
      const index = state.data.funds.findIndex((fund) => fund.id === action.payload.id);
      if (index === -1) {
        state.data.funds.unshift(action.payload);
      } else {
        state.data.funds[index] = action.payload;
      }
      state.mutationStatus = 'succeeded';
      state.mutationError = undefined;
    },
    closeFundFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.mutationStatus = 'failed';
      state.mutationError = action.payload;
    },

    archiveFundRequested: (state, _action: PayloadAction<{ fundId: string }>) => {
      state.mutationStatus = 'loading';
      state.mutationError = undefined;
    },
    archiveFundSucceeded: (state, action: PayloadAction<{ fundId: string }>) => {
      const { fundId } = action.payload;
      if (!state.archivedFundIds.includes(fundId)) {
        state.archivedFundIds.push(fundId);
      }
      if (state.selectedFundId === fundId) {
        state.selectedFundId = null;
      }
      state.mutationStatus = 'succeeded';
      state.mutationError = undefined;
    },
    archiveFundFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.mutationStatus = 'failed';
      state.mutationError = action.payload;
    },

    unarchiveFundRequested: (state, _action: PayloadAction<{ fundId: string }>) => {
      state.mutationStatus = 'loading';
      state.mutationError = undefined;
    },
    unarchiveFundSucceeded: (state, action: PayloadAction<{ fundId: string }>) => {
      state.archivedFundIds = state.archivedFundIds.filter((id) => id !== action.payload.fundId);
      state.mutationStatus = 'succeeded';
      state.mutationError = undefined;
    },
    unarchiveFundFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.mutationStatus = 'failed';
      state.mutationError = action.payload;
    },

    clearFundMutationState: (state) => {
      state.mutationStatus = 'idle';
      state.mutationError = undefined;
    },
  },
});

export const {
  fundsRequested,
  fundsLoaded,
  fundsFailed,
  fundHydrated,
  setSelectedFundId,
  setViewMode,
  createFundRequested,
  createFundSucceeded,
  createFundFailed,
  updateFundRequested,
  updateFundSucceeded,
  updateFundFailed,
  closeFundRequested,
  closeFundSucceeded,
  closeFundFailed,
  archiveFundRequested,
  archiveFundSucceeded,
  archiveFundFailed,
  unarchiveFundRequested,
  unarchiveFundSucceeded,
  unarchiveFundFailed,
  clearFundMutationState,
} = fundSlice.actions;

export const fundsSelectors = createAsyncSelectors<FundsData>('fund');

export const fundUISelectors = {
  selectHydrated: (state: RootState) => state.fund.hydrated,
  selectSelectedFundId: (state: RootState) => state.fund.selectedFundId,
  selectViewMode: (state: RootState) => state.fund.viewMode,
  selectArchivedFundIds: (state: RootState) => state.fund.archivedFundIds,
  selectMutationStatus: (state: RootState) => state.fund.mutationStatus,
  selectMutationError: (state: RootState) => state.fund.mutationError,
  selectVisibleFunds: (state: RootState): Fund[] => {
    const archivedIds = new Set(state.fund.archivedFundIds);
    const funds = state.fund.data?.funds || [];
    return funds.filter((fund) => !archivedIds.has(fund.id));
  },
  selectArchivedFunds: (state: RootState): Fund[] => {
    const archivedIds = new Set(state.fund.archivedFundIds);
    const funds = state.fund.data?.funds || [];
    return funds.filter((fund) => archivedIds.has(fund.id));
  },
  selectSelectedFund: (state: RootState): Fund | null => {
    const fundId = state.fund.selectedFundId;
    const funds = state.fund.data?.funds || [];
    return funds.find((fund: Fund) => fund.id === fundId) || null;
  },
};

export const fundReducer = fundSlice.reducer;
