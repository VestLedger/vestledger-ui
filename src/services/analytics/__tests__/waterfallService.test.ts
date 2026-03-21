import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaterfallScenario } from "@/types/waterfall";

const loadService = async () => import("@/services/analytics/waterfallService");

const isMockMode = vi.fn(() => true);
const unwrapApiResult = vi.fn();
const apiClient = {
  GET: vi.fn(),
  POST: vi.fn(),
  PUT: vi.fn(),
  DELETE: vi.fn(),
};

vi.mock("@/config/data-mode", () => ({ isMockMode }));
vi.mock("@/api/unwrap", () => ({ unwrapApiResult }));
vi.mock("@/api/client", () => ({ apiClient }));

const buildScenario = (): Omit<
  WaterfallScenario,
  "id" | "createdAt" | "updatedAt" | "version"
> => ({
  name: "Test Scenario",
  description: "Scenario created in tests",
  fundId: "fund-test",
  fundName: "Test Fund",
  model: "european",
  investorClasses: [],
  tiers: [],
  exitValue: 12_000_000,
  totalInvested: 5_000_000,
  managementFees: 200_000,
  isFavorite: false,
  isTemplate: false,
  createdBy: "Tester",
  tags: ["test"],
});

describe("waterfallService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    unwrapApiResult.mockReset();
    apiClient.GET.mockReset();
  });

  it("fetchWaterfallScenarios maps API list payloads ({ data, meta }) to scenario arrays", async () => {
    isMockMode.mockReturnValue(false);
    unwrapApiResult.mockResolvedValue({
      data: [
        {
          id: "api-scenario-1",
          name: "API Scenario",
          description: "From API list response",
          fundId: "fund-test",
          fundName: "Test Fund",
          model: "european",
          investorClasses: [],
          tiers: [],
          exitValue: 10_000_000,
          totalInvested: 5_000_000,
          managementFees: 100_000,
          isFavorite: false,
          isTemplate: false,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "API",
          tags: [],
        },
      ],
      meta: { total: 1, limit: 50, offset: 0, hasMore: false },
    });
    apiClient.GET.mockResolvedValue({});

    const { fetchWaterfallScenarios } = await loadService();
    const scenarios = await fetchWaterfallScenarios();

    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0].id).toBe("api-scenario-1");
  });

  it("fetchWaterfallScenarios filters by fundId", async () => {
    const { fetchWaterfallScenarios } = await loadService();
    const scenarios = await fetchWaterfallScenarios({ fundId: "fund-2" });
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.every((scenario) => scenario.fundId === "fund-2")).toBe(
      true,
    );
  });

  it("createWaterfallScenario persists a new scenario", async () => {
    const { createWaterfallScenario, fetchWaterfallScenarios } =
      await loadService();
    const created = await createWaterfallScenario(buildScenario());
    const scenarios = await fetchWaterfallScenarios();
    expect(scenarios.some((scenario) => scenario.id === created.id)).toBe(true);
  });

  it("updateWaterfallScenario updates fields and version", async () => {
    const { fetchWaterfallScenarios, updateWaterfallScenario } =
      await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const updated = await updateWaterfallScenario(scenario.id, {
      name: "Updated Scenario",
    });
    expect(updated.name).toBe("Updated Scenario");
    expect(updated.version).toBe(scenario.version + 1);
  });

  it("duplicateWaterfallScenario clones and resets favorite", async () => {
    const { fetchWaterfallScenarios, duplicateWaterfallScenario } =
      await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const duplicate = await duplicateWaterfallScenario(scenario.id);
    expect(duplicate.id).not.toBe(scenario.id);
    expect(duplicate.name).toContain(scenario.name);
    expect(duplicate.isFavorite).toBe(false);
  });

  it("toggleScenarioFavorite flips the favorite flag", async () => {
    const { fetchWaterfallScenarios, toggleScenarioFavorite } =
      await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const toggled = await toggleScenarioFavorite(scenario.id);
    expect(toggled.isFavorite).toBe(!scenario.isFavorite);
  });

  it("performWaterfallCalculation returns results for a scenario", async () => {
    const { fetchWaterfallScenarios, performWaterfallCalculation } =
      await loadService();
    const [scenario] = await fetchWaterfallScenarios();
    const results = await performWaterfallCalculation({ scenario });
    expect(results.totalExitValue).toBe(scenario.exitValue);
    expect(results.totalInvested).toBe(scenario.totalInvested);
  });
});
