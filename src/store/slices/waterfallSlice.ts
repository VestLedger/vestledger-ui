/**
 * Waterfall Slice
 *
 * Redux state management for waterfall scenarios and calculations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncState, NormalizedError } from '@/store/types/AsyncState';
import { createInitialAsyncState } from '@/store/types/AsyncState';
import { createAsyncSelectors } from '@/store/utils/createAsyncSelectors';
import type {
  WaterfallScenario,
  WaterfallResults,
  WaterfallTemplate,
  SensitivityAnalysis,
} from '@/types/waterfall';
import type { RootState } from '@/store/rootReducer';
import type { GetWaterfallScenariosParams } from '@/services/analytics/waterfallService';

// ============================================================================
// State Shape
// ============================================================================

export interface WaterfallScenariosData {
  scenarios: WaterfallScenario[];
}

export interface WaterfallTemplatesData {
  templates: WaterfallTemplate[];
}

export interface WaterfallCalculationData {
  results: WaterfallResults;
}

export interface SensitivityAnalysisData {
  analysis: SensitivityAnalysis;
}

interface WaterfallState {
  // Scenarios list
  scenarios: AsyncState<WaterfallScenariosData>;

  // Templates
  templates: AsyncState<WaterfallTemplatesData>;

  // Current calculation results
  calculation: AsyncState<WaterfallCalculationData>;

  // Sensitivity analysis
  sensitivityAnalysis: AsyncState<SensitivityAnalysisData>;

  // UI state
  selectedScenarioId: string | null;
  comparisonScenarioIds: string[];
}

const initialState: WaterfallState = {
  scenarios: createInitialAsyncState<WaterfallScenariosData>(),
  templates: createInitialAsyncState<WaterfallTemplatesData>(),
  calculation: createInitialAsyncState<WaterfallCalculationData>(),
  sensitivityAnalysis: createInitialAsyncState<SensitivityAnalysisData>(),
  selectedScenarioId: null,
  comparisonScenarioIds: [],
};

// ============================================================================
// Slice Definition
// ============================================================================

const waterfallSlice = createSlice({
  name: 'waterfall',
  initialState,
  reducers: {
    // Scenarios
    scenariosRequested: (state, _action: PayloadAction<GetWaterfallScenariosParams | undefined>) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    scenariosLoaded: (state, action: PayloadAction<WaterfallScenariosData>) => {
      state.scenarios.data = action.payload;
      state.scenarios.status = 'succeeded';
      state.scenarios.error = undefined;
    },
    scenariosFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.status = 'failed';
      state.scenarios.error = action.payload;
    },

    // Single scenario
    scenarioRequested: (state, _action: PayloadAction<string>) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    scenarioUpdated: (state, action: PayloadAction<WaterfallScenario>) => {
      if (state.scenarios.data?.scenarios) {
        const index = state.scenarios.data.scenarios.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.scenarios.data.scenarios[index] = action.payload;
        } else {
          state.scenarios.data.scenarios.push(action.payload);
        }
      }
      state.scenarios.status = 'succeeded';
    },
    scenarioDeleted: (state, action: PayloadAction<string>) => {
      if (state.scenarios.data?.scenarios) {
        state.scenarios.data.scenarios = state.scenarios.data.scenarios.filter(
          (s) => s.id !== action.payload
        );
      }
      if (state.selectedScenarioId === action.payload) {
        state.selectedScenarioId = null;
      }
      state.comparisonScenarioIds = state.comparisonScenarioIds.filter(
        (id) => id !== action.payload
      );
    },

    // Create scenario
    createScenarioRequested: (
      state,
      _action: PayloadAction<Omit<WaterfallScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
    ) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    createScenarioSucceeded: (state, action: PayloadAction<WaterfallScenario>) => {
      if (!state.scenarios.data) {
        state.scenarios.data = { scenarios: [] };
      }
      state.scenarios.data.scenarios.push(action.payload);
      state.scenarios.status = 'succeeded';
    },
    createScenarioFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.status = 'failed';
      state.scenarios.error = action.payload;
    },

    // Update scenario
    updateScenarioRequested: (
      state,
      _action: PayloadAction<{ id: string; data: Partial<WaterfallScenario> }>
    ) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    updateScenarioSucceeded: (state, action: PayloadAction<WaterfallScenario>) => {
      if (state.scenarios.data?.scenarios) {
        const index = state.scenarios.data.scenarios.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.scenarios.data.scenarios[index] = action.payload;
        }
      }
      state.scenarios.status = 'succeeded';
    },
    updateScenarioFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.status = 'failed';
      state.scenarios.error = action.payload;
    },

    // Delete scenario
    deleteScenarioRequested: (state, _action: PayloadAction<string>) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    deleteScenarioSucceeded: (state, action: PayloadAction<string>) => {
      if (state.scenarios.data?.scenarios) {
        state.scenarios.data.scenarios = state.scenarios.data.scenarios.filter(
          (s) => s.id !== action.payload
        );
      }
      if (state.selectedScenarioId === action.payload) {
        state.selectedScenarioId = null;
      }
      state.comparisonScenarioIds = state.comparisonScenarioIds.filter(
        (id) => id !== action.payload
      );
      state.scenarios.status = 'succeeded';
    },
    deleteScenarioFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.status = 'failed';
      state.scenarios.error = action.payload;
    },

    // Duplicate scenario
    duplicateScenarioRequested: (
      state,
      _action: PayloadAction<{ id: string; newName?: string }>
    ) => {
      state.scenarios.status = 'loading';
      state.scenarios.error = undefined;
    },
    duplicateScenarioSucceeded: (state, action: PayloadAction<WaterfallScenario>) => {
      if (!state.scenarios.data) {
        state.scenarios.data = { scenarios: [] };
      }
      state.scenarios.data.scenarios.push(action.payload);
      state.scenarios.status = 'succeeded';
    },
    duplicateScenarioFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.status = 'failed';
      state.scenarios.error = action.payload;
    },

    // Templates
    templatesRequested: (state) => {
      state.templates.status = 'loading';
      state.templates.error = undefined;
    },
    templatesLoaded: (state, action: PayloadAction<WaterfallTemplatesData>) => {
      state.templates.data = action.payload;
      state.templates.status = 'succeeded';
      state.templates.error = undefined;
    },
    templatesFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.templates.status = 'failed';
      state.templates.error = action.payload;
    },

    // Calculation
    calculateWaterfallRequested: (
      state,
      _action: PayloadAction<{ scenarioId?: string; scenario?: WaterfallScenario }>
    ) => {
      state.calculation.status = 'loading';
      state.calculation.error = undefined;
    },
    calculateWaterfallSucceeded: (state, action: PayloadAction<WaterfallCalculationData>) => {
      state.calculation.data = action.payload;
      state.calculation.status = 'succeeded';
      state.calculation.error = undefined;
    },
    calculateWaterfallFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.calculation.status = 'failed';
      state.calculation.error = action.payload;
    },

    // Sensitivity Analysis
    sensitivityAnalysisRequested: (
      state,
      _action: PayloadAction<{
        scenarioId: string;
        minExitValue: number;
        maxExitValue: number;
        steps?: number;
      }>
    ) => {
      state.sensitivityAnalysis.status = 'loading';
      state.sensitivityAnalysis.error = undefined;
    },
    sensitivityAnalysisSucceeded: (state, action: PayloadAction<SensitivityAnalysisData>) => {
      state.sensitivityAnalysis.data = action.payload;
      state.sensitivityAnalysis.status = 'succeeded';
      state.sensitivityAnalysis.error = undefined;
    },
    sensitivityAnalysisFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.sensitivityAnalysis.status = 'failed';
      state.sensitivityAnalysis.error = action.payload;
    },

    // Toggle favorite
    toggleFavoriteRequested: (_state, _action: PayloadAction<string>) => {
      // Optimistic update can happen here or wait for success
    },
    toggleFavoriteSucceeded: (state, action: PayloadAction<WaterfallScenario>) => {
      if (state.scenarios.data?.scenarios) {
        const index = state.scenarios.data.scenarios.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.scenarios.data.scenarios[index] = action.payload;
        }
      }
    },
    toggleFavoriteFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.scenarios.error = action.payload;
    },

    // UI state
    setSelectedScenario: (state, action: PayloadAction<string | null>) => {
      state.selectedScenarioId = action.payload;
    },
    addComparisonScenario: (state, action: PayloadAction<string>) => {
      if (!state.comparisonScenarioIds.includes(action.payload)) {
        state.comparisonScenarioIds.push(action.payload);
      }
    },
    removeComparisonScenario: (state, action: PayloadAction<string>) => {
      state.comparisonScenarioIds = state.comparisonScenarioIds.filter(
        (id) => id !== action.payload
      );
    },
    clearComparisonScenarios: (state) => {
      state.comparisonScenarioIds = [];
    },
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  scenariosRequested,
  scenariosLoaded,
  scenariosFailed,
  scenarioRequested,
  scenarioUpdated,
  scenarioDeleted,
  createScenarioRequested,
  createScenarioSucceeded,
  createScenarioFailed,
  updateScenarioRequested,
  updateScenarioSucceeded,
  updateScenarioFailed,
  deleteScenarioRequested,
  deleteScenarioSucceeded,
  deleteScenarioFailed,
  duplicateScenarioRequested,
  duplicateScenarioSucceeded,
  duplicateScenarioFailed,
  templatesRequested,
  templatesLoaded,
  templatesFailed,
  calculateWaterfallRequested,
  calculateWaterfallSucceeded,
  calculateWaterfallFailed,
  sensitivityAnalysisRequested,
  sensitivityAnalysisSucceeded,
  sensitivityAnalysisFailed,
  toggleFavoriteRequested,
  toggleFavoriteSucceeded,
  toggleFavoriteFailed,
  setSelectedScenario,
  addComparisonScenario,
  removeComparisonScenario,
  clearComparisonScenarios,
} = waterfallSlice.actions;

// Centralized selectors (custom because of nested AsyncState)
export const scenariosSelectors = createAsyncSelectors<WaterfallScenariosData>(
  (state) => state.waterfall.scenarios
);

export const templatesSelectors = createAsyncSelectors<WaterfallTemplatesData>(
  (state) => state.waterfall.templates
);

export const calculationSelectors = createAsyncSelectors<WaterfallCalculationData>(
  (state) => state.waterfall.calculation
);

export const sensitivitySelectors = createAsyncSelectors<SensitivityAnalysisData>(
  (state) => state.waterfall.sensitivityAnalysis
);

// Custom selectors
export const waterfallUISelectors = {
  selectSelectedScenarioId: (state: RootState) => state.waterfall?.selectedScenarioId || null,
  selectSelectedScenario: (state: RootState): WaterfallScenario | null => {
    const scenarioId = state.waterfall?.selectedScenarioId;
    const scenarios = state.waterfall?.scenarios.data?.scenarios || [];
    return scenarios.find((s) => s.id === scenarioId) || null;
  },
  selectComparisonScenarioIds: (state: RootState) => state.waterfall?.comparisonScenarioIds || [],
  selectComparisonScenarios: (state: RootState): WaterfallScenario[] => {
    const scenarioIds = state.waterfall?.comparisonScenarioIds || [];
    const scenarios = state.waterfall?.scenarios.data?.scenarios || [];
    return scenarios.filter((s) => scenarioIds.includes(s.id));
  },
  selectFavoriteScenarios: (state: RootState): WaterfallScenario[] => {
    const scenarios = state.waterfall?.scenarios.data?.scenarios || [];
    return scenarios.filter((s) => s.isFavorite);
  },
};

export const waterfallReducer = waterfallSlice.reducer;
