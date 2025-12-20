import { isMockMode } from '@/config/data-mode';
import { mockDeals, type Deal } from '@/data/mocks/dealflow/dealflow-review';
import { getMockDealflowReviewSlides } from '@/data/mocks/dealflow/dealflow-review-slides';
import type { GetDealflowDealsParams } from '@/store/slices/dealflowSlice';

export type { Deal };

export type DealflowReviewSlideType =
  | 'overview'
  | 'team'
  | 'market'
  | 'product'
  | 'financials'
  | 'competition'
  | 'ask';

export interface DealflowReviewSlide {
  id: string;
  type: DealflowReviewSlideType;
  title: string;
  content: any;
}

export function getDealflowDeals(_params?: GetDealflowDealsParams): Deal[] {
  if (isMockMode()) return mockDeals;
  throw new Error('Dealflow review API not implemented yet');
}

export function getDealflowReviewSlides(deal: Deal): DealflowReviewSlide[] {
  if (!isMockMode()) {
    throw new Error('Dealflow review slides API not implemented yet');
  }

  return getMockDealflowReviewSlides(deal);
}
