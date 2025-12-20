/**
 * Standard parameter patterns for all services
 * GraphQL-ready even in mock mode
 */

export interface BasePaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string; // For cursor-based pagination
}

export interface BaseFilterParams {
  fundId?: string | null;
  search?: string;
  status?: string;
  dateFrom?: string; // ISO date
  dateTo?: string;
}

export interface BaseSortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Combined standard params for most queries
 */
export interface StandardQueryParams
  extends BasePaginationParams,
    BaseFilterParams,
    BaseSortParams {}

/**
 * Helper to extract fundId from params or state
 */
export function extractFundId(params: { fundId?: string | null }): string | null {
  return params.fundId ?? null;
}
