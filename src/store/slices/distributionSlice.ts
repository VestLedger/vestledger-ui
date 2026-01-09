/**
 * Distribution Slice
 *
 * Redux state management for distribution workflow
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type {
  Distribution,
  DistributionFilters,
  DistributionSummary,
  DistributionCalendarEvent,
  FeeTemplate,
  LPProfile,
  ApprovalRule,
  StatementTemplateConfig,
} from '@/types/distribution';
import type { RootState } from '@/store/rootReducer';

// ============================================================================
// State Shape
// ============================================================================

export interface DistributionsData {
  distributions: Distribution[];
}

export interface DistributionSummaryData {
  summary: DistributionSummary;
}

export interface CalendarEventsData {
  events: DistributionCalendarEvent[];
}

export interface FeeTemplatesData {
  templates: FeeTemplate[];
}

export interface StatementTemplatesData {
  templates: StatementTemplateConfig[];
}

export interface LPProfilesData {
  profiles: LPProfile[];
}

export interface ApprovalRulesData {
  rules: ApprovalRule[];
}

interface DistributionState {
  // Distributions list
  distributions: AsyncState<DistributionsData>;

  // Summary/metrics
  summary: AsyncState<DistributionSummaryData>;

  // Calendar events
  calendarEvents: AsyncState<CalendarEventsData>;

  // Fee templates
  feeTemplates: AsyncState<FeeTemplatesData>;

  // Statement templates
  statementTemplates: AsyncState<StatementTemplatesData>;

  // LP profiles
  lpProfiles: AsyncState<LPProfilesData>;

  // Approval rules
  approvalRules: AsyncState<ApprovalRulesData>;

  // UI state
  selectedDistributionId: string | null;
  currentFilters: DistributionFilters | null;
}

const initialState: DistributionState = {
  distributions: createInitialAsyncState<DistributionsData>(),
  summary: createInitialAsyncState<DistributionSummaryData>(),
  calendarEvents: createInitialAsyncState<CalendarEventsData>(),
  feeTemplates: createInitialAsyncState<FeeTemplatesData>(),
  statementTemplates: createInitialAsyncState<StatementTemplatesData>(),
  lpProfiles: createInitialAsyncState<LPProfilesData>(),
  approvalRules: createInitialAsyncState<ApprovalRulesData>(),
  selectedDistributionId: null,
  currentFilters: null,
};

// ============================================================================
// Slice Definition
// ============================================================================

const distributionSlice = createSlice({
  name: 'distribution',
  initialState,
  reducers: {
    // Distributions list
    distributionsRequested: (state, _action: PayloadAction<DistributionFilters | undefined>) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    distributionsLoaded: (state, action: PayloadAction<DistributionsData>) => {
      state.distributions.data = action.payload;
      state.distributions.status = 'succeeded';
      state.distributions.error = undefined;
    },
    distributionsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    // Single distribution
    distributionRequested: (state, _action: PayloadAction<string>) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    distributionUpdated: (state, action: PayloadAction<Distribution>) => {
      if (state.distributions.data?.distributions) {
        const index = state.distributions.data.distributions.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.distributions.data.distributions[index] = action.payload;
        } else {
          state.distributions.data.distributions.push(action.payload);
        }
      }
      state.distributions.status = 'succeeded';
    },

    // Create distribution
    createDistributionRequested: (state, _action: PayloadAction<Partial<Distribution>>) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    createDistributionSucceeded: (state, action: PayloadAction<Distribution>) => {
      if (!state.distributions.data) {
        state.distributions.data = { distributions: [] };
      }
      state.distributions.data.distributions.push(action.payload);
      state.distributions.status = 'succeeded';
    },
    createDistributionFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    // Update distribution
    updateDistributionRequested: (
      state,
      _action: PayloadAction<{ id: string; data: Partial<Distribution> }>
    ) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    updateDistributionSucceeded: (state, action: PayloadAction<Distribution>) => {
      if (state.distributions.data?.distributions) {
        const index = state.distributions.data.distributions.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.distributions.data.distributions[index] = action.payload;
        }
      }
      state.distributions.status = 'succeeded';
    },
    updateDistributionFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    // Delete distribution
    deleteDistributionRequested: (state, _action: PayloadAction<string>) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    deleteDistributionSucceeded: (state, action: PayloadAction<string>) => {
      if (state.distributions.data?.distributions) {
        state.distributions.data.distributions = state.distributions.data.distributions.filter(
          (d) => d.id !== action.payload
        );
      }
      if (state.selectedDistributionId === action.payload) {
        state.selectedDistributionId = null;
      }
      state.distributions.status = 'succeeded';
    },
    deleteDistributionFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    // Approval workflow
    submitForApprovalRequested: (
      state,
      _action: PayloadAction<{ distributionId: string; comment?: string }>
    ) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    submitForApprovalSucceeded: (state, action: PayloadAction<Distribution>) => {
      if (state.distributions.data?.distributions) {
        const index = state.distributions.data.distributions.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.distributions.data.distributions[index] = action.payload;
        }
      }
      state.distributions.status = 'succeeded';
    },
    submitForApprovalFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    approveDistributionRequested: (
      state,
      _action: PayloadAction<{ distributionId: string; approverId: string; comment?: string }>
    ) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    approveDistributionSucceeded: (state, action: PayloadAction<Distribution>) => {
      if (state.distributions.data?.distributions) {
        const index = state.distributions.data.distributions.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.distributions.data.distributions[index] = action.payload;
        }
      }
      state.distributions.status = 'succeeded';
    },
    approveDistributionFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    rejectDistributionRequested: (
      state,
      _action: PayloadAction<{ distributionId: string; approverId: string; reason: string }>
    ) => {
      state.distributions.status = 'loading';
      state.distributions.error = undefined;
    },
    rejectDistributionSucceeded: (state, action: PayloadAction<Distribution>) => {
      if (state.distributions.data?.distributions) {
        const index = state.distributions.data.distributions.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.distributions.data.distributions[index] = action.payload;
        }
      }
      state.distributions.status = 'succeeded';
    },
    rejectDistributionFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.distributions.status = 'failed';
      state.distributions.error = action.payload;
    },

    // Summary
    summaryRequested: (state) => {
      state.summary.status = 'loading';
      state.summary.error = undefined;
    },
    summaryLoaded: (state, action: PayloadAction<DistributionSummaryData>) => {
      state.summary.data = action.payload;
      state.summary.status = 'succeeded';
      state.summary.error = undefined;
    },
    summaryFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.summary.status = 'failed';
      state.summary.error = action.payload;
    },

    // Calendar events
    calendarEventsRequested: (
      state,
      _action: PayloadAction<{ startDate?: string; endDate?: string } | undefined>
    ) => {
      state.calendarEvents.status = 'loading';
      state.calendarEvents.error = undefined;
    },
    calendarEventsLoaded: (state, action: PayloadAction<CalendarEventsData>) => {
      state.calendarEvents.data = action.payload;
      state.calendarEvents.status = 'succeeded';
      state.calendarEvents.error = undefined;
    },
    calendarEventsFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.calendarEvents.status = 'failed';
      state.calendarEvents.error = action.payload;
    },

    // Fee templates
    feeTemplatesRequested: (state, _action: PayloadAction<string | undefined>) => {
      state.feeTemplates.status = 'loading';
      state.feeTemplates.error = undefined;
    },
    feeTemplatesLoaded: (state, action: PayloadAction<FeeTemplatesData>) => {
      state.feeTemplates.data = action.payload;
      state.feeTemplates.status = 'succeeded';
      state.feeTemplates.error = undefined;
    },
    feeTemplatesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.feeTemplates.status = 'failed';
      state.feeTemplates.error = action.payload;
    },

    // Statement templates
    statementTemplatesRequested: (state) => {
      state.statementTemplates.status = 'loading';
      state.statementTemplates.error = undefined;
    },
    statementTemplatesLoaded: (state, action: PayloadAction<StatementTemplatesData>) => {
      state.statementTemplates.data = action.payload;
      state.statementTemplates.status = 'succeeded';
      state.statementTemplates.error = undefined;
    },
    statementTemplatesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.statementTemplates.status = 'failed';
      state.statementTemplates.error = action.payload;
    },

    // LP profiles
    lpProfilesRequested: (state) => {
      state.lpProfiles.status = 'loading';
      state.lpProfiles.error = undefined;
    },
    lpProfilesLoaded: (state, action: PayloadAction<LPProfilesData>) => {
      state.lpProfiles.data = action.payload;
      state.lpProfiles.status = 'succeeded';
      state.lpProfiles.error = undefined;
    },
    lpProfilesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.lpProfiles.status = 'failed';
      state.lpProfiles.error = action.payload;
    },

    // Approval rules
    approvalRulesRequested: (state) => {
      state.approvalRules.status = 'loading';
      state.approvalRules.error = undefined;
    },
    approvalRulesLoaded: (state, action: PayloadAction<ApprovalRulesData>) => {
      state.approvalRules.data = action.payload;
      state.approvalRules.status = 'succeeded';
      state.approvalRules.error = undefined;
    },
    approvalRulesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.approvalRules.status = 'failed';
      state.approvalRules.error = action.payload;
    },

    // UI state
    setSelectedDistribution: (state, action: PayloadAction<string | null>) => {
      state.selectedDistributionId = action.payload;
    },
    setFilters: (state, action: PayloadAction<DistributionFilters | null>) => {
      state.currentFilters = action.payload;
    },
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  distributionsRequested,
  distributionsLoaded,
  distributionsFailed,
  distributionRequested,
  distributionUpdated,
  createDistributionRequested,
  createDistributionSucceeded,
  createDistributionFailed,
  updateDistributionRequested,
  updateDistributionSucceeded,
  updateDistributionFailed,
  deleteDistributionRequested,
  deleteDistributionSucceeded,
  deleteDistributionFailed,
  submitForApprovalRequested,
  submitForApprovalSucceeded,
  submitForApprovalFailed,
  approveDistributionRequested,
  approveDistributionSucceeded,
  approveDistributionFailed,
  rejectDistributionRequested,
  rejectDistributionSucceeded,
  rejectDistributionFailed,
  summaryRequested,
  summaryLoaded,
  summaryFailed,
  calendarEventsRequested,
  calendarEventsLoaded,
  calendarEventsFailed,
  feeTemplatesRequested,
  feeTemplatesLoaded,
  feeTemplatesFailed,
  statementTemplatesRequested,
  statementTemplatesLoaded,
  statementTemplatesFailed,
  lpProfilesRequested,
  lpProfilesLoaded,
  lpProfilesFailed,
  approvalRulesRequested,
  approvalRulesLoaded,
  approvalRulesFailed,
  setSelectedDistribution,
  setFilters,
} = distributionSlice.actions;

// Centralized selectors (custom because of nested AsyncState)
export const distributionsSelectors = createAsyncSelectors<DistributionsData>(
  (state) => state.distribution.distributions
);

export const summarySelectors = createAsyncSelectors<DistributionSummaryData>(
  (state) => state.distribution.summary
);

export const calendarEventsSelectors = createAsyncSelectors<CalendarEventsData>(
  (state) => state.distribution.calendarEvents
);

export const feeTemplatesSelectors = createAsyncSelectors<FeeTemplatesData>(
  (state) => state.distribution.feeTemplates
);

export const statementTemplatesSelectors = createAsyncSelectors<StatementTemplatesData>(
  (state) => state.distribution.statementTemplates
);

export const lpProfilesSelectors = createAsyncSelectors<LPProfilesData>(
  (state) => state.distribution.lpProfiles
);

export const approvalRulesSelectors = createAsyncSelectors<ApprovalRulesData>(
  (state) => state.distribution.approvalRules
);

// Custom selectors
export const distributionUISelectors = {
  selectSelectedDistributionId: (state: RootState) => state.distribution?.selectedDistributionId || null,
  selectSelectedDistribution: (state: RootState): Distribution | null => {
    const distributionId = state.distribution?.selectedDistributionId;
    const distributions = state.distribution?.distributions.data?.distributions || [];
    return distributions.find((d) => d.id === distributionId) || null;
  },
  selectCurrentFilters: (state: RootState) => state.distribution?.currentFilters || null,
  selectPendingApprovals: (state: RootState): Distribution[] => {
    const distributions = state.distribution?.distributions.data?.distributions || [];
    return distributions.filter((d) => d.status === 'pending-approval');
  },
  selectDrafts: (state: RootState): Distribution[] => {
    const distributions = state.distribution?.distributions.data?.distributions || [];
    return distributions.filter((d) => d.isDraft);
  },
};

export const distributionReducer = distributionSlice.reducer;
