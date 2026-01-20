import { describe, it, expect } from 'vitest';
import {
  waterfallReducer,
  scenariosRequested,
  scenariosLoaded,
  scenariosFailed,
  scenarioUpdated,
  scenarioDeleted,
  createScenarioSucceeded,
  deleteScenarioSucceeded,
  duplicateScenarioSucceeded,
  templatesRequested,
  templatesLoaded,
  templatesFailed,
  calculateWaterfallRequested,
  calculateWaterfallSucceeded,
  calculateWaterfallFailed,
  sensitivityAnalysisRequested,
  sensitivityAnalysisSucceeded,
  sensitivityAnalysisFailed,
  toggleFavoriteSucceeded,
  setSelectedScenario,
  addComparisonScenario,
  removeComparisonScenario,
  clearComparisonScenarios,
  type WaterfallScenariosData,
  type WaterfallTemplatesData,
  type WaterfallCalculationData,
  type SensitivityAnalysisData,
} from '../waterfallSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { WaterfallScenario, WaterfallTemplate } from '@/types/waterfall';

describe('waterfallSlice', () => {
  const mockScenario: WaterfallScenario = {
    id: 'scenario-1',
    name: 'Base Case',
    description: 'Base case scenario',
    fundId: 'fund-1',
    fundName: 'Test Fund',
    model: 'european',
    isFavorite: false,
    isTemplate: false,
    investorClasses: [],
    tiers: [],
    exitValue: 100000000,
    totalInvested: 50000000,
    managementFees: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    version: 1,
    createdBy: 'user-1',
  };

  const mockTemplate: WaterfallTemplate = {
    id: 'template-1',
    name: 'Standard Template',
    description: 'Standard waterfall template',
    model: 'european',
    tiers: [],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const initialState = {
    scenarios: {
      data: null as WaterfallScenariosData | null,
      status: 'idle' as const,
      error: undefined,
    },
    templates: {
      data: null as WaterfallTemplatesData | null,
      status: 'idle' as const,
      error: undefined,
    },
    calculation: {
      data: null as WaterfallCalculationData | null,
      status: 'idle' as const,
      error: undefined,
    },
    sensitivityAnalysis: {
      data: null as SensitivityAnalysisData | null,
      status: 'idle' as const,
      error: undefined,
    },
    selectedScenarioId: null as string | null,
    comparisonScenarioIds: [] as string[],
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = waterfallReducer(undefined, { type: '@@INIT' });
      expect(state.scenarios.status).toBe('idle');
      expect(state.scenarios.data).toBeNull();
      expect(state.templates.status).toBe('idle');
      expect(state.calculation.status).toBe('idle');
      expect(state.sensitivityAnalysis.status).toBe('idle');
      expect(state.selectedScenarioId).toBeNull();
      expect(state.comparisonScenarioIds).toEqual([]);
    });
  });

  describe('scenarios', () => {
    it('scenariosRequested should set status to loading', () => {
      const state = waterfallReducer(initialState, scenariosRequested({}));
      expect(state.scenarios.status).toBe('loading');
      expect(state.scenarios.error).toBeUndefined();
    });

    it('scenariosLoaded should set scenarios data', () => {
      const loadingState = {
        ...initialState,
        scenarios: { ...initialState.scenarios, status: 'loading' as const },
      };
      const data: WaterfallScenariosData = { scenarios: [mockScenario] };
      const state = waterfallReducer(loadingState, scenariosLoaded(data));
      expect(state.scenarios.status).toBe('succeeded');
      expect(state.scenarios.data?.scenarios).toEqual([mockScenario]);
    });

    it('scenariosFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load scenarios' };
      const loadingState = {
        ...initialState,
        scenarios: { ...initialState.scenarios, status: 'loading' as const },
      };
      const state = waterfallReducer(loadingState, scenariosFailed(error));
      expect(state.scenarios.status).toBe('failed');
      expect(state.scenarios.error).toEqual(error);
    });

    it('scenarioUpdated should update existing scenario', () => {
      const stateWithScenarios = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'succeeded' as const,
        },
      };
      const updatedScenario = { ...mockScenario, name: 'Updated Name' };
      const state = waterfallReducer(stateWithScenarios, scenarioUpdated(updatedScenario));
      expect(state.scenarios.data?.scenarios[0]?.name).toBe('Updated Name');
    });

    it('scenarioUpdated should add new scenario if not found', () => {
      const stateWithScenarios = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'succeeded' as const,
        },
      };
      const newScenario = { ...mockScenario, id: 'scenario-2', name: 'New Scenario' };
      const state = waterfallReducer(stateWithScenarios, scenarioUpdated(newScenario));
      expect(state.scenarios.data?.scenarios).toHaveLength(2);
    });

    it('scenarioDeleted should remove scenario and clear selection', () => {
      const stateWithSelection = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'succeeded' as const,
        },
        selectedScenarioId: 'scenario-1',
        comparisonScenarioIds: ['scenario-1'],
      };
      const state = waterfallReducer(stateWithSelection, scenarioDeleted('scenario-1'));
      expect(state.scenarios.data?.scenarios).toHaveLength(0);
      expect(state.selectedScenarioId).toBeNull();
      expect(state.comparisonScenarioIds).toEqual([]);
    });

    it('createScenarioSucceeded should add new scenario', () => {
      const state = waterfallReducer(initialState, createScenarioSucceeded(mockScenario));
      expect(state.scenarios.data?.scenarios).toEqual([mockScenario]);
      expect(state.scenarios.status).toBe('succeeded');
    });

    it('deleteScenarioSucceeded should remove scenario', () => {
      const stateWithScenarios = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'loading' as const,
        },
      };
      const state = waterfallReducer(stateWithScenarios, deleteScenarioSucceeded('scenario-1'));
      expect(state.scenarios.data?.scenarios).toHaveLength(0);
      expect(state.scenarios.status).toBe('succeeded');
    });

    it('duplicateScenarioSucceeded should add duplicated scenario', () => {
      const stateWithScenarios = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'loading' as const,
        },
      };
      const duplicatedScenario = { ...mockScenario, id: 'scenario-2', name: 'Copy of Base Case' };
      const state = waterfallReducer(stateWithScenarios, duplicateScenarioSucceeded(duplicatedScenario));
      expect(state.scenarios.data?.scenarios).toHaveLength(2);
    });
  });

  describe('templates', () => {
    it('templatesRequested should set status to loading', () => {
      const state = waterfallReducer(initialState, templatesRequested());
      expect(state.templates.status).toBe('loading');
    });

    it('templatesLoaded should set templates data', () => {
      const loadingState = {
        ...initialState,
        templates: { ...initialState.templates, status: 'loading' as const },
      };
      const data: WaterfallTemplatesData = { templates: [mockTemplate] };
      const state = waterfallReducer(loadingState, templatesLoaded(data));
      expect(state.templates.status).toBe('succeeded');
      expect(state.templates.data?.templates).toEqual([mockTemplate]);
    });

    it('templatesFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load templates' };
      const state = waterfallReducer(initialState, templatesFailed(error));
      expect(state.templates.status).toBe('failed');
      expect(state.templates.error).toEqual(error);
    });
  });

  describe('calculation', () => {
    it('calculateWaterfallRequested should set status to loading', () => {
      const state = waterfallReducer(
        initialState,
        calculateWaterfallRequested({ scenarioId: 'scenario-1' })
      );
      expect(state.calculation.status).toBe('loading');
    });

    it('calculateWaterfallSucceeded should set calculation results', () => {
      const results: WaterfallCalculationData = {
        results: {
          scenarioId: 'scenario-1',
          exitValue: 100000000,
          totalDistributed: 100000000,
          participantResults: [],
          tierResults: [],
          summary: {
            totalExitValue: 100000000,
            totalDistributed: 100000000,
            remainingValue: 0,
          },
        },
      };
      const state = waterfallReducer(initialState, calculateWaterfallSucceeded(results));
      expect(state.calculation.status).toBe('succeeded');
      expect(state.calculation.data).toEqual(results);
    });

    it('calculateWaterfallFailed should set error', () => {
      const error: NormalizedError = { message: 'Calculation failed' };
      const state = waterfallReducer(initialState, calculateWaterfallFailed(error));
      expect(state.calculation.status).toBe('failed');
      expect(state.calculation.error).toEqual(error);
    });
  });

  describe('sensitivity analysis', () => {
    it('sensitivityAnalysisRequested should set status to loading', () => {
      const state = waterfallReducer(
        initialState,
        sensitivityAnalysisRequested({
          scenarioId: 'scenario-1',
          minExitValue: 50000000,
          maxExitValue: 150000000,
        })
      );
      expect(state.sensitivityAnalysis.status).toBe('loading');
    });

    it('sensitivityAnalysisSucceeded should set analysis data', () => {
      const data: SensitivityAnalysisData = {
        analysis: {
          scenarioId: 'scenario-1',
          dataPoints: [],
          minExitValue: 50000000,
          maxExitValue: 150000000,
        },
      };
      const state = waterfallReducer(initialState, sensitivityAnalysisSucceeded(data));
      expect(state.sensitivityAnalysis.status).toBe('succeeded');
      expect(state.sensitivityAnalysis.data).toEqual(data);
    });

    it('sensitivityAnalysisFailed should set error', () => {
      const error: NormalizedError = { message: 'Analysis failed' };
      const state = waterfallReducer(initialState, sensitivityAnalysisFailed(error));
      expect(state.sensitivityAnalysis.status).toBe('failed');
      expect(state.sensitivityAnalysis.error).toEqual(error);
    });
  });

  describe('favorites', () => {
    it('toggleFavoriteSucceeded should update scenario favorite status', () => {
      const stateWithScenarios = {
        ...initialState,
        scenarios: {
          ...initialState.scenarios,
          data: { scenarios: [mockScenario] },
          status: 'succeeded' as const,
        },
      };
      const favoritedScenario = { ...mockScenario, isFavorite: true };
      const state = waterfallReducer(stateWithScenarios, toggleFavoriteSucceeded(favoritedScenario));
      expect(state.scenarios.data?.scenarios[0]?.isFavorite).toBe(true);
    });
  });

  describe('UI state', () => {
    it('setSelectedScenario should set selected scenario id', () => {
      const state = waterfallReducer(initialState, setSelectedScenario('scenario-1'));
      expect(state.selectedScenarioId).toBe('scenario-1');
    });

    it('setSelectedScenario should allow null', () => {
      const stateWithSelection = {
        ...initialState,
        selectedScenarioId: 'scenario-1',
      };
      const state = waterfallReducer(stateWithSelection, setSelectedScenario(null));
      expect(state.selectedScenarioId).toBeNull();
    });

    it('addComparisonScenario should add scenario id to comparison list', () => {
      const state = waterfallReducer(initialState, addComparisonScenario('scenario-1'));
      expect(state.comparisonScenarioIds).toEqual(['scenario-1']);
    });

    it('addComparisonScenario should not add duplicate', () => {
      const stateWithComparison = {
        ...initialState,
        comparisonScenarioIds: ['scenario-1'],
      };
      const state = waterfallReducer(stateWithComparison, addComparisonScenario('scenario-1'));
      expect(state.comparisonScenarioIds).toEqual(['scenario-1']);
    });

    it('removeComparisonScenario should remove scenario id', () => {
      const stateWithComparison = {
        ...initialState,
        comparisonScenarioIds: ['scenario-1', 'scenario-2'],
      };
      const state = waterfallReducer(stateWithComparison, removeComparisonScenario('scenario-1'));
      expect(state.comparisonScenarioIds).toEqual(['scenario-2']);
    });

    it('clearComparisonScenarios should clear all comparisons', () => {
      const stateWithComparisons = {
        ...initialState,
        comparisonScenarioIds: ['scenario-1', 'scenario-2'],
      };
      const state = waterfallReducer(stateWithComparisons, clearComparisonScenarios());
      expect(state.comparisonScenarioIds).toEqual([]);
    });
  });
});
