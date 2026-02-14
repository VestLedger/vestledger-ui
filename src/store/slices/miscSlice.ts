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
  LPDistributionElection,
  LPBankDetails,
  LPNotificationPreferences,
  LPEmailPreview,
  LPFAQItem,
} from '@/data/mocks/lp-portal/lp-investor-portal';
import type { AuditEvent } from '@/data/mocks/blockchain/audit-trail';
import type { Company } from '@/data/mocks/deal-intelligence/company-search';
import type { LPManagementSnapshot } from '@/services/lpPortal/lpManagementService';
import type { CollaborationSnapshot } from '@/services/collaboration/collaborationService';

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
  distributionElections: LPDistributionElection[];
  bankDetails: LPBankDetails;
  notificationPreferences: LPNotificationPreferences;
  emailPreview: LPEmailPreview;
  faqItems: LPFAQItem[];
}

type LPManagementData = LPManagementSnapshot;

interface AuditTrailData {
  events: AuditEvent[];
}

interface CompanySearchData {
  companies: Company[];
  industries: string[];
  stages: string[];
}

type CollaborationData = CollaborationSnapshot;

interface MiscState {
  integrations: AsyncState<IntegrationsData>;
  lpPortal: AsyncState<LPPortalData>;
  lpManagement: AsyncState<LPManagementData>;
  auditTrail: AsyncState<AuditTrailData>;
  companySearch: AsyncState<CompanySearchData>;
  collaboration: AsyncState<CollaborationData>;
}

const initialState: MiscState = {
  integrations: createInitialAsyncState<IntegrationsData>(),
  lpPortal: createInitialAsyncState<LPPortalData>(),
  lpManagement: createInitialAsyncState<LPManagementData>(),
  auditTrail: createInitialAsyncState<AuditTrailData>(),
  companySearch: createInitialAsyncState<CompanySearchData>(),
  collaboration: createInitialAsyncState<CollaborationData>(),
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

    // LP Management actions
    lpManagementRequested: (state) => {
      state.lpManagement.status = 'loading';
      state.lpManagement.error = undefined;
    },
    lpManagementLoaded: (state, action: PayloadAction<LPManagementData>) => {
      state.lpManagement.data = action.payload;
      state.lpManagement.status = 'succeeded';
      state.lpManagement.error = undefined;
    },
    lpManagementFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.lpManagement.status = 'failed';
      state.lpManagement.error = action.payload;
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

    // Collaboration actions
    collaborationRequested: (state) => {
      state.collaboration.status = 'loading';
      state.collaboration.error = undefined;
    },
    collaborationLoaded: (state, action: PayloadAction<CollaborationData>) => {
      state.collaboration.data = action.payload;
      state.collaboration.status = 'succeeded';
      state.collaboration.error = undefined;
    },
    collaborationFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.collaboration.status = 'failed';
      state.collaboration.error = action.payload;
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
  lpManagementRequested,
  lpManagementLoaded,
  lpManagementFailed,
  auditTrailRequested,
  auditTrailLoaded,
  auditTrailFailed,
  companySearchRequested,
  companySearchLoaded,
  companySearchFailed,
  collaborationRequested,
  collaborationLoaded,
  collaborationFailed,
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

// Selectors for LP management
export const lpManagementSelectors = {
  selectData: (state: RootState) => state.misc.lpManagement.data,
  selectStatus: (state: RootState) => state.misc.lpManagement.status,
  selectError: (state: RootState) => state.misc.lpManagement.error,
  selectIsLoading: (state: RootState) => state.misc.lpManagement.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.lpManagement.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.lpManagement.status === 'failed',
  selectState: (state: RootState) => state.misc.lpManagement,
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

// Selectors for collaboration
export const collaborationSelectors = {
  selectData: (state: RootState) => state.misc.collaboration.data,
  selectStatus: (state: RootState) => state.misc.collaboration.status,
  selectError: (state: RootState) => state.misc.collaboration.error,
  selectIsLoading: (state: RootState) => state.misc.collaboration.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.misc.collaboration.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.misc.collaboration.status === 'failed',
  selectState: (state: RootState) => state.misc.collaboration,
};

export const miscReducer = miscSlice.reducer;
