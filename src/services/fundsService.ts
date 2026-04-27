import type { Fund } from "@/types/fund";
import type {
  CreateFundParams,
  GetFundsParams,
} from "@/store/slices/fundSlice";
import { isMockMode } from "@/config/data-mode";
import { mockFunds } from "@/data/mocks/funds";
import { apiClient, getAccessToken } from "@/api/client";
import { getApiBaseUrl } from "@/api/config";
import { unwrapApiResult } from "@/api/unwrap";
import type { components } from "@/api/generated/openapi";
import type {
  FundRegulatoryProfile,
  FundRegulatoryRegime,
} from "@/types/regulatory";

type ApiFund = components["schemas"]["CreateFundDto"] & {
  id: string;
  createdAt: string;
  updatedAt: string;
  portfolioCount?: number;
  activeDeals?: number;
  totalInvestments?: number;
};

const clone = <T>(value: T): T => structuredClone(value);

function mapApiFundToFund(apiFund: ApiFund): Fund {
  return {
    id: apiFund.id,
    name: apiFund.name,
    displayName: apiFund.displayName,
    fundNumber: apiFund.fundNumber,
    status: apiFund.status,
    strategy: apiFund.strategy,
    totalCommitment: apiFund.totalCommitment,
    deployedCapital: apiFund.deployedCapital,
    availableCapital: apiFund.availableCapital,
    vintage: apiFund.vintage,
    startDate: apiFund.startDate,
    endDate: apiFund.endDate,
    fundTerm: apiFund.fundTerm,
    portfolioCount: apiFund.portfolioCount ?? 0,
    activeDeals: apiFund.activeDeals ?? 0,
    totalInvestments: apiFund.totalInvestments ?? 0,
    portfolioValue: apiFund.portfolioValue,
    irr: apiFund.irr ?? 0,
    tvpi: apiFund.tvpi ?? 1.0,
    dpi: apiFund.dpi ?? 0,
    minInvestment: apiFund.minInvestment,
    maxInvestment: apiFund.maxInvestment,
    targetSectors: apiFund.targetSectors,
    targetStages: apiFund.targetStages,
    description: apiFund.description,
    managers: apiFund.managers,
    activeWaterfallId: (apiFund as Record<string, unknown>)
      .activeWaterfallId as string | undefined,
    regulatoryRegime: (apiFund as Record<string, unknown>).regulatoryRegime as
      | FundRegulatoryRegime
      | undefined,
    regulatoryProfile: (apiFund as Record<string, unknown>)
      .regulatoryProfile as FundRegulatoryProfile | undefined,
    createdAt: apiFund.createdAt,
    updatedAt: apiFund.updatedAt,
  };
}

function toCreateFundDto(
  data: CreateFundParams,
): components["schemas"]["CreateFundDto"] & {
  activeWaterfallId: string;
  regulatoryRegime?: FundRegulatoryRegime | null;
  regulatoryProfile?: FundRegulatoryProfile;
} {
  return {
    name: data.name,
    displayName: data.displayName,
    fundNumber: data.fundNumber,
    status: data.status,
    strategy: data.strategy,
    vintage: data.vintage,
    fundTerm: data.fundTerm,
    totalCommitment: data.totalCommitment,
    deployedCapital: data.deployedCapital,
    availableCapital: data.availableCapital,
    portfolioValue: data.portfolioValue,
    irr: data.irr,
    tvpi: data.tvpi,
    dpi: data.dpi,
    moic: data.moic,
    minInvestment: data.minInvestment,
    maxInvestment: data.maxInvestment,
    targetSectors: data.targetSectors,
    targetStages: data.targetStages,
    managers: data.managers,
    activeWaterfallId: data.activeWaterfallId,
    regulatoryRegime: data.regulatoryRegime ?? undefined,
    regulatoryProfile: data.regulatoryProfile as
      | ({ [key: string]: unknown } & FundRegulatoryProfile)
      | undefined,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
  };
}

export async function fetchFunds(params: GetFundsParams): Promise<Fund[]> {
  if (isMockMode("funds")) {
    let funds = [...mockFunds];

    if (params.status) {
      funds = funds.filter((fund) => fund.status === params.status);
    }

    return clone(funds);
  }

  const query: {
    status?: "active" | "closed" | "fundraising";
  } = {};

  if (
    params.status === "active" ||
    params.status === "closed" ||
    params.status === "fundraising"
  ) {
    query.status = params.status;
  }

  const result = await unwrapApiResult(
    apiClient.GET("/funds", {
      params: {
        query,
      },
    }),
    { fallbackMessage: "Failed to fetch funds" },
  );

  const apiResponse = result as unknown as { data: ApiFund[]; meta?: unknown };
  const funds = apiResponse?.data ?? [];

  return funds.map(mapApiFundToFund);
}

