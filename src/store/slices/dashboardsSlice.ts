import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { RootState } from '../rootReducer';

// Define types for each dashboard's data
export interface LPDashboardData {
  metrics: any;
  documents: any[];
  capitalActivity: any[];
  pendingCalls: any[];
  pendingSignatures: any[];
  commitment: {
    totalCommitment: number;
    calledAmount: number;
  };
}

export interface AnalystDashboardData {
  metrics: any;
  recentDeals: any[];
  urgentTasks: any[];
}

export interface OpsDashboardData {
  metrics: any;
  complianceAlerts: any[];
  upcomingDistributions: any[];
}

export interface AuditorDashboardData {
  metrics: any;
  auditTrail: any[];
  complianceItems: any[];
}

export interface IRDashboardData {
  metrics: any;
  recentInteractions: any[];
  upcomingTasks: any[];
}

export interface ResearcherDashboardData {
  metrics: any;
  recentReports: any[];
  trendingTopics: any[];
}

interface DashboardsState {
  lp: AsyncState<LPDashboardData>;
  analyst: AsyncState<AnalystDashboardData>;
  ops: AsyncState<OpsDashboardData>;
  auditor: AsyncState<AuditorDashboardData>;
  ir: AsyncState<IRDashboardData>;
  researcher: AsyncState<ResearcherDashboardData>;
}

const initialState: DashboardsState = {
  lp: createInitialAsyncState<LPDashboardData>(),
  analyst: createInitialAsyncState<AnalystDashboardData>(),
  ops: createInitialAsyncState<OpsDashboardData>(),
  auditor: createInitialAsyncState<AuditorDashboardData>(),
  ir: createInitialAsyncState<IRDashboardData>(),
  researcher: createInitialAsyncState<ResearcherDashboardData>(),
};

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState,
  reducers: {
    // LP Dashboard
    lpDashboardRequested: (state) => {
      state.lp.status = 'loading';
      state.lp.error = undefined;
    },
    lpDashboardLoaded: (state, action: PayloadAction<LPDashboardData>) => {
      state.lp.data = action.payload;
      state.lp.status = 'succeeded';
      state.lp.error = undefined;
    },
    lpDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.lp.status = 'failed';
      state.lp.error = action.payload;
    },

    // Analyst Dashboard
    analystDashboardRequested: (state) => {
      state.analyst.status = 'loading';
      state.analyst.error = undefined;
    },
    analystDashboardLoaded: (state, action: PayloadAction<AnalystDashboardData>) => {
      state.analyst.data = action.payload;
      state.analyst.status = 'succeeded';
      state.analyst.error = undefined;
    },
    analystDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.analyst.status = 'failed';
      state.analyst.error = action.payload;
    },

    // Ops Dashboard
    opsDashboardRequested: (state) => {
      state.ops.status = 'loading';
      state.ops.error = undefined;
    },
    opsDashboardLoaded: (state, action: PayloadAction<OpsDashboardData>) => {
      state.ops.data = action.payload;
      state.ops.status = 'succeeded';
      state.ops.error = undefined;
    },
    opsDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.ops.status = 'failed';
      state.ops.error = action.payload;
    },

    // Auditor Dashboard
    auditorDashboardRequested: (state) => {
      state.auditor.status = 'loading';
      state.auditor.error = undefined;
    },
    auditorDashboardLoaded: (state, action: PayloadAction<AuditorDashboardData>) => {
      state.auditor.data = action.payload;
      state.auditor.status = 'succeeded';
      state.auditor.error = undefined;
    },
    auditorDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.auditor.status = 'failed';
      state.auditor.error = action.payload;
    },

    // IR Dashboard
    irDashboardRequested: (state) => {
      state.ir.status = 'loading';
      state.ir.error = undefined;
    },
    irDashboardLoaded: (state, action: PayloadAction<IRDashboardData>) => {
      state.ir.data = action.payload;
      state.ir.status = 'succeeded';
      state.ir.error = undefined;
    },
    irDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.ir.status = 'failed';
      state.ir.error = action.payload;
    },

    // Researcher Dashboard
    researcherDashboardRequested: (state) => {
      state.researcher.status = 'loading';
      state.researcher.error = undefined;
    },
    researcherDashboardLoaded: (state, action: PayloadAction<ResearcherDashboardData>) => {
      state.researcher.data = action.payload;
      state.researcher.status = 'succeeded';
      state.researcher.error = undefined;
    },
    researcherDashboardFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.researcher.status = 'failed';
      state.researcher.error = action.payload;
    },
  },
});

export const {
  lpDashboardRequested,
  lpDashboardLoaded,
  lpDashboardFailed,
  analystDashboardRequested,
  analystDashboardLoaded,
  analystDashboardFailed,
  opsDashboardRequested,
  opsDashboardLoaded,
  opsDashboardFailed,
  auditorDashboardRequested,
  auditorDashboardLoaded,
  auditorDashboardFailed,
  irDashboardRequested,
  irDashboardLoaded,
  irDashboardFailed,
  researcherDashboardRequested,
  researcherDashboardLoaded,
  researcherDashboardFailed,
} = dashboardsSlice.actions;

// Selectors for LP dashboard
export const lpDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.lp.data,
  selectStatus: (state: RootState) => state.dashboards.lp.status,
  selectError: (state: RootState) => state.dashboards.lp.error,
  selectIsLoading: (state: RootState) => state.dashboards.lp.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.lp.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.lp.status === 'failed',
  selectState: (state: RootState) => state.dashboards.lp,
};

// Selectors for analyst dashboard
export const analystDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.analyst.data,
  selectStatus: (state: RootState) => state.dashboards.analyst.status,
  selectError: (state: RootState) => state.dashboards.analyst.error,
  selectIsLoading: (state: RootState) => state.dashboards.analyst.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.analyst.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.analyst.status === 'failed',
  selectState: (state: RootState) => state.dashboards.analyst,
};

// Selectors for ops dashboard
export const opsDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.ops.data,
  selectStatus: (state: RootState) => state.dashboards.ops.status,
  selectError: (state: RootState) => state.dashboards.ops.error,
  selectIsLoading: (state: RootState) => state.dashboards.ops.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.ops.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.ops.status === 'failed',
  selectState: (state: RootState) => state.dashboards.ops,
};

// Selectors for auditor dashboard
export const auditorDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.auditor.data,
  selectStatus: (state: RootState) => state.dashboards.auditor.status,
  selectError: (state: RootState) => state.dashboards.auditor.error,
  selectIsLoading: (state: RootState) => state.dashboards.auditor.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.auditor.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.auditor.status === 'failed',
  selectState: (state: RootState) => state.dashboards.auditor,
};

// Selectors for IR dashboard
export const irDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.ir.data,
  selectStatus: (state: RootState) => state.dashboards.ir.status,
  selectError: (state: RootState) => state.dashboards.ir.error,
  selectIsLoading: (state: RootState) => state.dashboards.ir.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.ir.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.ir.status === 'failed',
  selectState: (state: RootState) => state.dashboards.ir,
};

// Selectors for researcher dashboard
export const researcherDashboardSelectors = {
  selectData: (state: RootState) => state.dashboards.researcher.data,
  selectStatus: (state: RootState) => state.dashboards.researcher.status,
  selectError: (state: RootState) => state.dashboards.researcher.error,
  selectIsLoading: (state: RootState) => state.dashboards.researcher.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.dashboards.researcher.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.dashboards.researcher.status === 'failed',
  selectState: (state: RootState) => state.dashboards.researcher,
};

export const dashboardsReducer = dashboardsSlice.reducer;
