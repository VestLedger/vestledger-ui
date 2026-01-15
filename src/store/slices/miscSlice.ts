import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { RootState } from '../rootReducer';
import type { CalendarAccount, CalendarEvent } from '@/components/integrations/calendar-integration';
import type { IntegrationSummary } from '@/types/integrations';
import type {
  InvestorData,
  QuarterlyReport,
  Transaction,
  LPDistributionStatement,
  LPUpcomingDistribution,
  LPDistributionConfirmation,
  LPBankDetails,
  LPNotificationPreferences,
  LPEmailPreview,
  LPFAQItem,
} from '@/data/mocks/lp-portal/lp-investor-portal';
import type { AuditEvent } from '@/data/mocks/blockchain/audit-trail';
import type { Company } from '@/data/mocks/deal-intelligence/company-search';

// Types for each feature
interface IntegrationsData {
  accounts: CalendarAccount[];
  events: CalendarEvent[];
  integrations: IntegrationSummary[];
}

interface LPPortalData {
  investor: InvestorData;
  reports: QuarterlyReport[];
  transactions: Transaction[];
  distributionStatements: LPDistributionStatement[];
  upcomingDistributions: LPUpcomingDistribution[];
  distributionConfirmations: LPDistributionConfirmation[];
  bankDetails: LPBankDetails;
  notificationPreferences: LPNotificationPreferences;
  emailPreview: LPEmailPreview;
  faqItems: LPFAQItem[];
}

interface AuditTrailData {
  events: AuditEvent[];
}

interface CompanySearchData {
  companies: Company[];
  industries: string[];
  stages: string[];
}

interface MiscState {
  integrations: AsyncState<IntegrationsData>;
  lpPortal: AsyncState<LPPortalData>;
  auditTrail: AsyncState<AuditTrailData>;
  companySearch: AsyncState<CompanySearchData>;
}

const initialState: MiscState = {
  integrations: createInitialAsyncState<IntegrationsData>(),
  lpPortal: createInitialAsyncState<LPPortalData>(),
  auditTrail: createInitialAsyncState<AuditTrailData>(),
  companySearch: createInitialAsyncState<CompanySearchData>(),
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    // Integrations actions
    integrationsRequested: (state) => {
      state.integrations.status = 'loading';
      state.integrations.error = undefined;
    },
    integrationsLoaded: (state, action: PayloadAction<IntegrationsData>) => {
      state.integrations.data = action.payload;
      state.integrations.status = 'succeeded';
      state.integrations.error = undefined;
    },
    integrationsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.integrations.status = 'failed';
      state.integrations.error = action.payload;
    },

    // LP Portal actions
    lpPortalRequested: (state) => {
      state.lpPortal.status = 'loading';
      state.lpPortal.error = undefined;
    },
    lpPortalLoaded: (state, action: PayloadAction<LPPortalData>) => {
      state.lpPortal.data = action.payload;
      state.lpPortal.status = 'succeeded';
      state.lpPortal.error = undefined;
    },
    lpPortalFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.lpPortal.status = 'failed';
      state.lpPortal.error = action.payload;
    },

    // Audit Trail actions
    auditTrailRequested: (state) => {
      state.auditTrail.status = 'loading';
      state.auditTrail.error = undefined;
    },
    auditTrailLoaded: (state, action: PayloadAction<AuditTrailData>) => {
      state.auditTrail.data = action.payload;
      state.auditTrail.status = 'succeeded';
      state.auditTrail.error = undefined;
    },
    auditTrailFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.auditTrail.status = 'failed';
      state.auditTrail.error = action.payload;
    },

    // Company Search actions
    companySearchRequested: (state) => {
      state.companySearch.status = 'loading';
      state.companySearch.error = undefined;
    },
    companySearchLoaded: (state, action: PayloadAction<CompanySearchData>) => {
      state.companySearch.data = action.payload;
      state.companySearch.status = 'succeeded';
      state.companySearch.error = undefined;
    },
    companySearchFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.companySearch.status = 'failed';
      state.companySearch.error = action.payload;
    },
  },
});

export const {
  integrationsRequested,
  integrationsLoaded,
  integrationsFailed,
  lpPortalRequested,
  lpPortalLoaded,
  lpPortalFailed,
  auditTrailRequested,
  auditTrailLoaded,
  auditTrailFailed,
  companySearchRequested,
  companySearchLoaded,
  companySearchFailed,
} = miscSlice.actions;

// Selectors for integrations
export const integrationsSelectors = {
  selectData: (state: RootState) => state.misc.integrations.data,
  selectStatus: (state: RootState) => state.misc.integrations.status,
  selectError: (state: RootState) => state.misc.integrations.error,
  selectIsLoading: (state: RootState) => state.misc.integrations.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.integrations.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.integrations.status === 'failed',
  selectState: (state: RootState) => state.misc.integrations,
};

// Selectors for LP portal
export const lpPortalSelectors = {
  selectData: (state: RootState) => state.misc.lpPortal.data,
  selectStatus: (state: RootState) => state.misc.lpPortal.status,
  selectError: (state: RootState) => state.misc.lpPortal.error,
  selectIsLoading: (state: RootState) => state.misc.lpPortal.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.lpPortal.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.lpPortal.status === 'failed',
  selectState: (state: RootState) => state.misc.lpPortal,
};

// Selectors for audit trail
export const auditTrailSelectors = {
  selectData: (state: RootState) => state.misc.auditTrail.data,
  selectStatus: (state: RootState) => state.misc.auditTrail.status,
  selectError: (state: RootState) => state.misc.auditTrail.error,
  selectIsLoading: (state: RootState) => state.misc.auditTrail.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.auditTrail.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.auditTrail.status === 'failed',
  selectState: (state: RootState) => state.misc.auditTrail,
};

// Selectors for company search
export const companySearchSelectors = {
  selectData: (state: RootState) => state.misc.companySearch.data,
  selectStatus: (state: RootState) => state.misc.companySearch.status,
  selectError: (state: RootState) => state.misc.companySearch.error,
  selectIsLoading: (state: RootState) => state.misc.companySearch.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.companySearch.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.companySearch.status === 'failed',
  selectState: (state: RootState) => state.misc.companySearch,
};

export const miscReducer = miscSlice.reducer;