export async function createFund(data: CreateFundParams): Promise<Fund> {
  if (isMockMode("funds")) {
    const now = new Date().toISOString();
    const fund: Fund = {
      id: `fund-${Date.now()}`,
      name: data.name,
      displayName: data.displayName,
      fundNumber: data.fundNumber,
      status: data.status,
      strategy: data.strategy,
      totalCommitment: data.totalCommitment,
      deployedCapital: data.deployedCapital,
      availableCapital: data.availableCapital,
      vintage: data.vintage,
      startDate: data.startDate,
      endDate: data.endDate,
      fundTerm: data.fundTerm,
      portfolioCount: 0,
      activeDeals: 0,
      totalInvestments: 0,
      portfolioValue: data.portfolioValue,
      irr: data.irr ?? 0,
      tvpi: data.tvpi ?? 1,
      dpi: data.dpi ?? 0,
      minInvestment: data.minInvestment,
      maxInvestment: data.maxInvestment,
      targetSectors: data.targetSectors,
      targetStages: data.targetStages,
      description: data.description,
      managers: data.managers,
      activeWaterfallId: data.activeWaterfallId,
      regulatoryRegime: data.regulatoryRegime,
      regulatoryProfile: data.regulatoryProfile,
      createdAt: now,
      updatedAt: now,
    };

    mockFunds.unshift(fund);
    return clone(fund);
  }

  const result = await unwrapApiResult(
    apiClient.POST("/funds", {
      body: toCreateFundDto(data),
    }),
    { fallbackMessage: "Failed to create fund" },
  );

  return mapApiFundToFund(result as unknown as ApiFund);
}

export async function updateFund(
  fundId: string,
  data: Partial<CreateFundParams>,
): Promise<Fund> {
  if (isMockMode("funds")) {
    const index = mockFunds.findIndex((fund) => fund.id === fundId);
    if (index === -1) {
      throw new Error(`Fund not found: ${fundId}`);
    }

    const current = mockFunds[index];
    const updated: Fund = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockFunds[index] = updated;
    return clone(updated);
  }

  const result = await unwrapApiResult(
    apiClient.PUT("/funds/{id}", {
      params: { path: { id: fundId } },
      body: {
        ...data,
        regulatoryRegime: data.regulatoryRegime ?? undefined,
        regulatoryProfile: data.regulatoryProfile as
          | ({ [key: string]: unknown } & FundRegulatoryProfile)
          | undefined,
      },
    }),
    { fallbackMessage: "Failed to update fund" },
  );

  return mapApiFundToFund(result as unknown as ApiFund);
}

export async function closeFund(fundId: string): Promise<Fund> {
  return updateFund(fundId, { status: "closed" });
}

export async function archiveFundLocal(
  fundId: string,
): Promise<{ fundId: string; archivedAt: string }> {
  return {
    fundId,
    archivedAt: new Date().toISOString(),
  };
}

export async function unarchiveFundLocal(
  fundId: string,
): Promise<{ fundId: string; archivedAt: string }> {
  return {
    fundId,
    archivedAt: new Date().toISOString(),
  };
}

export async function getActiveWaterfall(
  fundId: string,
): Promise<{ waterfallScenarioId: string | null }> {
  if (isMockMode("funds")) {
    const fund = mockFunds.find((f) => f.id === fundId);
    return { waterfallScenarioId: fund?.activeWaterfallId ?? null };
  }

  const token = getAccessToken();
  const res = await fetch(
    `${getApiBaseUrl()}/funds/${fundId}/active-waterfall`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) throw new Error("Failed to fetch active waterfall");
  const data = await res.json();
  return { waterfallScenarioId: data?.waterfallScenarioId ?? null };
}

export async function setActiveWaterfall(
  fundId: string,
  waterfallScenarioId: string,
): Promise<void> {
  if (isMockMode("funds")) {
    const fund = mockFunds.find((f) => f.id === fundId);
    if (fund) {
      fund.activeWaterfallId = waterfallScenarioId;
    }
    return;
  }

  const token = getAccessToken();
  const res = await fetch(
    `${getApiBaseUrl()}/funds/${fundId}/active-waterfall`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ waterfallScenarioId }),
    },
  );
  if (!res.ok) throw new Error("Failed to set active waterfall");
}
