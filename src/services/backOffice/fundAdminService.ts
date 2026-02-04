import { isMockMode } from '@/config/data-mode';
import {
  mockCapitalCalls,
  mockDistributions,
  mockLPResponses,
  type CapitalCall,
  type Distribution,
  type LPResponse,
} from '@/data/mocks/back-office/fund-admin';
import { apiClient } from '@/api/client';
import { unwrapApiResult } from '@/api/unwrap';

interface ApiCapitalCall {
  id: string;
  fundId: string;
  callNumber: number;
  amount: number;
  collected: number;
  dueDate: string;
  status: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map API capital call to UI CapitalCall type
 */
function mapApiToCapitalCall(api: ApiCapitalCall, fundName: string): CapitalCall {
  // Map API status to UI status
  const statusMap: Record<string, CapitalCall['status']> = {
    pending: 'sent',
    partial: 'in-progress',
    complete: 'completed',
    overdue: 'in-progress',
  };

  return {
    id: api.id,
    callNumber: api.callNumber,
    fundName,
    callDate: api.createdAt.split('T')[0],
    dueDate: api.dueDate.split('T')[0],
    totalAmount: api.amount,
    amountReceived: api.collected,
    lpCount: 0, // Would need additional API or response data
    lpsResponded: 0, // Would need additional API or response data
    status: statusMap[api.status] ?? 'draft',
    purpose: api.purpose ?? '',
  };
}

export async function getCapitalCalls(fundId?: string): Promise<CapitalCall[]> {
  if (isMockMode('backOffice')) return mockCapitalCalls;

  // If no fundId, get active capital calls across all funds
  if (!fundId) {
    const result = await unwrapApiResult(
      apiClient.GET('/capital-calls/active'),
      { fallbackMessage: 'Failed to fetch active capital calls' }
    );
    return ((result as unknown as (ApiCapitalCall & { fund?: { name: string } })[]) ?? []).map((cc) =>
      mapApiToCapitalCall(cc, cc.fund?.name ?? 'Unknown Fund')
    );
  }

  // Get capital calls for specific fund
  const result = await unwrapApiResult(
    apiClient.GET('/funds/{fundId}/capital-calls', {
      params: { path: { fundId } },
    }),
    { fallbackMessage: 'Failed to fetch capital calls' }
  );

  // Need fund name - could fetch separately or assume it's in context
  return ((result as unknown as ApiCapitalCall[]) ?? []).map((cc) => mapApiToCapitalCall(cc, 'Fund'));
}

export function getDistributions(): Distribution[] {
  if (isMockMode('backOffice')) return mockDistributions;
  // Use the dedicated distributionService.ts for full distribution functionality
  return mockDistributions; // Fallback to mock for basic list view
}

export function getLPResponses(): LPResponse[] {
  if (isMockMode('backOffice')) return mockLPResponses;
  // LP responses are part of capital call responses in the API
  return mockLPResponses; // Fallback to mock for now
}

