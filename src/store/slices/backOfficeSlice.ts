import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { RootState } from '../rootReducer';

// Back-office data interfaces
export interface ComplianceData {
  complianceItems: any[];
  regulatoryFilings: any[];
  auditSchedule: any[];
}

export interface FundAdminData {
  capitalCalls: any[];
  distributions: any[];
  lpResponses: any[];
}

export interface TaxCenterData {
  filingDeadline: Date | null;
  taxDocuments: any[];
  taxSummaries: any[];
  portfolioTax: any[];
}

export interface Valuation409aData {
  valuations: any[];
  strikePrices: any[];
  history: any[];
}

interface BackOfficeState {
  compliance: AsyncState<ComplianceData>;
  fundAdmin: AsyncState<FundAdminData>;
  taxCenter: AsyncState<TaxCenterData>;
  valuation409a: AsyncState<Valuation409aData>;
}

const initialState: BackOfficeState = {
  compliance: createInitialAsyncState<ComplianceData>(),
  fundAdmin: createInitialAsyncState<FundAdminData>(),
  taxCenter: createInitialAsyncState<TaxCenterData>(),
  valuation409a: createInitialAsyncState<Valuation409aData>(),
};

const backOfficeSlice = createSlice({
  name: 'backOffice',
  initialState,
  reducers: {
    // Compliance
    complianceRequested: (state) => {
      state.compliance.status = 'loading';
      state.compliance.error = undefined;
    },
    complianceLoaded: (state, action: PayloadAction<ComplianceData>) => {
      state.compliance.data = action.payload;
      state.compliance.status = 'succeeded';
      state.compliance.error = undefined;
    },
    complianceFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.compliance.status = 'failed';
      state.compliance.error = action.payload;
    },

    // Fund Admin
    fundAdminRequested: (state) => {
      state.fundAdmin.status = 'loading';
      state.fundAdmin.error = undefined;
    },
    fundAdminLoaded: (state, action: PayloadAction<FundAdminData>) => {
      state.fundAdmin.data = action.payload;
      state.fundAdmin.status = 'succeeded';
      state.fundAdmin.error = undefined;
    },
    fundAdminFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.fundAdmin.status = 'failed';
      state.fundAdmin.error = action.payload;
    },

    // Tax Center
    taxCenterRequested: (state) => {
      state.taxCenter.status = 'loading';
      state.taxCenter.error = undefined;
    },
    taxCenterLoaded: (state, action: PayloadAction<TaxCenterData>) => {
      state.taxCenter.data = action.payload;
      state.taxCenter.status = 'succeeded';
      state.taxCenter.error = undefined;
    },
    taxCenterFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.taxCenter.status = 'failed';
      state.taxCenter.error = action.payload;
    },

    // 409A Valuations
    valuation409aRequested: (state) => {
      state.valuation409a.status = 'loading';
      state.valuation409a.error = undefined;
    },
    valuation409aLoaded: (state, action: PayloadAction<Valuation409aData>) => {
      state.valuation409a.data = action.payload;
      state.valuation409a.status = 'succeeded';
      state.valuation409a.error = undefined;
    },
    valuation409aFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.valuation409a.status = 'failed';
      state.valuation409a.error = action.payload;
    },
  },
});

export const {
  complianceRequested,
  complianceLoaded,
  complianceFailed,
  fundAdminRequested,
  fundAdminLoaded,
  fundAdminFailed,
  taxCenterRequested,
  taxCenterLoaded,
  taxCenterFailed,
  valuation409aRequested,
  valuation409aLoaded,
  valuation409aFailed,
} = backOfficeSlice.actions;

// Selectors for nested compliance state
export const complianceSelectors = {
  selectData: (state: RootState) => state.backOffice.compliance.data,
  selectStatus: (state: RootState) => state.backOffice.compliance.status,
  selectError: (state: RootState) => state.backOffice.compliance.error,
  selectIsLoading: (state: RootState) => state.backOffice.compliance.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.compliance.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.compliance.status === 'failed',
  selectState: (state: RootState) => state.backOffice.compliance,
};

// Selectors for nested fund admin state
export const fundAdminSelectors = {
  selectData: (state: RootState) => state.backOffice.fundAdmin.data,
  selectStatus: (state: RootState) => state.backOffice.fundAdmin.status,
  selectError: (state: RootState) => state.backOffice.fundAdmin.error,
  selectIsLoading: (state: RootState) => state.backOffice.fundAdmin.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.fundAdmin.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.fundAdmin.status === 'failed',
  selectState: (state: RootState) => state.backOffice.fundAdmin,
};

// Selectors for nested tax center state
export const taxCenterSelectors = {
  selectData: (state: RootState) => state.backOffice.taxCenter.data,
  selectStatus: (state: RootState) => state.backOffice.taxCenter.status,
  selectError: (state: RootState) => state.backOffice.taxCenter.error,
  selectIsLoading: (state: RootState) => state.backOffice.taxCenter.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.taxCenter.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.taxCenter.status === 'failed',
  selectState: (state: RootState) => state.backOffice.taxCenter,
};

// Selectors for nested 409a valuation state
export const valuation409aSelectors = {
  selectData: (state: RootState) => state.backOffice.valuation409a.data,
  selectStatus: (state: RootState) => state.backOffice.valuation409a.status,
  selectError: (state: RootState) => state.backOffice.valuation409a.error,
  selectIsLoading: (state: RootState) => state.backOffice.valuation409a.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.valuation409a.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.valuation409a.status === 'failed',
  selectState: (state: RootState) => state.backOffice.valuation409a,
};

export const backOfficeReducer = backOfficeSlice.reducer;
