import { isMockMode } from '@/config/data-mode';
import {
  activeDeals,
  mockDocuments,
  documentCategories,
  fundAnalytics,
  dealAnalyticsData,
} from '@/data/mocks/deal-intelligence/deal-intelligence';
import type { GetDealIntelligenceParams } from '@/store/slices/dealIntelligenceSlice';

// Re-export types for consumers
export type {
  ActiveDeal,
  Document,
  DealAnalytics,
  FundAnalytics,
  DocumentCategory,
  DocumentStatus,
  ICStatus,
} from '@/data/mocks/deal-intelligence/deal-intelligence';

export function getDealIntelligenceData(params: GetDealIntelligenceParams) {
  if (isMockMode('dealIntelligence')) {
    // Mock mode: Accept params but return static data
    // Future: Apply pagination/sorting
    return {
      activeDeals,
      dealAnalyticsData,
      documentCategories,
      fundAnalytics,
      documents: mockDocuments,
    };
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_DEAL_INTELLIGENCE, variables: params })
  throw new Error('Deal intelligence API not implemented yet');
}
