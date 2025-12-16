import { isMockMode } from '@/config/data-mode';
import { mockDeals, type Deal } from '@/data/mocks/dealflow/dealflow-review';

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

export function getDealflowDeals(): Deal[] {
  if (isMockMode()) return mockDeals;
  throw new Error('Dealflow review API not implemented yet');
}

export function getDealflowReviewSlides(deal: Deal): DealflowReviewSlide[] {
  if (!isMockMode()) {
    throw new Error('Dealflow review slides API not implemented yet');
  }

  return [
    {
      id: '1',
      type: 'overview',
      title: 'Company Overview',
      content: {
        companyName: deal.companyName,
        oneLiner: deal.oneLiner,
        founder: deal.founderName,
        location: deal.location,
        sector: deal.sector,
        stage: deal.stage,
      },
    },
    {
      id: '2',
      type: 'market',
      title: 'Market Opportunity',
      content: {
        tam: '$50B',
        sam: '$15B',
        som: '$2B',
        growth: '25% CAGR',
        competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      },
    },
    {
      id: '3',
      type: 'product',
      title: 'Product & Technology',
      content: {
        description: 'Hybrid quantum-classical computing platform',
        differentiators: ['API-first approach', 'Enterprise security', 'Easy integration'],
        techStack: ['Quantum algorithms', 'Cloud infrastructure', 'RESTful APIs'],
      },
    },
    {
      id: '4',
      type: 'financials',
      title: 'Financial Metrics',
      content: {
        arr: deal.arr,
        growth: deal.growth,
        burn: 400000,
        runway: 18,
        ltv: 250000,
        cac: 50000,
        grossMargin: 75,
      },
    },
    {
      id: '5',
      type: 'team',
      title: 'Team',
      content: {
        founder: deal.founderName,
        team: [
          { name: 'Sarah Chen', role: 'CEO', background: 'Stanford PhD, ex-Google' },
          { name: 'David Kim', role: 'CTO', background: 'MIT PhD, ex-IBM Quantum' },
          { name: 'Lisa Wang', role: 'VP Sales', background: 'ex-Salesforce, 15yr enterprise' },
        ],
        advisors: ['Prof. John Smith (Stanford)', 'Dr. Emily Brown (MIT)'],
      },
    },
    {
      id: '6',
      type: 'ask',
      title: 'Investment Ask',
      content: {
        amount: deal.askAmount,
        valuation: deal.valuation,
        useOfFunds: [
          { category: 'Product Development', percentage: 40 },
          { category: 'Sales & Marketing', percentage: 35 },
          { category: 'Operations', percentage: 15 },
          { category: 'Hiring', percentage: 10 },
        ],
      },
    },
  ];
}
