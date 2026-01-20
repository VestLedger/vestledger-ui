/**
 * Waterfall Service
 *
 * Service layer for waterfall scenario management and calculations
 */

import type {
  WaterfallScenario,
  WaterfallResults,
  WaterfallTemplate,
  SensitivityAnalysis,
} from '@/types/waterfall';
import { isMockMode } from '@/config/data-mode';
import {
  mockWaterfallScenarios,
  mockWaterfallTemplates,
} from '@/data/mocks/analytics/waterfall';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import {
  calculateWaterfall,
  calculateSensitivityAnalysis,
} from '@/lib/calculations/waterfall';

const STORAGE_KEY = 'vestledger-waterfall-scenarios';
let scenarioStoreCache: WaterfallScenario[] | null = null;

const seedScenarioStore = () =>
  JSON.parse(JSON.stringify(mockWaterfallScenarios)) as WaterfallScenario[];

const loadScenarioStore = (): WaterfallScenario[] => {
  if (scenarioStoreCache) return scenarioStoreCache;
  const stored = safeLocalStorage.getJSON<WaterfallScenario[]>(STORAGE_KEY);
  if (stored && stored.length > 0) {
    scenarioStoreCache = stored;
    return stored;
  }
  const seeded = seedScenarioStore();
  scenarioStoreCache = seeded;
  safeLocalStorage.setJSON(STORAGE_KEY, seeded);
  return seeded;
};

const persistScenarioStore = (scenarios: WaterfallScenario[]) => {
  scenarioStoreCache = scenarios;
  safeLocalStorage.setJSON(STORAGE_KEY, scenarios);
};

// ============================================================================
// Scenario Management
// ============================================================================

export interface GetWaterfallScenariosParams {
  fundId?: string;
  isFavorite?: boolean;
  tags?: string[];
  searchQuery?: string;
}

/**
 * Fetch waterfall scenarios with optional filters
 */
