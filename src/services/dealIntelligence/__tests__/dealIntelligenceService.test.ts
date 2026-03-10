import { beforeEach, describe, expect, it, vi } from "vitest";

const isMockMode = vi.fn(() => true);
const requestJson = vi.fn();

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

vi.mock("@/services/shared/pipelineGateway", () => ({
  fetchPipelineDealsFromApi: vi.fn(async () => []),
  formatAmountToMillions: (amount: number) =>
    `$${(amount / 1_000_000).toFixed(1)}M`,
}));

describe("dealIntelligenceService", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(true);
    requestJson.mockReset();
  });

  it("returns mock deal intelligence data without structuredClone errors", async () => {
    const service =
      await import("@/services/dealIntelligence/dealIntelligenceService");

    const data = await service.getDealIntelligenceData({});

    expect(data.activeDeals.length).toBeGreaterThan(0);
    expect(data.documentCategories.length).toBeGreaterThan(0);

    // Lucide icons are React forwardRef components. This ensures we don't crash when preparing
    // mock data for consumers.
    expect(data.documentCategories[0]).toHaveProperty("icon");
  });
});
