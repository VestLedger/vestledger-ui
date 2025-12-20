export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  subIndustry: string;
  location: string;
  founded: number;
  employees: string;
  funding: {
    total: number;
    lastRound: string;
    lastRoundAmount: number;
    lastRoundDate: string;
  };
  metrics: {
    revenue?: number;
    growth?: number;
    customers?: number;
  };
  aiMatchScore: number;
  aiReasoning: string;
  status?: 'new' | 'in_pipeline' | 'contacted';
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'NeuralFlow AI',
    description: 'Enterprise AI platform for automated document processing and workflow optimization',
    industry: 'Artificial Intelligence',
    subIndustry: 'Enterprise Software',
    location: 'San Francisco, CA',
    founded: 2021,
    employees: '50-100',
    funding: {
      total: 12_000_000,
      lastRound: 'Series A',
      lastRoundAmount: 10_000_000,
      lastRoundDate: '2023-09',
    },
    metrics: {
      revenue: 2_400_000,
      growth: 180,
      customers: 45,
    },
    aiMatchScore: 94,
    aiReasoning:
      'Strong alignment with AI/ML thesis. Exceptional revenue growth (180% YoY). Enterprise focus matches portfolio strategy. Founders have prior exits.',
    status: 'new',
  },
  {
    id: '2',
    name: 'ClimateTech Solutions',
    description: 'Carbon accounting and ESG reporting platform for Fortune 500 companies',
    industry: 'CleanTech',
    subIndustry: 'Sustainability',
    location: 'Boston, MA',
    founded: 2020,
    employees: '100-200',
    funding: {
      total: 25_000_000,
      lastRound: 'Series B',
      lastRoundAmount: 18_000_000,
      lastRoundDate: '2024-01',
    },
    metrics: {
      revenue: 5_800_000,
      growth: 120,
      customers: 85,
    },
    aiMatchScore: 87,
    aiReasoning:
      'ESG tailwinds strong. Large enterprise customer base. May be slightly outside core thesis but strategic for LP relations.',
    status: 'new',
  },
  {
    id: '3',
    name: 'SecureAuth Pro',
    description: 'Zero-trust identity and access management for distributed enterprises',
    industry: 'Cybersecurity',
    subIndustry: 'Identity Management',
    location: 'Austin, TX',
    founded: 2022,
    employees: '25-50',
    funding: {
      total: 8_000_000,
      lastRound: 'Seed',
      lastRoundAmount: 5_000_000,
      lastRoundDate: '2023-06',
    },
    metrics: {
      revenue: 1_200_000,
      growth: 250,
      customers: 28,
    },
    aiMatchScore: 91,
    aiReasoning:
      'Cybersecurity market timing excellent. Fastest growth in cohort. Technical team from Google/Meta. Seed stage aligns with Fund III mandate.',
    status: 'new',
  },
  {
    id: '4',
    name: 'PaymentStack',
    description: 'Embedded finance infrastructure for SaaS platforms',
    industry: 'FinTech',
    subIndustry: 'Payments',
    location: 'New York, NY',
    founded: 2021,
    employees: '50-100',
    funding: {
      total: 15_000_000,
      lastRound: 'Series A',
      lastRoundAmount: 12_000_000,
      lastRoundDate: '2023-11',
    },
    metrics: {
      revenue: 3_500_000,
      growth: 200,
      customers: 120,
    },
    aiMatchScore: 89,
    aiReasoning:
      'Strong FinTech fit. High transaction volume growth. API-first approach. Competitive space but differentiated positioning.',
    status: 'contacted',
  },
];

export const industries = [
  'All Industries',
  'Artificial Intelligence',
  'FinTech',
  'CleanTech',
  'Cybersecurity',
  'HealthTech',
  'Enterprise SaaS',
];

export const stages = ['All Stages', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

