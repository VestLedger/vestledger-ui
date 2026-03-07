import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import type { RootState } from '../rootReducer';
import type { LucideIcon } from 'lucide-react';
import type { PendingCapitalCall, PendingSignature } from '@/data/mocks/dashboards/lp-dashboard';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export interface LPDashboardDocument {
  name: string;
  type: string;
  date: string;
}

export interface LPDashboardCapitalActivity {
  type: string;
  amount: string;
  date: string;
  status: string;
}

export interface AnalystRecentDeal {
  name: string;
  stage: string;
  score: number;
  sector: string;
}

export interface AnalystUrgentTask {
  task: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface OpsComplianceAlert {
  title: string;
  fund: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface OpsUpcomingDistribution {
  event: string;
  date: string;
  amount: string;
  status: string;
}

export interface AuditorAuditTrail {
  action: string;
  fund: string;
  date: string;
  hash: string;
}

export interface AuditorComplianceItem {
  item: string;
  status: string;
  lastCheck: string;
}

export interface IRRecentInteraction {
  lp: string;
  type: string;
  date: string;
  notes: string;
}

export interface IRUpcomingTask {
  task: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ResearcherRecentReport {
  name: string;
  type: string;
  date: string;
  status: string;
}

export interface ResearcherTrendingTopic {
  topic: string;
  sentiment: string;
  change: string;
}

// Define types for each dashboard's data
export interface LPDashboardData {
  metrics: DashboardMetric[];
  documents: LPDashboardDocument[];
  capitalActivity: LPDashboardCapitalActivity[];
  pendingCalls: PendingCapitalCall[];
  pendingSignatures: PendingSignature[];
  commitment: {
    totalCommitment: number;
    calledAmount: number;
  };
}

export interface AnalystDashboardData {
  metrics: DashboardMetric[];
  recentDeals: AnalystRecentDeal[];
  urgentTasks: AnalystUrgentTask[];
}

export interface OpsDashboardData {
  metrics: DashboardMetric[];
  complianceAlerts: OpsComplianceAlert[];
  upcomingDistributions: OpsUpcomingDistribution[];
}

export interface AuditorDashboardData {
  metrics: DashboardMetric[];
  auditTrail: AuditorAuditTrail[];
  complianceItems: AuditorComplianceItem[];
}

export interface IRDashboardData {
  metrics: DashboardMetric[];
  recentInteractions: IRRecentInteraction[];
  upcomingTasks: IRUpcomingTask[];
}

export interface ResearcherDashboardData {
  metrics: DashboardMetric[];
  recentReports: ResearcherRecentReport[];
  trendingTopics: ResearcherTrendingTopic[];
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
  lpDashboardLoaded,
  lpDashboardFailed,
  analystDashboardLoaded,
  analystDashboardFailed,
  opsDashboardLoaded,
  opsDashboardFailed,
  auditorDashboardLoaded,
  auditorDashboardFailed,
  irDashboardLoaded,
  irDashboardFailed,
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
