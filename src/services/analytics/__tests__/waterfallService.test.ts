import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WaterfallScenario } from '@/types/waterfall';

const loadService = async () => import('@/services/analytics/waterfallService');

const buildScenario = (): Omit<WaterfallScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'> => ({
  name: 'Test Scenario',
  description: 'Scenario created in tests',
  fundId: 'fund-test',
  fundName: 'Test Fund',
  model: 'european',
  investorClasses: [],
  tiers: [],
  exitValue: 12_000_000,
  totalInvested: 5_000_000,
  managementFees: 200_000,
  isFavorite: false,
  isTemplate: false,
  createdBy: 'Tester',
  tags: ['test'],
});

describe('waterfallService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('fetchWaterfallScenarios filters by fundId', async () => {
    const { fetchWaterfallScenarios } = await loadService();
    const scenarios = await fetchWaterfallScenarios({ fundId: 'fund-2' });
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.every((scenario) => scenario.fundId === 'fund-2')).toBe(true);
  });

  it('createWaterfallScenario persists a new scenario', async () => {
    const { createWaterfallScenario, fetchWaterfallScenarios } = await loadService();
    const created = await createWaterfallScenario(buildScenario());
    const scenarios = await fetchWaterfallScenarios();
    expect(scenarios.some((scenario) => scenario.id === created.id)).toBe(true);
  });

  it('updateWaterfallScenario updates fields and version', async () => {
    const { fetchWaterfallScenarios, updateWaterfallScenario } = await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const updated = await updateWaterfallScenario(scenario.id, { name: 'Updated Scenario' });
    expect(updated.name).toBe('Updated Scenario');
    expect(updated.version).toBe(scenario.version + 1);
  });

  it('duplicateWaterfallScenario clones and resets favorite', async () => {
    const { fetchWaterfallScenarios, duplicateWaterfallScenario } = await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const duplicate = await duplicateWaterfallScenario(scenario.id);
    expect(duplicate.id).not.toBe(scenario.id);
    expect(duplicate.name).toContain(scenario.name);
    expect(duplicate.isFavorite).toBe(false);
  });

  it('toggleScenarioFavorite flips the favorite flag', async () => {
    const { fetchWaterfallScenarios, toggleScenarioFavorite } = await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const toggled = await toggleScenarioFavorite(scenario.id);
    expect(toggled.isFavorite).toBe(!scenario.isFavorite);
  });

  it('performWaterfallCalculation returns results for a scenario', async () => {
    const { fetchWaterfallScenarios, performWaterfallCalculation } = await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const results = await performWaterfallCalculation({ scenario });
    expect(results.totalExitValue).toBe(scenario.exitValue);
    expect(results.totalInvested).toBe(scenario.totalInvested);
  });
});
