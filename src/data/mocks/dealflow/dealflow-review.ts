export interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  askAmount: number;
  valuation: number;
  arr: number;
  growth: number;
  founderName: string;
  location: string;
  oneLiner: string;
}

export const mockDeals: Deal[] = [
  {
    id: '1',
    companyName: 'Quantum AI',
    sector: 'AI/ML',
    stage: 'Series A',
    askAmount: 15000000,
    valuation: 75000000,
    arr: 2500000,
    growth: 300,
    founderName: 'Sarah Chen',
    location: 'San Francisco, CA',
    oneLiner: 'Enterprise quantum computing platform accessible via API',
  },
  {
    id: '2',
    companyName: 'NeuroLink',
    sector: 'HealthTech',
    stage: 'Seed',
    askAmount: 3000000,
    valuation: 12000000,
    arr: 500000,
    growth: 450,
    founderName: 'Michael Rodriguez',
    location: 'Boston, MA',
    oneLiner: 'AI-powered neural diagnostics for early disease detection',
  },
];

