import { describe, it, expect } from "vitest";
import {
  portfolioReducer,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
  type PortfolioUpdatesData,
} from "../portfolioSlice";
import { getSliceTestExpectations } from "../../__tests__/sliceTestHarness";
import type { NormalizedError } from "@/store/types/AsyncState";

function request<T>(type: string, payload?: T) {
  return { type, payload };
}

describe("portfolioSlice", () => {
  const mockUpdates: PortfolioUpdatesData = {
    companies: [
      {
        id: "company-1",
        companyName: "TechStartup Inc",
        sector: "AI",
        stage: "Series A",
        investmentDate: "2024-01-01",
        initialInvestment: 1000000,
        currentValuation: 2500000,
        ownership: 10,
        arr: 600000,
        arrGrowth: 45,
        burnRate: 50000,
        runway: 18,
        headcount: 24,
        totalRaised: 5000000,
        lastRoundDate: "2024-06-01",
        lastRoundAmount: 2000000,
        lastRoundValuation: 2500000,
        moic: 2.1,
        irr: 28,
        status: "active",
        healthScore: 81,
        lastUpdateDate: "2026-03-01",
      },
    ],
    updates: [
      {
        id: "update-1",
        companyId: "company-1",
        companyName: "TechStartup Inc",
        title: "Q4 2024 Update",
        date: "2024-12-15",
        type: "financial",
        description: "Strong revenue growth of 45% YoY",
        author: "Founder",
      },
      {
        id: "update-2",
        companyId: "company-2",
        companyName: "HealthApp Co",
        title: "Product Launch Announcement",
        date: "2024-12-10",
        type: "milestone",
        description: "Launched new enterprise product line",
        author: "CEO",
      },
    ],
    summary: {
      totalCompanies: 2,
      totalInvested: 2000000,
      totalCurrentValue: 3500000,
      averageMOIC: 1.75,
      averageIRR: 24,
      activeCompanies: 2,
      averageHealthScore: 78,
    },
    performance: [
      {
        month: "Dec 2025",
        portfolioValue: 3200000,
        deployed: 1900000,
      },
      {
        month: "Jan 2026",
        portfolioValue: 3500000,
        deployed: 2000000,
      },
    ],
    allocation: [
      {
        sector: "AI",
        amount: 2000000,
        count: 2,
        percentage: 100,
      },
    ],
    pageMetrics: {
      totalCompanies: 2,
      atRiskCompanies: 0,
      pendingUpdates: 2,
    },
    healthyCompanies: 2,
    documents: {
      companies: [
        {
          id: 1,
          name: "TechStartup Inc",
          sector: "AI",
          stage: "Series A",
          overdueCount: 0,
          pendingCount: 1,
        },
      ],
      documents: [
        {
          id: 1,
          name: "Board Deck",
          category: "board-materials",
          status: "pending-review",
          companyId: 1,
          companyName: "TechStartup Inc",
        },
      ],
      categories: [
        {
          id: "board-materials",
          name: "Board Materials",
          description: "Board and governance documents",
        },
      ],
    },
  };

  const expectations = getSliceTestExpectations<PortfolioUpdatesData>({
    mockData: mockUpdates,
  });

  describe("initial state", () => {
    it("should return the initial state", () => {
      const state = portfolioReducer(undefined, { type: "@@INIT" });
      expect(state).toEqual(expectations.initialState);
    });

    it("should have idle status initially", () => {
      const state = portfolioReducer(undefined, { type: "@@INIT" });
      expect(state.status).toBe("idle");
      expect(state.data).toBeNull();
      expect(state.error).toBeUndefined();
    });
  });

  describe("portfolioUpdatesRequested", () => {
    it("should set status to loading", () => {
      const state = portfolioReducer(
        expectations.initialState,
        request("portfolio/portfolioUpdatesRequested", {}),
      );
      expect(state.status).toBe("loading");
      expect(state.error).toBeUndefined();
    });

    it("should clear previous error when requesting", () => {
      const stateWithError = {
        ...expectations.initialState,
        error: { message: "Previous error", code: "PREV_ERROR" },
      };
      const state = portfolioReducer(
        stateWithError,
        request("portfolio/portfolioUpdatesRequested", {}),
      );
      expect(state.error).toBeUndefined();
    });
  });

  describe("portfolioUpdatesLoaded", () => {
    it("should set data and status to succeeded", () => {
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesLoaded(mockUpdates),
      );
      expect(state.status).toBe("succeeded");
      expect(state.data).toEqual(mockUpdates);
      expect(state.error).toBeUndefined();
    });

    it("should contain updates array", () => {
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesLoaded(mockUpdates),
      );
      expect(state.data?.updates).toHaveLength(2);
      expect(state.data?.updates[0].companyName).toBe("TechStartup Inc");
      expect(state.data?.documents.documents).toHaveLength(1);
    });

    it("should replace existing data", () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: {
          ...mockUpdates,
          updates: [
            {
              id: "old",
              companyId: "old",
              companyName: "Old Co",
              title: "Old",
              date: "2020-01-01",
              type: "financial" as const,
              description: "Old",
              author: "Founder",
            },
          ],
        },
      };
      const state = portfolioReducer(
        stateWithData,
        portfolioUpdatesLoaded(mockUpdates),
      );
      expect(state.data?.updates).toHaveLength(2);
      expect(state.data?.updates[0].id).toBe("update-1");
    });
  });

  describe("portfolioUpdatesFailed", () => {
    it("should set error and status to failed", () => {
      const error: NormalizedError = {
        message: "Failed to fetch portfolio updates",
        code: "FETCH_ERROR",
      };
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesFailed(error),
      );
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(error);
    });

    it("should preserve error code and message", () => {
      const error: NormalizedError = {
        message: "Network timeout",
        code: "TIMEOUT_ERROR",
        details: { timeout: 30000 },
      };
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesFailed(error),
      );
      expect(state.error?.code).toBe("TIMEOUT_ERROR");
      expect(state.error?.message).toBe("Network timeout");
    });
  });

  describe("AsyncState contract compliance", () => {
    it("should follow request → load → success pattern", () => {
      let state = portfolioReducer(undefined, { type: "@@INIT" });
      expect(state.status).toBe("idle");

      state = portfolioReducer(
        state,
        request("portfolio/portfolioUpdatesRequested", {}),
      );
      expect(state.status).toBe("loading");

      state = portfolioReducer(state, portfolioUpdatesLoaded(mockUpdates));
      expect(state.status).toBe("succeeded");
      expect(state.data).toEqual(mockUpdates);
    });

    it("should follow request → fail pattern", () => {
      let state = portfolioReducer(undefined, { type: "@@INIT" });
      expect(state.status).toBe("idle");

      state = portfolioReducer(
        state,
        request("portfolio/portfolioUpdatesRequested", {}),
      );
      expect(state.status).toBe("loading");

      const error: NormalizedError = { message: "Error", code: "ERROR" };
      state = portfolioReducer(state, portfolioUpdatesFailed(error));
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(error);
    });
  });
});