export async function fetchWaterfallScenarios(
  params?: GetWaterfallScenariosParams
): Promise<WaterfallScenario[]> {
  if (isMockMode()) {
    let scenarios = [...loadScenarioStore()];

    // Apply filters
    if (params?.fundId) {
      scenarios = scenarios.filter((s) => s.fundId === params.fundId);
    }

    if (params?.isFavorite !== undefined) {
      scenarios = scenarios.filter((s) => s.isFavorite === params.isFavorite);
    }

    if (params?.tags && params.tags.length > 0) {
      scenarios = scenarios.filter((s) =>
        params.tags?.some((tag) => s.tags?.includes(tag))
      );
    }

    if (params?.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      scenarios = scenarios.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    return scenarios;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Fetch a single waterfall scenario by ID
 */
export async function fetchWaterfallScenario(id: string): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenario = loadScenarioStore().find((s) => s.id === id);
    if (!scenario) {
      throw new Error(`Waterfall scenario not found: ${id}`);
    }
    return scenario;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Create a new waterfall scenario
 */
export async function createWaterfallScenario(
  data: Omit<WaterfallScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const newScenario: WaterfallScenario = {
      ...data,
      id: `scenario-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [...scenarios, newScenario];
    persistScenarioStore(next);
    return newScenario;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Update an existing waterfall scenario
 */
export async function updateWaterfallScenario(
  id: string,
  data: Partial<WaterfallScenario>
): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Waterfall scenario not found: ${id}`);
    }

    const updated = {
      ...scenarios[index],
      ...data,
      id, // Preserve ID
      version: scenarios[index].version + 1,
      updatedAt: new Date().toISOString(),
    };

    const next = [...scenarios];
    next[index] = updated;
    persistScenarioStore(next);
    return updated;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Delete a waterfall scenario
 */
export async function deleteWaterfallScenario(id: string): Promise<void> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Waterfall scenario not found: ${id}`);
    }

    const next = scenarios.filter((scenario) => scenario.id !== id);
    persistScenarioStore(next);
    return;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Duplicate a waterfall scenario
 */
export async function duplicateWaterfallScenario(
  id: string,
  newName?: string
): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const original = scenarios.find((s) => s.id === id);
    if (!original) {
      throw new Error(`Waterfall scenario not found: ${id}`);
    }

    const duplicate: WaterfallScenario = {
      ...original,
      id: `scenario-${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    const next = [...scenarios, duplicate];
    persistScenarioStore(next);
    return duplicate;
  }

  throw new Error('Waterfall API not implemented yet');
}

// ============================================================================
// Calculation Functions
// ============================================================================

export interface CalculateWaterfallParams {
  scenarioId?: string;
  scenario?: WaterfallScenario;
}

/**
 * Calculate waterfall results for a scenario
 * Can accept either a scenario ID or a complete scenario object
 */
export async function performWaterfallCalculation(
  params: CalculateWaterfallParams
): Promise<WaterfallResults> {
  let scenario: WaterfallScenario;

  if (params.scenario) {
    scenario = params.scenario;
  } else if (params.scenarioId) {
    scenario = await fetchWaterfallScenario(params.scenarioId);
  } else {
    throw new Error('Either scenarioId or scenario must be provided');
  }

  // Perform frontend calculation
  const results = calculateWaterfall(scenario);

  // In production, you might want to send to backend for validation
  // const backendResults = await apiClient.post('/waterfall/calculate', { scenario });

  return results;
}

/**
 * Calculate sensitivity analysis for a scenario
 */
export async function performSensitivityAnalysis(
  scenarioId: string,
  minExitValue: number,
  maxExitValue: number,
  steps?: number
): Promise<SensitivityAnalysis> {
  const scenario = await fetchWaterfallScenario(scenarioId);
  return calculateSensitivityAnalysis(scenario, minExitValue, maxExitValue, steps);
}

// ============================================================================
// Template Management
// ============================================================================

/**
 * Fetch waterfall templates
 */
export async function fetchWaterfallTemplates(): Promise<WaterfallTemplate[]> {
  if (isMockMode()) {
    return mockWaterfallTemplates;
  }

  throw new Error('Waterfall API not implemented yet');
}

/**
 * Create scenario from template
 */
export async function createScenarioFromTemplate(
  templateId: string,
  scenarioData: {
    name: string;
    fundId?: string;
    fundName?: string;
    exitValue: number;
    totalInvested: number;
    managementFees: number;
    createdBy: string;
  }
): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const template = mockWaterfallTemplates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const newScenario: WaterfallScenario = {
      id: `scenario-${Date.now()}`,
      name: scenarioData.name,
      description: `Created from template: ${template.name}`,
      fundId: scenarioData.fundId,
      fundName: scenarioData.fundName,
      model: template.model,
      investorClasses: [], // Should be populated by user
      tiers: template.tiers.map((tier, index) => ({
        ...tier,
        id: `tier-${Date.now()}-${index}`,
      })),
      exitValue: scenarioData.exitValue,
      totalInvested: scenarioData.totalInvested,
      managementFees: scenarioData.managementFees,
      isFavorite: false,
      isTemplate: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: scenarioData.createdBy,
      tags: [template.name.toLowerCase().replace(/\s+/g, '-')],
    };

    const next = [...scenarios, newScenario];
    persistScenarioStore(next);
    return newScenario;
  }

  throw new Error('Waterfall API not implemented yet');
}

// ============================================================================
// Favorite Management
// ============================================================================

/**
 * Toggle favorite status for a scenario
 */
export async function toggleScenarioFavorite(id: string): Promise<WaterfallScenario> {
  if (isMockMode()) {
    const scenarios = loadScenarioStore();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Waterfall scenario not found: ${id}`);
    }

    const updated = {
      ...scenarios[index],
      isFavorite: !scenarios[index].isFavorite,
      updatedAt: new Date().toISOString(),
    };

    const next = [...scenarios];
    next[index] = updated;
    persistScenarioStore(next);
    return updated;
  }

  throw new Error('Waterfall API not implemented yet');
}
