// Mock Portfolio Data for VestLedger - Edda-inspired workflows

export interface PortfolioCompanyMetrics {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  investmentDate: string;
  initialInvestment: number;
  currentValuation: number;
  ownership: number;

  // Performance Metrics
  arr: number; // Annual Recurring Revenue
  arrGrowth: number; // percentage
  burnRate: number; // monthly
  runway: number; // months
  headcount: number;

  // Funding
  totalRaised: number;
  lastRoundDate: string;
  lastRoundAmount: number;
  lastRoundValuation: number;

  // Returns
  moic: number; // Multiple on Invested Capital
  irr: number; // Internal Rate of Return (percentage)

  // Status
  status: 'active' | 'exited' | 'at-risk' | 'under-review';
  healthScore: number; // 0-100
  lastUpdateDate: string;
}

export interface FundingRound {
  id: string;
  companyId: string;
  roundType: string;
  date: string;
  amount: number;
  valuation: number;
  leadInvestors: string[];
}

export interface PortfolioUpdate {
  id: string;
  companyId: string;
  companyName: string;
  type: 'financial' | 'product' | 'team' | 'funding' | 'milestone';
  title: string;
  description: string;
  date: string;
  author: string;
}

export interface AssetAllocation {
  sector: string;
  amount: number;
  count: number;
  percentage: number;
}

// Mock Portfolio Companies
export const portfolioCompanies: PortfolioCompanyMetrics[] = [
  {
    id: 'pc-1',
    companyName: 'Quantum AI',
    sector: 'AI/ML',
    stage: 'Series B',
    investmentDate: '2022-03-15',
    initialInvestment: 5000000,
    currentValuation: 85000000,
    ownership: 12.5,

    arr: 12500000,
    arrGrowth: 185,
    burnRate: 650000,
    runway: 18,
    headcount: 85,

    totalRaised: 35000000,
    lastRoundDate: '2024-01-20',
    lastRoundAmount: 20000000,
    lastRoundValuation: 85000000,

    moic: 3.4,
    irr: 68.5,

    status: 'active',
    healthScore: 92,
    lastUpdateDate: '2024-11-28',
  },
  {
    id: 'pc-2',
    companyName: 'BioTech Labs',
    sector: 'Healthcare',
    stage: 'Series A',
    investmentDate: '2023-06-10',
    initialInvestment: 3000000,
    currentValuation: 28000000,
    ownership: 15.2,

    arr: 4200000,
    arrGrowth: 220,
    burnRate: 380000,
    runway: 16,
    headcount: 42,

    totalRaised: 15000000,
    lastRoundDate: '2023-06-10',
    lastRoundAmount: 12000000,
    lastRoundValuation: 28000000,

    moic: 1.8,
    irr: 45.2,

    status: 'active',
    healthScore: 85,
    lastUpdateDate: '2024-11-25',
  },
  {
    id: 'pc-3',
    companyName: 'CloudScale',
    sector: 'SaaS',
    stage: 'Series B',
    investmentDate: '2021-09-22',
    initialInvestment: 8000000,
    currentValuation: 120000000,
    ownership: 10.8,

    arr: 22000000,
    arrGrowth: 156,
    burnRate: 1200000,
    runway: 14,
    headcount: 145,

    totalRaised: 58000000,
    lastRoundDate: '2023-11-15',
    lastRoundAmount: 35000000,
    lastRoundValuation: 120000000,

    moic: 2.9,
    irr: 52.3,

    status: 'active',
    healthScore: 78,
    lastUpdateDate: '2024-11-30',
  },
  {
    id: 'pc-4',
    companyName: 'FinFlow',
    sector: 'FinTech',
    stage: 'Series A',
    investmentDate: '2023-02-14',
    initialInvestment: 4500000,
    currentValuation: 42000000,
    ownership: 13.5,

    arr: 8900000,
    arrGrowth: 198,
    burnRate: 520000,
    runway: 20,
    headcount: 67,

    totalRaised: 22000000,
    lastRoundDate: '2023-02-14',
    lastRoundAmount: 18000000,
    lastRoundValuation: 42000000,

    moic: 2.1,
    irr: 58.7,

    status: 'active',
    healthScore: 88,
    lastUpdateDate: '2024-11-27',
  },
  {
    id: 'pc-5',
    companyName: 'DataStream',
    sector: 'Analytics',
    stage: 'Seed',
    investmentDate: '2024-04-01',
    initialInvestment: 1500000,
    currentValuation: 12000000,
    ownership: 18.0,

    arr: 1800000,
    arrGrowth: 310,
    burnRate: 180000,
    runway: 22,
    headcount: 25,

    totalRaised: 5000000,
    lastRoundDate: '2024-04-01',
    lastRoundAmount: 5000000,
    lastRoundValuation: 12000000,

    moic: 1.2,
    irr: 35.8,

    status: 'active',
    healthScore: 81,
    lastUpdateDate: '2024-11-29',
  },
  {
    id: 'pc-6',
    companyName: 'EcoEnergy',
    sector: 'CleanTech',
    stage: 'Series B',
    investmentDate: '2022-11-08',
    initialInvestment: 6000000,
    currentValuation: 95000000,
    ownership: 11.2,

    arr: 15000000,
    arrGrowth: 142,
    burnRate: 850000,
    runway: 16,
    headcount: 98,

    totalRaised: 45000000,
    lastRoundDate: '2024-06-20',
    lastRoundAmount: 25000000,
    lastRoundValuation: 95000000,

    moic: 2.6,
    irr: 48.9,

    status: 'active',
    healthScore: 83,
    lastUpdateDate: '2024-11-26',
  },
  {
    id: 'pc-7',
    companyName: 'DevTools Pro',
    sector: 'Developer Tools',
    stage: 'Series A',
    investmentDate: '2023-08-15',
    initialInvestment: 3500000,
    currentValuation: 32000000,
    ownership: 14.8,

    arr: 6500000,
    arrGrowth: 175,
    burnRate: 420000,
    runway: 18,
    headcount: 52,

    totalRaised: 18000000,
    lastRoundDate: '2023-08-15',
    lastRoundAmount: 15000000,
    lastRoundValuation: 32000000,

    moic: 1.9,
    irr: 52.1,

    status: 'active',
    healthScore: 86,
    lastUpdateDate: '2024-11-28',
  },
  {
    id: 'pc-8',
    companyName: 'HealthConnect',
    sector: 'Healthcare',
    stage: 'Seed',
    investmentDate: '2024-01-10',
    initialInvestment: 2000000,
    currentValuation: 15000000,
    ownership: 16.5,

    arr: 2200000,
    arrGrowth: 285,
    burnRate: 220000,
    runway: 20,
    headcount: 32,

    totalRaised: 6000000,
    lastRoundDate: '2024-01-10',
    lastRoundAmount: 6000000,
    lastRoundValuation: 15000000,

    moic: 1.3,
    irr: 42.3,

    status: 'active',
    healthScore: 79,
    lastUpdateDate: '2024-11-30',
  },
];

