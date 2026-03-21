import type {
  WaterfallScenario,
  WaterfallResults,
  SensitivityAnalysis,
} from "@/types/waterfall";
import type { GetWaterfallScenariosParams } from "@/services/analytics/waterfallService";
import {
  calculateWaterfallFailed,
  calculateWaterfallSucceeded,
  createScenarioFailed,
  createScenarioSucceeded,
  deleteScenarioFailed,
  deleteScenarioSucceeded,
  duplicateScenarioFailed,
  duplicateScenarioSucceeded,
  scenariosFailed,
  scenariosLoaded,
  sensitivityAnalysisFailed,
  sensitivityAnalysisSucceeded,
  templatesFailed,
  templatesLoaded,
  toggleFavoriteFailed,
  toggleFavoriteSucceeded,
  updateScenarioFailed,
  updateScenarioSucceeded,
} from "@/store/slices/waterfallSlice";
import {
  createWaterfallScenario,
  deleteWaterfallScenario,
  duplicateWaterfallScenario,
  fetchWaterfallScenarios,
  fetchWaterfallTemplates,
  performSensitivityAnalysis,
  performWaterfallCalculation,
  toggleScenarioFavorite,
  updateWaterfallScenario,
} from "@/services/analytics/waterfallService";
import { createLatestOperation } from "@/store/async/createLatestOperation";

export const loadWaterfallScenariosOperation = createLatestOperation<
  GetWaterfallScenariosParams | undefined,
  { scenarios: WaterfallScenario[] }
>({
  typePrefix: "waterfall/scenarios/load",
  requestType: "waterfall/scenariosRequested",
  run: async ({ arg }) => {
    const scenarios = await fetchWaterfallScenarios(arg);
    return { scenarios };
  },
  onSuccess: (result) => scenariosLoaded(result),
  onFailure: (error) => scenariosFailed(error),
});

export const createWaterfallScenarioOperation = createLatestOperation<
  Omit<WaterfallScenario, "id" | "createdAt" | "updatedAt" | "version">,
  WaterfallScenario
>({
  typePrefix: "waterfall/scenarios/create",
  requestType: "waterfall/createScenarioRequested",
  run: async ({ arg }) => createWaterfallScenario(arg),
  onSuccess: (result) => createScenarioSucceeded(result),
  onFailure: (error) => createScenarioFailed(error),
});

export const updateWaterfallScenarioOperation = createLatestOperation<
  { id: string; data: Partial<WaterfallScenario> },
  WaterfallScenario
>({
  typePrefix: "waterfall/scenarios/update",
  requestType: "waterfall/updateScenarioRequested",
  run: async ({ arg }) => updateWaterfallScenario(arg.id, arg.data),
  onSuccess: (result) => updateScenarioSucceeded(result),
  onFailure: (error) => updateScenarioFailed(error),
});

export const deleteWaterfallScenarioOperation = createLatestOperation<
  string,
  string
>({
  typePrefix: "waterfall/scenarios/delete",
  requestType: "waterfall/deleteScenarioRequested",
  run: async ({ arg }) => {
    await deleteWaterfallScenario(arg);
    return arg;
  },
  onSuccess: (result) => deleteScenarioSucceeded(result),
  onFailure: (error) => deleteScenarioFailed(error),
});

export const duplicateWaterfallScenarioOperation = createLatestOperation<
  { id: string; newName?: string },
  WaterfallScenario
>({
  typePrefix: "waterfall/scenarios/duplicate",
  requestType: "waterfall/duplicateScenarioRequested",
  run: async ({ arg }) => duplicateWaterfallScenario(arg.id, arg.newName),
  onSuccess: (result) => duplicateScenarioSucceeded(result),
  onFailure: (error) => duplicateScenarioFailed(error),
});

export const loadWaterfallTemplatesOperation = createLatestOperation<
  void,
  { templates: Awaited<ReturnType<typeof fetchWaterfallTemplates>> }
>({
  typePrefix: "waterfall/templates/load",
  requestType: "waterfall/templatesRequested",
  run: async () => {
    const templates = await fetchWaterfallTemplates();
    return { templates };
  },
  onSuccess: (result) => templatesLoaded(result),
  onFailure: (error) => templatesFailed(error),
});

export const calculateWaterfallOperation = createLatestOperation<
  { scenarioId?: string; scenario?: WaterfallScenario },
  { results: WaterfallResults }
>({
  typePrefix: "waterfall/calculate",
  requestType: "waterfall/calculateWaterfallRequested",
  run: async ({ arg }) => {
    const results = await performWaterfallCalculation(arg);
    return { results };
  },
  onSuccess: (result) => calculateWaterfallSucceeded(result),
  onFailure: (error) => calculateWaterfallFailed(error),
});

export const runSensitivityAnalysisOperation = createLatestOperation<
  {
    scenarioId: string;
    minExitValue: number;
    maxExitValue: number;
    steps?: number;
  },
  { analysis: SensitivityAnalysis }
>({
  typePrefix: "waterfall/sensitivityAnalysis",
  requestType: "waterfall/sensitivityAnalysisRequested",
  run: async ({ arg }) => {
    const analysis = await performSensitivityAnalysis(
      arg.scenarioId,
      arg.minExitValue,
      arg.maxExitValue,
      arg.steps,
    );
    return { analysis };
  },
  onSuccess: (result) => sensitivityAnalysisSucceeded(result),
  onFailure: (error) => sensitivityAnalysisFailed(error),
});

export const toggleWaterfallScenarioFavoriteOperation = createLatestOperation<
  string,
  WaterfallScenario
>({
  typePrefix: "waterfall/toggleFavorite",
  requestType: "waterfall/toggleFavoriteRequested",
  run: async ({ arg }) => toggleScenarioFavorite(arg),
  onSuccess: (result) => toggleFavoriteSucceeded(result),
  onFailure: (error) => toggleFavoriteFailed(error),
});
