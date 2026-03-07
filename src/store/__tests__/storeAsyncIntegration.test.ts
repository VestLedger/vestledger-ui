import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "@/store/rootReducer";
import type { Distribution } from "@/types/distribution";
import { mockWaterfallScenarios } from "@/data/mocks/analytics/waterfall";
import * as distributionService from "@/services/backOffice/distributionService";
import * as waterfallService from "@/services/analytics/waterfallService";
import * as portfolioDataService from "@/services/portfolio/portfolioDataService";
import * as portfolioDocumentsService from "@/services/portfolio/portfolioDocumentsService";
import { loadDistributionsOperation } from "@/store/async/distributionOperations";
import { loadPortfolioUpdatesOperation } from "@/store/async/dataOperations";
import { calculateWaterfallOperation } from "@/store/async/waterfallOperations";

vi.mock("@/services/backOffice/distributionService", async () => {
  const actual = await vi.importActual<typeof import("@/services/backOffice/distributionService")>(
    "@/services/backOffice/distributionService"
  );
  return {
    ...actual,
    fetchDistributions: vi.fn(),
  };
});

vi.mock("@/services/analytics/waterfallService", async () => {
  const actual = await vi.importActual<typeof import("@/services/analytics/waterfallService")>(
    "@/services/analytics/waterfallService"
  );
  return {
    ...actual,
    performWaterfallCalculation: vi.fn(),
  };
});

vi.mock("@/services/portfolio/portfolioDataService", async () => {
  const actual = await vi.importActual<typeof import("@/services/portfolio/portfolioDataService")>(
    "@/services/portfolio/portfolioDataService"
  );
  return {
    ...actual,
    fetchPortfolioSnapshot: vi.fn(),
  };
});

vi.mock("@/services/portfolio/portfolioDocumentsService", async () => {
  const actual = await vi.importActual<typeof import("@/services/portfolio/portfolioDocumentsService")>(
    "@/services/portfolio/portfolioDocumentsService"
  );
  return {
    ...actual,
    fetchPortfolioDocumentsSnapshot: vi.fn(),
  };
});

const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
  });
};

describe("store + async integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads distributions through async operations and updates store", async () => {
    const store = setupStore();
    const mockDistributions: Distribution[] = [
      {
        id: "dist-1",
        fundId: "fund-1",
        fundName: "Test Fund",
        name: "Q4 Distribution",
        eventType: "dividend",
        eventDate: "2024-12-31",
        paymentDate: "2024-12-31",
        status: "draft",
        grossProceeds: 10000000,
        totalFees: 0,
        totalExpenses: 0,
        netProceeds: 10000000,
        totalTaxWithholding: 0,
        totalDistributed: 10000000,
        feeLineItems: [],
        lpAllocations: [],
        approvalChainId: "",
        approvalSteps: [],
        statementsGenerated: false,
        statements: [],
        createdBy: "user-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        isDraft: true,
        revisionNumber: 1,
        comments: [],
        isRecurring: false,
      },
    ];

    vi.mocked(distributionService.fetchDistributions).mockResolvedValue(mockDistributions);

    await store.dispatch(loadDistributionsOperation(undefined)).unwrap();

    expect(store.getState().distribution.distributions.data?.distributions).toEqual(
      mockDistributions
    );
  });

  it("runs waterfall calculation through async operations and stores results", async () => {
    const store = setupStore();
    const mockScenario = mockWaterfallScenarios[0];
    const mockResults = mockScenario.results!;

    vi.mocked(waterfallService.performWaterfallCalculation).mockResolvedValue(mockResults);

    await store.dispatch(calculateWaterfallOperation({ scenario: mockScenario })).unwrap();

    expect(store.getState().waterfall.calculation.data?.results).toEqual(mockResults);
  });

  it("loads the full portfolio snapshot and stores documents in Redux state", async () => {
    const store = setupStore();
    const mockPortfolioSnapshot: Awaited<ReturnType<typeof portfolioDataService.fetchPortfolioSnapshot>> = {
      companies: [
        {
          id: "company-1",
          companyName: "TechStartup Inc",
          sector: "AI",
          stage: "Series A",
          investmentDate: "2024-01-01",
          initialInvestment: 1000000,
          currentValuation: 2500000,
          ownership: 12,
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
          type: "financial",
          title: "March Update",
          description: "Revenue increased.",
          date: "2026-03-01",
          author: "Founder",
        },
      ],
      summary: {
        totalCompanies: 1,
        totalInvested: 1000000,
        totalCurrentValue: 300000,
        averageMOIC: 2.1,
        averageIRR: 28,
        activeCompanies: 1,
        averageHealthScore: 81,
      },
      performance: [
        {
          month: "Mar 2026",
          portfolioValue: 300000,
          deployed: 1000000,
        },
      ],
      allocation: [
        {
          sector: "AI",
          amount: 1000000,
          count: 1,
          percentage: 100,
        },
      ],
      pageMetrics: {
        totalCompanies: 1,
        atRiskCompanies: 0,
        pendingUpdates: 1,
      },
      healthyCompanies: 1,
    };
    const mockPortfolioDocuments: Awaited<ReturnType<typeof portfolioDocumentsService.fetchPortfolioDocumentsSnapshot>> = {
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
    };

    vi.mocked(portfolioDataService.fetchPortfolioSnapshot).mockResolvedValue(mockPortfolioSnapshot);
    vi.mocked(portfolioDocumentsService.fetchPortfolioDocumentsSnapshot).mockResolvedValue(mockPortfolioDocuments);

    await store.dispatch(loadPortfolioUpdatesOperation({ fundId: "fund-1" })).unwrap();

    expect(store.getState().portfolio.data).toEqual({
      ...mockPortfolioSnapshot,
      documents: mockPortfolioDocuments,
    });
  });
});