// Mock Funding Rounds
export const fundingRounds: FundingRound[] = [
  {
    id: 'fr-1',
    companyId: 'pc-1',
    roundType: 'Series B',
    date: '2024-01-20',
    amount: 20000000,
    valuation: 85000000,
    leadInvestors: ['Sequoia Capital', 'Andreessen Horowitz'],
  },
  {
    id: 'fr-2',
    companyId: 'pc-1',
    roundType: 'Series A',
    date: '2022-03-15',
    amount: 10000000,
    valuation: 35000000,
    leadInvestors: ['Accel Partners'],
  },
  {
    id: 'fr-3',
    companyId: 'pc-3',
    roundType: 'Series B',
    date: '2023-11-15',
    amount: 35000000,
    valuation: 120000000,
    leadInvestors: ['Tiger Global', 'Insight Partners'],
  },
  {
    id: 'fr-4',
    companyId: 'pc-6',
    roundType: 'Series B',
    date: '2024-06-20',
    amount: 25000000,
    valuation: 95000000,
    leadInvestors: ['Breakthrough Energy Ventures', 'Bill Gates'],
  },
];

// Mock Portfolio Updates
export const portfolioUpdates: PortfolioUpdate[] = [
  {
    id: 'pu-1',
    companyId: 'pc-1',
    companyName: 'Quantum AI',
    type: 'milestone',
    title: 'Reached 1M Active Users',
    description: 'Platform crossed 1 million active users milestone, 3 months ahead of schedule. User engagement metrics exceed industry benchmarks by 40%.',
    date: '2024-11-28',
    author: 'Sarah Chen, CEO',
  },
  {
    id: 'pu-2',
    companyId: 'pc-4',
    companyName: 'FinFlow',
    type: 'product',
    title: 'Launched Enterprise Edition',
    description: 'Successfully launched enterprise-grade platform with advanced security features. Already secured 3 Fortune 500 customers in beta.',
    date: '2024-11-27',
    author: 'Mike Johnson, CPO',
  },
  {
    id: 'pu-3',
    companyId: 'pc-2',
    companyName: 'BioTech Labs',
    type: 'funding',
    title: 'Preparing Series B Round',
    description: 'Beginning Series B fundraising process. Target raise of $30M at $100M pre-money valuation. Strong investor interest from healthcare-focused VCs.',
    date: '2024-11-25',
    author: 'Dr. James Wilson, CFO',
  },
  {
    id: 'pu-4',
    companyId: 'pc-3',
    companyName: 'CloudScale',
    type: 'financial',
    title: 'Q4 Financial Update',
    description: 'ARR grew 42% QoQ to $22M. Net dollar retention at 135%. Gross margins improved to 78%. On track for cash flow positive by Q2 2025.',
    date: '2024-11-30',
    author: 'Maria Rodriguez, CFO',
  },
  {
    id: 'pu-5',
    companyId: 'pc-5',
    companyName: 'DataStream',
    type: 'team',
    title: 'Key Executive Hires',
    description: 'Hired VP of Sales from Snowflake and VP of Engineering from Databricks. Both bring 15+ years of experience scaling data companies.',
    date: '2024-11-29',
    author: 'Alex Kim, CEO',
  },
  {
    id: 'pu-6',
    companyId: 'pc-7',
    companyName: 'DevTools Pro',
    type: 'product',
    title: 'AI Code Assistant Beta Launch',
    description: 'Launched AI-powered code assistant in beta. Early metrics show 35% improvement in developer productivity. 5,000 waitlist signups in first week.',
    date: '2024-11-28',
    author: 'David Lee, CTO',
  },
];

