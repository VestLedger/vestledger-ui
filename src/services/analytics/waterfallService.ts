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
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

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
  // Mock mode uses local storage
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

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/waterfall/scenarios', {
      params: {
        query: {
          fundId: params?.fundId,
          isFavorite: params?.isFavorite,
        },
      },
    }),
    { fallbackMessage: 'Failed to fetch waterfall scenarios' }
  );

  // Map API response to UI type (API should return compatible structure)
  return (result as unknown as WaterfallScenario[]) ?? [];
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

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/waterfall/scenarios/{id}', {
      params: { path: { id } },
    }),
    { fallbackMessage: `Failed to fetch waterfall scenario: ${id}` }
  );

  return result as unknown as WaterfallScenario;
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

  // API mode - map UI data to API DTO format
  const apiData = {
    fundId: data.fundId ?? '',
    name: data.name,
    description: data.description,
    model: data.model,
    exitValue: data.exitValue,
    isFavorite: data.isFavorite,
    tags: data.tags,
    tiers: data.tiers.map((tier) => ({
      name: tier.name,
      type: tier.type,
      order: tier.order,
      threshold: tier.threshold,
      hurdleRate: tier.hurdleRate,
      gpCarryPercentage: tier.gpCarryPercentage,
      lpPercentage: tier.lpPercentage,
      splitType: tier.splitType,
      description: tier.description,
      isCustom: tier.isCustom,
    })),
    investorClasses: data.investorClasses.map((ic) => ({
      name: ic.name,
      type: ic.type,
      ownershipPercentage: ic.ownershipPercentage,
      commitment: ic.commitment,
      capitalCalled: ic.capitalCalled,
      capitalReturned: ic.capitalReturned,
      order: ic.order,
    })),
  };

  const result = await unwrapApiResult(
    apiClient.POST('/waterfall/scenarios', {
      body: apiData,
    }),
    { fallbackMessage: 'Failed to create waterfall scenario' }
  );

  return result as unknown as WaterfallScenario;
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

  // API mode
  const result = await unwrapApiResult(
    apiClient.PUT('/waterfall/scenarios/{id}', {
      params: { path: { id } },
      body: {
        name: data.name,
        description: data.description,
        model: data.model,
        exitValue: data.exitValue,
        isFavorite: data.isFavorite,
        tags: data.tags,
        tiers: data.tiers?.map((tier) => ({
          name: tier.name,
          type: tier.type,
          order: tier.order,
          threshold: tier.threshold,
          hurdleRate: tier.hurdleRate,
          gpCarryPercentage: tier.gpCarryPercentage,
          lpPercentage: tier.lpPercentage,
          splitType: tier.splitType,
          description: tier.description,
          isCustom: tier.isCustom,
        })),
        investorClasses: data.investorClasses?.map((ic) => ({
          name: ic.name,
          type: ic.type,
          ownershipPercentage: ic.ownershipPercentage,
          commitment: ic.commitment,
          capitalCalled: ic.capitalCalled,
          capitalReturned: ic.capitalReturned,
          order: ic.order,
        })),
      },
    }),
    { fallbackMessage: 'Failed to update waterfall scenario' }
  );

  return result as unknown as WaterfallScenario;
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

  // API mode
  await unwrapApiResult(
    apiClient.DELETE('/waterfall/scenarios/{id}', {
      params: { path: { id } },
    }),
    { fallbackMessage: 'Failed to delete waterfall scenario' }
  );
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

  // API mode - duplicate then update name if needed
  const result = await unwrapApiResult(
    apiClient.POST('/waterfall/scenarios/{id}/duplicate', {
      params: { path: { id } },
    }),
    { fallbackMessage: 'Failed to duplicate waterfall scenario' }
  );

  const duplicated = result as unknown as WaterfallScenario;

  // If a new name was provided, update the duplicated scenario
  if (newName && duplicated.id) {
    return updateWaterfallScenario(duplicated.id, { name: newName });
  }

  return duplicated;
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

  // API mode
  const result = await unwrapApiResult(
    apiClient.GET('/waterfall/templates'),
    { fallbackMessage: 'Failed to fetch waterfall templates' }
  );

  return (result as unknown as WaterfallTemplate[]) ?? [];
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

  const templates = await fetchWaterfallTemplates();
  const template = templates.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  return createWaterfallScenario({
    name: scenarioData.name,
    description: `Created from template: ${template.name}`,
    fundId: scenarioData.fundId,
    fundName: scenarioData.fundName,
    model: template.model,
    investorClasses: [],
    tiers: template.tiers.map((tier, index) => ({
      ...tier,
      id: `template-tier-${Date.now()}-${index}`,
    })),
    exitValue: scenarioData.exitValue,
    totalInvested: scenarioData.totalInvested,
    managementFees: scenarioData.managementFees,
    isFavorite: false,
    isTemplate: false,
    createdBy: scenarioData.createdBy,
    tags: [template.name.toLowerCase().replace(/\s+/g, '-')],
  });
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

  // API mode
  const result = await unwrapApiResult(
    apiClient.POST('/waterfall/scenarios/{id}/favorite', {
      params: { path: { id } },
    }),
    { fallbackMessage: 'Failed to toggle favorite status' }
  );

  return result as unknown as WaterfallScenario;
}
