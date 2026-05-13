import { beforeEach, describe, expect, it, vi } from "vitest";

const isMockMode = vi.fn(() => false);
const requestJson = vi.fn();

vi.mock("@/config/data-mode", () => ({
  isMockMode,
}));

vi.mock("@/services/shared/httpClient", () => ({
  requestJson,
}));

describe("dashboardDataService", () => {
  beforeEach(() => {
    vi.resetModules();
    isMockMode.mockReset();
    isMockMode.mockReturnValue(false);
    requestJson.mockReset();
  });

  it("deduplicates consolidated portfolio companies before deriving revenue slices", async () => {
    requestJson.mockResolvedValue({
      portfolioCompanies: [
        {
          id: "company-healthbridge",
          name: "HealthBridge",
          fundName: "Apex Co-Invest Alpha",
          health: 92,
          healthChange: 8,
          runway: 24,
          burnRate: 350_000,
        },
        {
          id: "company-healthbridge",
          name: "HealthBridge",
          fundName: "Apex Growth III",
          health: 92,
          healthChange: 8,
          runway: 24,
          burnRate: 350_000,
        },
        {
          id: "company-robotics",
          name: "RoboLogic",
          fundName: "Apex Growth III",
          health: 81,
          healthChange: 4,
          runway: 18,
          burnRate: 280_000,
        },
      ],
    });

    const { getDashboardData } = await import("./dashboardDataService");
    const data = await getDashboardData(null, "consolidated", []);

    expect(data.portfolioCompanies.map((company) => company.id)).toEqual([
      "company-healthbridge",
      "company-robotics",
    ]);
    expect(data.portfolioRevenueRows.map((row) => row.id)).toEqual([
      "company-healthbridge",
      "company-robotics",
    ]);
    expect(new Set(data.revenueDistribution.map((slice) => slice.id)).size).toBe(
      data.revenueDistribution.length,
    );
  });
});
