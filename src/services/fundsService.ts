import type { Fund } from '@/types/fund';
import type { GetFundsParams } from '@/store/slices/fundSlice';
import { isMockMode } from '@/config/data-mode';
import { mockFunds } from '@/data/mocks/funds';

/**
 * Fetch funds with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export async function fetchFunds(params: GetFundsParams): Promise<Fund[]> {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Filter/sort by params (status, type, etc.)
    return mockFunds;
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_FUNDS, variables: params })
  throw new Error('Funds API not implemented yet');
}
