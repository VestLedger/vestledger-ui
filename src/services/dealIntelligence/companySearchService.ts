import { isMockMode } from '@/config/data-mode';
import {
  industries,
  mockCompanies,
  stages,
  type Company,
} from '@/data/mocks/deal-intelligence/company-search';
import type { PipelineApiDeal } from '@/services/shared/pipelineGateway';
import { fetchPipelineDealsFromApi } from '@/services/shared/pipelineGateway';

type CompanySearchApiSnapshot = {
  companies: Company[];
  industries: string[];
  stages: string[];
};

let snapshotPromise: Promise<CompanySearchApiSnapshot> | null = null;

const demoLocations = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Boston, MA',
  'Seattle, WA',
  'Los Angeles, CA',
  'Chicago, IL',
];

function deriveEmployees(probability: number): string {
  if (probability >= 85) return '100-200';
  if (probability >= 70) return '50-100';
  if (probability >= 50) return '25-50';
  return '10-25';
}

function mapDealToCompany(apiDeal: PipelineApiDeal, index: number): Company {
  const probability = Number.isFinite(apiDeal.probability) ? apiDeal.probability : 50;
  const fundingBase = Math.max(1_000_000, apiDeal.amount);
  const aiMatchScore = Math.max(65, Math.min(98, Math.round(probability + 15)));

  return {
    id: apiDeal.id,
    name: apiDeal.name,
    description: `${apiDeal.sector} company currently at ${apiDeal.stage} with ${Math.round(probability)}% pipeline confidence.`,
    industry: apiDeal.sector,
    subIndustry: `${apiDeal.stage} Opportunity`,
    location: demoLocations[index % demoLocations.length],
    founded: 2017 + (index % 8),
    employees: deriveEmployees(probability),
    funding: {
      total: Math.round(fundingBase * 1.8),
      lastRound: apiDeal.stage,
      lastRoundAmount: Math.round(fundingBase),
      lastRoundDate: new Date().toISOString().slice(0, 7),
    },
    metrics: {
      revenue: Math.round(fundingBase * 0.35),
      growth: Math.max(20, Math.round(probability * 1.7)),
      customers: Math.max(10, Math.round(probability * 1.5)),
    },
    aiMatchScore,
    aiReasoning: `Pipeline score ${Math.round(probability)} with strong ${apiDeal.sector} thesis alignment.`,
    status: probability >= 80 ? 'in_pipeline' : 'new',
  };
}

async function buildApiSnapshot(): Promise<CompanySearchApiSnapshot> {
  const apiDeals = await fetchPipelineDealsFromApi({ limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' });
  const companies = apiDeals.map((deal, index) => mapDealToCompany(deal, index));

  const derivedIndustries = [
    'All Industries',
    ...Array.from(new Set(companies.map((company) => company.industry))),
  ];
  const derivedStages = [
    'All Stages',
    ...Array.from(new Set(companies.map((company) => company.funding.lastRound))),
  ];

  return {
    companies,
    industries: derivedIndustries,
    stages: derivedStages,
  };
}

async function getApiSnapshot(): Promise<CompanySearchApiSnapshot> {
  if (!snapshotPromise) {
    snapshotPromise = buildApiSnapshot();
    snapshotPromise.finally(() => {
      snapshotPromise = null;
    });
  }

  return snapshotPromise;
}

export async function getCompanySearchIndustries(): Promise<string[]> {
  if (isMockMode('companySearch')) return industries;
  const snapshot = await getApiSnapshot();
  return snapshot.industries;
}

export async function getCompanySearchStages(): Promise<string[]> {
  if (isMockMode('companySearch')) return stages;
  const snapshot = await getApiSnapshot();
  return snapshot.stages;
}

export async function getCompanySearchCompanies(): Promise<Company[]> {
  if (isMockMode('companySearch')) return mockCompanies;
  const snapshot = await getApiSnapshot();
  return snapshot.companies;
}
