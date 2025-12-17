import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Types for each feature
interface IntegrationsData {
  accounts: any[];
  events: any[];
}

interface LPPortalData {
  investor: any;
  reports: any[];
  transactions: any[];
}

interface AuditTrailData {
  events: any[];
}

interface CompanySearchData {
  companies: any[];
  industries: any[];
  stages: any[];
}

interface MiscState {
  integrations: {
    data: IntegrationsData | null;
    loading: boolean;
    error: string | null;
  };
  lpPortal: {
    data: LPPortalData | null;
    loading: boolean;
    error: string | null;
  };
  auditTrail: {
    data: AuditTrailData | null;
    loading: boolean;
    error: string | null;
  };
  companySearch: {
    data: CompanySearchData | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: MiscState = {
  integrations: {
    data: null,
    loading: false,
    error: null,
  },
  lpPortal: {
    data: null,
    loading: false,
    error: null,
  },
  auditTrail: {
    data: null,
    loading: false,
    error: null,
  },
  companySearch: {
    data: null,
    loading: false,
    error: null,
  },
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    // Integrations actions
    integrationsRequested: (state) => {
      state.integrations.loading = true;
      state.integrations.error = null;
    },
    integrationsLoaded: (state, action: PayloadAction<IntegrationsData>) => {
      state.integrations.data = action.payload;
      state.integrations.loading = false;
    },
    integrationsFailed: (state, action: PayloadAction<string>) => {
      state.integrations.error = action.payload;
      state.integrations.loading = false;
    },

    // LP Portal actions
    lpPortalRequested: (state) => {
      state.lpPortal.loading = true;
      state.lpPortal.error = null;
    },
    lpPortalLoaded: (state, action: PayloadAction<LPPortalData>) => {
      state.lpPortal.data = action.payload;
      state.lpPortal.loading = false;
    },
    lpPortalFailed: (state, action: PayloadAction<string>) => {
      state.lpPortal.error = action.payload;
      state.lpPortal.loading = false;
    },

    // Audit Trail actions
    auditTrailRequested: (state) => {
      state.auditTrail.loading = true;
      state.auditTrail.error = null;
    },
    auditTrailLoaded: (state, action: PayloadAction<AuditTrailData>) => {
      state.auditTrail.data = action.payload;
      state.auditTrail.loading = false;
    },
    auditTrailFailed: (state, action: PayloadAction<string>) => {
      state.auditTrail.error = action.payload;
      state.auditTrail.loading = false;
    },

    // Company Search actions
    companySearchRequested: (state) => {
      state.companySearch.loading = true;
      state.companySearch.error = null;
    },
    companySearchLoaded: (state, action: PayloadAction<CompanySearchData>) => {
      state.companySearch.data = action.payload;
      state.companySearch.loading = false;
    },
    companySearchFailed: (state, action: PayloadAction<string>) => {
      state.companySearch.error = action.payload;
      state.companySearch.loading = false;
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

export const miscReducer = miscSlice.reducer;