// Asset Allocation by Sector
export const assetAllocation: AssetAllocation[] = [
  { sector: 'AI/ML', amount: 5000000, count: 1, percentage: 15.15 },
  { sector: 'SaaS', amount: 8000000, count: 1, percentage: 24.24 },
  { sector: 'FinTech', amount: 4500000, count: 1, percentage: 13.64 },
  { sector: 'Healthcare', amount: 5000000, count: 2, percentage: 15.15 },
  { sector: 'CleanTech', amount: 6000000, count: 1, percentage: 18.18 },
  { sector: 'Analytics', amount: 1500000, count: 1, percentage: 4.55 },
  { sector: 'Developer Tools', amount: 3500000, count: 1, percentage: 10.61 },
];

// Portfolio Summary Metrics
export const portfolioSummary = {
  totalCompanies: portfolioCompanies.length,
  totalInvested: portfolioCompanies.reduce((sum, c) => sum + c.initialInvestment, 0),
  totalCurrentValue: portfolioCompanies.reduce((sum, c) => sum + (c.currentValuation * c.ownership / 100), 0),
  averageMOIC: portfolioCompanies.reduce((sum, c) => sum + c.moic, 0) / portfolioCompanies.length,
  averageIRR: portfolioCompanies.reduce((sum, c) => sum + c.irr, 0) / portfolioCompanies.length,
  activeCompanies: portfolioCompanies.filter(c => c.status === 'active').length,
  averageHealthScore: portfolioCompanies.reduce((sum, c) => sum + c.healthScore, 0) / portfolioCompanies.length,
};

// Mock Performance Data for Charts
export const performanceData = [
  { month: 'Jan 2024', portfolioValue: 125000000, deployed: 28000000 },
  { month: 'Feb 2024', portfolioValue: 132000000, deployed: 29500000 },
  { month: 'Mar 2024', portfolioValue: 138000000, deployed: 29500000 },
  { month: 'Apr 2024', portfolioValue: 145000000, deployed: 31000000 },
  { month: 'May 2024', portfolioValue: 152000000, deployed: 31000000 },
  { month: 'Jun 2024', portfolioValue: 158000000, deployed: 31000000 },
  { month: 'Jul 2024', portfolioValue: 165000000, deployed: 31000000 },
  { month: 'Aug 2024', portfolioValue: 172000000, deployed: 33500000 },
  { month: 'Sep 2024', portfolioValue: 178000000, deployed: 33500000 },
  { month: 'Oct 2024', portfolioValue: 185000000, deployed: 33500000 },
  { month: 'Nov 2024', portfolioValue: 192000000, deployed: 33500000 },
  { month: 'Dec 2024', portfolioValue: 198000000, deployed: 33500000 },
];
