import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { RootState } from '../rootReducer';
import type { ComplianceItem, RegulatoryFiling, AuditSchedule } from '@/data/mocks/back-office/compliance';
import type { CapitalCall, Distribution, LPResponse } from '@/data/mocks/back-office/fund-admin';
import type { TaxDocument, TaxSummary, PortfolioCompanyTax } from '@/data/mocks/back-office/tax-center';
import type { Valuation409A, StrikePrice, ValuationHistory } from '@/data/mocks/back-office/valuation-409a';

export interface ComplianceData {
  complianceItems: ComplianceItem[];
  regulatoryFilings: RegulatoryFiling[];
  auditSchedule: AuditSchedule[];
}

export interface FundAdminData {
  capitalCalls: CapitalCall[];
  distributions: Distribution[];
  lpResponses: LPResponse[];
}

export interface CapitalCallCreateInput {
  fundId: string;
  fundName: string;
  totalAmount: number;
  dueDate: string;
  purpose: string;
  callDate?: string;
}

export interface TaxCenterData {
  filingDeadline: Date | null;
  taxDocuments: TaxDocument[];
  taxSummaries: TaxSummary[];
  portfolioTax: PortfolioCompanyTax[];
}

export interface Valuation409aData {
  valuations: Valuation409A[];
  strikePrices: StrikePrice[];
  history: ValuationHistory[];
}

interface BackOfficeState {
  compliance: AsyncState<ComplianceData>;
  fundAdmin: AsyncState<FundAdminData>;
  taxCenter: AsyncState<TaxCenterData>;
  valuation409a: AsyncState<Valuation409aData>;
  fundAdminLastExportAt?: string;
}

const initialState: BackOfficeState = {
  compliance: createInitialAsyncState<ComplianceData>(),
  fundAdmin: createInitialAsyncState<FundAdminData>(),
  taxCenter: createInitialAsyncState<TaxCenterData>(),
  valuation409a: createInitialAsyncState<Valuation409aData>(),
};

function upsertCapitalCall(list: CapitalCall[], value: CapitalCall) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

function upsertLPResponse(list: LPResponse[], value: LPResponse) {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) {
    list.unshift(value);
    return;
  }
  list[index] = value;
}

const backOfficeSlice = createSlice({
  name: 'backOffice',
  initialState,
  reducers: {
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

    fundAdminRequested: (state, _action: PayloadAction<{ fundId?: string } | undefined>) => {
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

    capitalCallCreateRequested: (state, _action: PayloadAction<CapitalCallCreateInput>) => {
      state.fundAdmin.status = 'loading';
      state.fundAdmin.error = undefined;
    },
    capitalCallCreateSucceeded: (state, action: PayloadAction<CapitalCall>) => {
      if (!state.fundAdmin.data) {
        state.fundAdmin.data = { capitalCalls: [], distributions: [], lpResponses: [] };
      }
      upsertCapitalCall(state.fundAdmin.data.capitalCalls, action.payload);
      state.fundAdmin.status = 'succeeded';
      state.fundAdmin.error = undefined;
    },
    capitalCallCreateFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.fundAdmin.status = 'failed';
      state.fundAdmin.error = action.payload;
    },

    capitalCallUpdateRequested: (
      state,
      _action: PayloadAction<{ capitalCallId: string; patch: Partial<CapitalCall> }>
    ) => {
      state.fundAdmin.status = 'loading';
      state.fundAdmin.error = undefined;
    },
    capitalCallUpdateSucceeded: (state, action: PayloadAction<CapitalCall>) => {
      if (!state.fundAdmin.data) {
        state.fundAdmin.data = { capitalCalls: [], distributions: [], lpResponses: [] };
      }
      upsertCapitalCall(state.fundAdmin.data.capitalCalls, action.payload);
      state.fundAdmin.status = 'succeeded';
      state.fundAdmin.error = undefined;
    },
    capitalCallUpdateFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.fundAdmin.status = 'failed';
      state.fundAdmin.error = action.payload;
    },

    capitalCallSendRequested: (state, _action: PayloadAction<{ capitalCallId: string }>) => {
      state.fundAdmin.status = 'loading';
      state.fundAdmin.error = undefined;
    },
    capitalCallReminderRequested: (state, _action: PayloadAction<{ capitalCallId: string }>) => {
      state.fundAdmin.error = undefined;
    },

    lpReminderRequested: (state, _action: PayloadAction<{ lpResponseId: string }>) => {
      state.fundAdmin.error = undefined;
    },
    lpResponseUpdateRequested: (
      state,
      _action: PayloadAction<{ lpResponseId: string; amountPaid: number }>
    ) => {
      state.fundAdmin.status = 'loading';
      state.fundAdmin.error = undefined;
    },
    lpResponseUpdateSucceeded: (state, action: PayloadAction<LPResponse>) => {
      if (!state.fundAdmin.data) {
        state.fundAdmin.data = { capitalCalls: [], distributions: [], lpResponses: [] };
      }
      upsertLPResponse(state.fundAdmin.data.lpResponses, action.payload);
      state.fundAdmin.status = 'succeeded';
      state.fundAdmin.error = undefined;
    },
    lpResponseUpdateFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.fundAdmin.status = 'failed';
      state.fundAdmin.error = action.payload;
    },

    fundAdminExportRequested: (state) => {
      state.fundAdmin.error = undefined;
    },
    fundAdminExportSucceeded: (state, action: PayloadAction<{ exportedAt: string }>) => {
      state.fundAdminLastExportAt = action.payload.exportedAt;
    },

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
  capitalCallCreateRequested,
  capitalCallCreateSucceeded,
  capitalCallCreateFailed,
  capitalCallUpdateRequested,
  capitalCallUpdateSucceeded,
  capitalCallUpdateFailed,
  capitalCallSendRequested,
  capitalCallReminderRequested,
  lpReminderRequested,
  lpResponseUpdateRequested,
  lpResponseUpdateSucceeded,
  lpResponseUpdateFailed,
  fundAdminExportRequested,
  fundAdminExportSucceeded,
  taxCenterRequested,
  taxCenterLoaded,
  taxCenterFailed,
  valuation409aRequested,
  valuation409aLoaded,
  valuation409aFailed,
} = backOfficeSlice.actions;

export const complianceSelectors = {
  selectData: (state: RootState) => state.backOffice.compliance.data,
  selectStatus: (state: RootState) => state.backOffice.compliance.status,
  selectError: (state: RootState) => state.backOffice.compliance.error,
  selectIsLoading: (state: RootState) => state.backOffice.compliance.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.compliance.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.compliance.status === 'failed',
  selectState: (state: RootState) => state.backOffice.compliance,
};

export const fundAdminSelectors = {
  selectData: (state: RootState) => state.backOffice.fundAdmin.data,
  selectStatus: (state: RootState) => state.backOffice.fundAdmin.status,
  selectError: (state: RootState) => state.backOffice.fundAdmin.error,
  selectIsLoading: (state: RootState) => state.backOffice.fundAdmin.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.fundAdmin.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.fundAdmin.status === 'failed',
  selectState: (state: RootState) => state.backOffice.fundAdmin,
};

export const taxCenterSelectors = {
  selectData: (state: RootState) => state.backOffice.taxCenter.data,
  selectStatus: (state: RootState) => state.backOffice.taxCenter.status,
  selectError: (state: RootState) => state.backOffice.taxCenter.error,
  selectIsLoading: (state: RootState) => state.backOffice.taxCenter.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.backOffice.taxCenter.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.backOffice.taxCenter.status === 'failed',
  selectState: (state: RootState) => state.backOffice.taxCenter,
};

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
