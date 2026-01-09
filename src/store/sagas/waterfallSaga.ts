/**
 * Waterfall Saga
 *
 * Side effects for waterfall scenarios and calculations
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WaterfallScenario, WaterfallResults, SensitivityAnalysis } from '@/types/waterfall';
import {
  scenariosRequested,
  scenariosLoaded,
  scenariosFailed,
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
} from '@/store/slices/waterfallSlice';
import type { GetWaterfallScenariosParams } from '@/services/analytics/waterfallService';
import {
  fetchWaterfallScenarios,
  createWaterfallScenario,
  updateWaterfallScenario,
  deleteWaterfallScenario,
  duplicateWaterfallScenario,
  fetchWaterfallTemplates,
  performWaterfallCalculation,
  performSensitivityAnalysis,
  toggleScenarioFavorite,
} from '@/services/analytics/waterfallService';
import { normalizeError } from '@/store/utils/normalizeError';

// ============================================================================
// Scenarios Workers
// ============================================================================

function* loadScenariosWorker(
  action: PayloadAction<GetWaterfallScenariosParams | undefined>
): SagaIterator {
  try {
    const params = action.payload;
    const scenarios: WaterfallScenario[] = yield call(fetchWaterfallScenarios, params);
    yield put(scenariosLoaded({ scenarios }));
  } catch (error: unknown) {
    console.error('Failed to load waterfall scenarios', error);
    yield put(scenariosFailed(normalizeError(error)));
  }
}

function* createScenarioWorker(
  action: PayloadAction<Omit<WaterfallScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
): SagaIterator {
  try {
    const scenario: WaterfallScenario = yield call(createWaterfallScenario, action.payload);
    yield put(createScenarioSucceeded(scenario));
  } catch (error: unknown) {
    console.error('Failed to create waterfall scenario', error);
    yield put(createScenarioFailed(normalizeError(error)));
  }
}

function* updateScenarioWorker(
  action: PayloadAction<{ id: string; data: Partial<WaterfallScenario> }>
): SagaIterator {
  try {
    const { id, data } = action.payload;
    const scenario: WaterfallScenario = yield call(updateWaterfallScenario, id, data);
    yield put(updateScenarioSucceeded(scenario));
  } catch (error: unknown) {
    console.error('Failed to update waterfall scenario', error);
    yield put(updateScenarioFailed(normalizeError(error)));
  }
}

function* deleteScenarioWorker(action: PayloadAction<string>): SagaIterator {
  try {
    const id = action.payload;
    yield call(deleteWaterfallScenario, id);
    yield put(deleteScenarioSucceeded(id));
  } catch (error: unknown) {
    console.error('Failed to delete waterfall scenario', error);
    yield put(deleteScenarioFailed(normalizeError(error)));
  }
}

function* duplicateScenarioWorker(
  action: PayloadAction<{ id: string; newName?: string }>
): SagaIterator {
  try {
    const { id, newName } = action.payload;
    const scenario: WaterfallScenario = yield call(duplicateWaterfallScenario, id, newName);
    yield put(duplicateScenarioSucceeded(scenario));
  } catch (error: unknown) {
    console.error('Failed to duplicate waterfall scenario', error);
    yield put(duplicateScenarioFailed(normalizeError(error)));
  }
}

// ============================================================================
// Templates Workers
// ============================================================================

function* loadTemplatesWorker(): SagaIterator {
  try {
    const templates = yield call(fetchWaterfallTemplates);
    yield put(templatesLoaded({ templates }));
  } catch (error: unknown) {
    console.error('Failed to load waterfall templates', error);
    yield put(templatesFailed(normalizeError(error)));
  }
}

// ============================================================================
// Calculation Workers
// ============================================================================

function* calculateWaterfallWorker(
  action: PayloadAction<{ scenarioId?: string; scenario?: WaterfallScenario }>
): SagaIterator {
  try {
    const results: WaterfallResults = yield call(performWaterfallCalculation, action.payload);
    yield put(calculateWaterfallSucceeded({ results }));
  } catch (error: unknown) {
    console.error('Failed to calculate waterfall', error);
    yield put(calculateWaterfallFailed(normalizeError(error)));
  }
}

function* sensitivityAnalysisWorker(
  action: PayloadAction<{
    scenarioId: string;
    minExitValue: number;
    maxExitValue: number;
    steps?: number;
  }>
): SagaIterator {
  try {
    const { scenarioId, minExitValue, maxExitValue, steps } = action.payload;
    const analysis: SensitivityAnalysis = yield call(
      performSensitivityAnalysis,
      scenarioId,
      minExitValue,
      maxExitValue,
      steps
    );
    yield put(sensitivityAnalysisSucceeded({ analysis }));
  } catch (error: unknown) {
    console.error('Failed to perform sensitivity analysis', error);
    yield put(sensitivityAnalysisFailed(normalizeError(error)));
  }
}

// ============================================================================
// Favorite Workers
// ============================================================================

function* toggleFavoriteWorker(action: PayloadAction<string>): SagaIterator {
  try {
    const id = action.payload;
    const scenario: WaterfallScenario = yield call(toggleScenarioFavorite, id);
    yield put(toggleFavoriteSucceeded(scenario));
  } catch (error: unknown) {
    console.error('Failed to toggle favorite', error);
    yield put(toggleFavoriteFailed(normalizeError(error)));
  }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* waterfallSaga(): SagaIterator {
  // Scenarios
  yield takeLatest(scenariosRequested.type, loadScenariosWorker);
  yield takeLatest(createScenarioRequested.type, createScenarioWorker);
  yield takeLatest(updateScenarioRequested.type, updateScenarioWorker);
  yield takeLatest(deleteScenarioRequested.type, deleteScenarioWorker);
  yield takeLatest(duplicateScenarioRequested.type, duplicateScenarioWorker);

  // Templates
  yield takeLatest(templatesRequested.type, loadTemplatesWorker);

  // Calculations
  yield takeLatest(calculateWaterfallRequested.type, calculateWaterfallWorker);
  yield takeLatest(sensitivityAnalysisRequested.type, sensitivityAnalysisWorker);

  // Favorites
  yield takeLatest(toggleFavoriteRequested.type, toggleFavoriteWorker);

  // Initial data load (can be triggered from components instead)
  // yield put(scenariosRequested());
  // yield put(templatesRequested());
}
