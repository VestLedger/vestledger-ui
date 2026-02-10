import type { Fund } from '@/types/fund';
import type { CreateFundParams, GetFundsParams } from '@/store/slices/fundSlice';
import { isMockMode } from '@/config/data-mode';
import { mockFunds } from '@/data/mocks/funds';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';
import type { components } from '@/api/generated/openapi';

type ApiFund = components['schemas']['CreateFundDto'] & {
  id: string;
  createdAt: string;
  updatedAt: string;
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
    portfolioCount: 0,
    activeDeals: 0,
    totalInvestments: 0,
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
    createdAt: apiFund.createdAt,
    updatedAt: apiFund.updatedAt,
  };
}

function toCreateFundDto(data: CreateFundParams): components['schemas']['CreateFundDto'] {
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
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
  };
}

export async function fetchFunds(params: GetFundsParams): Promise<Fund[]> {
  if (isMockMode('funds')) {
    let funds = [...mockFunds];

    if (params.status) {
      funds = funds.filter((fund) => fund.status === params.status);
    }

    return clone(funds);
  }

  const result = await unwrapApiResult(
    apiClient.GET('/funds', {
      params: {
        query: {
          status: params.status as
            | 'active'
            | 'closed'
            | 'fundraising'
            | undefined,
        },
      },
    }),
    { fallbackMessage: 'Failed to fetch funds' }
  );

  const apiResponse = result as unknown as { data: ApiFund[]; meta?: unknown };
  const funds = apiResponse?.data ?? [];

  return funds.map(mapApiFundToFund);
}

export async function createFund(data: CreateFundParams): Promise<Fund> {
  if (isMockMode('funds')) {
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
      createdAt: now,
      updatedAt: now,
    };

    mockFunds.unshift(fund);
    return clone(fund);
  }

  const result = await unwrapApiResult(
    apiClient.POST('/funds', {
      body: toCreateFundDto(data),
    }),
    { fallbackMessage: 'Failed to create fund' }
  );

  return mapApiFundToFund(result as unknown as ApiFund);
}

export async function updateFund(
  fundId: string,
  data: Partial<CreateFundParams>
): Promise<Fund> {
  if (isMockMode('funds')) {
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
    apiClient.PUT('/funds/{id}', {
      params: { path: { id: fundId } },
      body: {
        ...data,
      },
    }),
    { fallbackMessage: 'Failed to update fund' }
  );

  return mapApiFundToFund(result as unknown as ApiFund);
}

export async function closeFund(fundId: string): Promise<Fund> {
  return updateFund(fundId, { status: 'closed' });
}

export async function archiveFundLocal(
  fundId: string
): Promise<{ fundId: string; archivedAt: string }> {
  return {
    fundId,
    archivedAt: new Date().toISOString(),
  };
}

export async function unarchiveFundLocal(
  fundId: string
): Promise<{ fundId: string; archivedAt: string }> {
  return {
    fundId,
    archivedAt: new Date().toISOString(),
  };
}
