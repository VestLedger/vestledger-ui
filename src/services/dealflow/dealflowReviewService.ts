import { isMockMode } from '@/config/data-mode';
import { mockDeals, type Deal } from '@/data/mocks/dealflow/dealflow-review';
import { getMockDealflowReviewSlides } from '@/data/mocks/dealflow/dealflow-review-slides';
import type { GetDealflowDealsParams } from '@/store/slices/dealflowSlice';
import type { PipelineApiDeal } from '@/services/shared/pipelineGateway';
import { fetchPipelineDealsFromApi } from '@/services/shared/pipelineGateway';

export type { Deal };

export type DealflowReviewSlideType =
  | 'overview'
  | 'team'
  | 'market'
  | 'product'
  | 'financials'
  | 'competition'
  | 'ask';

export interface DealflowOverviewContent {
  companyName: string;
  oneLiner: string;
  founder: string;
  location: string;
  sector: string;
  stage: string;
}

export interface DealflowMarketContent {
  tam: string;
  sam: string;
  som: string;
  growth: string;
  competitors: string[];
}

export interface DealflowProductContent {
  description: string;
  differentiators: string[];
  techStack: string[];
}

export interface DealflowFinancialsContent {
  arr: number;
  growth: number;
  burn: number;
  runway: number;
  ltv: number;
  cac: number;
  grossMargin: number;
}

export interface DealflowTeamMember {
  name: string;
  role: string;
  background: string;
}

export interface DealflowTeamContent {
  founder: string;
  team: DealflowTeamMember[];
  advisors: string[];
}

export interface DealflowAskContent {
  amount: number;
  valuation: number;
  useOfFunds: Array<{
    category: string;
    percentage: number;
  }>;
}

export interface DealflowCompetitionContent {
  competitors: string[];
  differentiation: string;
}

export type DealflowReviewSlide =
  | { id: string; type: 'overview'; title: string; content: DealflowOverviewContent }
  | { id: string; type: 'market'; title: string; content: DealflowMarketContent }
  | { id: string; type: 'product'; title: string; content: DealflowProductContent }
  | { id: string; type: 'financials'; title: string; content: DealflowFinancialsContent }
  | { id: string; type: 'team'; title: string; content: DealflowTeamContent }
  | { id: string; type: 'ask'; title: string; content: DealflowAskContent }
  | { id: string; type: 'competition'; title: string; content: DealflowCompetitionContent };

const demoLocations = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Boston, MA',
  'Seattle, WA',
  'Chicago, IL',
  'Los Angeles, CA',
];

function mapPipelineStageToFundingRound(stage: string): string {
  const normalized = stage.trim().toLowerCase();

  if (normalized === 'sourced') return 'Pre-Seed';
  if (normalized === 'first meeting') return 'Seed';
  if (normalized === 'due diligence') return 'Series A';
  if (normalized === 'term sheet') return 'Series B';
  if (normalized === 'closed') return 'Series C';

  return stage;
}

function mapPipelineDealToReviewDeal(apiDeal: PipelineApiDeal, index: number): Deal {
  const askAmount = Math.max(apiDeal.amount, 500_000);
  const probability = Number.isFinite(apiDeal.probability) ? apiDeal.probability : 50;
  const growth = Math.max(70, Math.min(500, Math.round(probability * 2.2)));
  const arr = Math.round(askAmount * Math.max(probability / 100, 0.15) * 0.35);

  return {
    id: apiDeal.id,
    companyName: apiDeal.name,
    sector: apiDeal.sector,
    stage: mapPipelineStageToFundingRound(apiDeal.stage),
    askAmount,
    valuation: Math.round(askAmount * 4.5),
    arr,
    growth,
    founderName: apiDeal.founder,
    location: demoLocations[index % demoLocations.length],
    oneLiner: `${apiDeal.sector} company at ${apiDeal.stage} with ${Math.round(probability)}% IC confidence.`,
  };
}

export async function getDealflowDeals(params: GetDealflowDealsParams = {}): Promise<Deal[]> {
  if (isMockMode('dealflow')) return mockDeals;

  const apiDeals = await fetchPipelineDealsFromApi({
    fundId: params.fundId,
    search: params.search,
    limit: params.limit,
    offset: params.offset,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  return apiDeals
    .filter((deal) => (deal.outcome ?? 'active') === 'active')
    .map((deal, index) => mapPipelineDealToReviewDeal(deal, index));
}

export function getDealflowReviewSlides(deal: Deal): DealflowReviewSlide[] {
  return getMockDealflowReviewSlides(deal);
}
