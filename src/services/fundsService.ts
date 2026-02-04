import type { Fund } from '@/types/fund';
import type { GetFundsParams } from '@/store/slices/fundSlice';
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

/**
 * Map API fund response to UI Fund type
 * Preserves all UI data structure fields
 */
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
    // Computed fields from API or derived
    portfolioCount: 0, // Will be populated by portfolio endpoint
    activeDeals: 0, // Will be populated by portfolio endpoint
    totalInvestments: 0, // Will be populated by portfolio endpoint
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

/**
 * Fetch funds with optional filters
 * Uses real API when in API mode, mock data when in mock mode
 */
export async function fetchFunds(params: GetFundsParams): Promise<Fund[]> {
  if (isMockMode("funds")) {
    // Mock mode: Accept params but return static data
    let funds = [...mockFunds];

    // Apply filters from params
    if (params.status) {
      funds = funds.filter((f) => f.status === params.status);
    }

    return funds;
  }

  // API mode: Call real endpoint
  const result = await unwrapApiResult(
    apiClient.GET("/funds", {
      params: {
        query: {
          status: params.status as
            | "active"
            | "closed"
            | "fundraising"
            | undefined,
        },
      },
    }),
    { fallbackMessage: "Failed to fetch funds" },
  );

  // API returns paginated response: { data: [...], meta: {...} }
  const apiResponse = result as unknown as { data: ApiFund[]; meta?: unknown };
  const funds = apiResponse?.data ?? [];

  // Map API response to UI Fund type
  return funds.map(mapApiFundToFund);
}
