// Mock Fund Analytics Data for VestLedger - Deep Analytics & Performance Metrics

export interface FundMetrics {
  fundId: string;
  fundName: string;
  vintage: number;
  fundSize: number;
  deployed: number;
  reserved: number;

  // Fund Performance Metrics
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Residual Value to Paid-In
  irr: number; // Internal Rate of Return
  moic: number; // Multiple on Invested Capital

  // Deployment
  numberOfInvestments: number;
  averageInvestmentSize: number;
  deploymentRate: number; // percentage of fund deployed

  // Status
  fundStatus: 'fundraising' | 'investing' | 'harvesting' | 'liquidating';
  remainingLife: number; // years
}

export interface JCurveDataPoint {
  quartersSinceInception: number;
  quarter: string;
  cumulativeIRR: number;
  cumulativeMOIC: number;
  netCashFlow: number; // negative in early years, positive later
  cumulativeValue: number;
}

export interface CohortPerformance {
  cohort: string; // e.g., "2020 Vintage", "Series A", "SaaS"
  count: number;
  totalInvested: number;
  currentValue: number;
  moic: number;
  irr: number;
  tvpi: number;
  dpi: number;
  percentageExited: number;
}

export interface ValuationTrend {
  date: string;
  portfolioValue: number;
  unrealizedValue: number;
  realizedValue: number;
  deployedCapital: number;
  tvpi: number;
}

export interface DeploymentPacing {
  quarter: string;
  deployed: number;
  numberOfDeals: number;
  averageDealSize: number;
  cumulativeDeployed: number;
  percentageOfFund: number;
}

export interface ConcentrationMetric {
  category: string;
  dimension: string; // "Company", "Sector", "Stage", "Geography"
  value: number;
  percentage: number;
  count?: number;
}

export interface BenchmarkComparison {
  metric: string;
  vestledgerValue: number;
  industryMedian: number;
  topQuartile: number;
  bottomQuartile: number;
}

// Main Fund Data
export const currentFund: FundMetrics = {
  fundId: 'fund-1',
  fundName: 'VestLedger Fund I',
  vintage: 2021,
  fundSize: 100000000,
  deployed: 33500000,
  reserved: 25000000,

  tvpi: 1.92,
  dpi: 0.28,
  rvpi: 1.64,
  irr: 42.3,
  moic: 2.15,

  numberOfInvestments: 8,
  averageInvestmentSize: 4187500,
  deploymentRate: 33.5,

  fundStatus: 'investing',
  remainingLife: 7.2,
};

// J-Curve Data (Quarterly since fund inception)
export const jCurveData: JCurveDataPoint[] = [
  { quartersSinceInception: 0, quarter: 'Q1 2021', cumulativeIRR: -100, cumulativeMOIC: 0.0, netCashFlow: -5000000, cumulativeValue: -5000000 },
  { quartersSinceInception: 1, quarter: 'Q2 2021', cumulativeIRR: -85, cumulativeMOIC: 0.15, netCashFlow: -4000000, cumulativeValue: -8500000 },
  { quartersSinceInception: 2, quarter: 'Q3 2021', cumulativeIRR: -65, cumulativeMOIC: 0.35, netCashFlow: -3500000, cumulativeValue: -11200000 },
  { quartersSinceInception: 3, quarter: 'Q4 2021', cumulativeIRR: -45, cumulativeMOIC: 0.55, netCashFlow: -3000000, cumulativeValue: -13000000 },
  { quartersSinceInception: 4, quarter: 'Q1 2022', cumulativeIRR: -28, cumulativeMOIC: 0.72, netCashFlow: -2500000, cumulativeValue: -13800000 },
  { quartersSinceInception: 5, quarter: 'Q2 2022', cumulativeIRR: -15, cumulativeMOIC: 0.85, netCashFlow: -2000000, cumulativeValue: -14200000 },
  { quartersSinceInception: 6, quarter: 'Q3 2022', cumulativeIRR: -8, cumulativeMOIC: 0.92, netCashFlow: -1800000, cumulativeValue: -13500000 },
  { quartersSinceInception: 7, quarter: 'Q4 2022', cumulativeIRR: -2, cumulativeMOIC: 0.98, netCashFlow: -1500000, cumulativeValue: -12000000 },
  { quartersSinceInception: 8, quarter: 'Q1 2023', cumulativeIRR: 5, cumulativeMOIC: 1.05, netCashFlow: -1000000, cumulativeValue: -9500000 },
  { quartersSinceInception: 9, quarter: 'Q2 2023', cumulativeIRR: 12, cumulativeMOIC: 1.12, netCashFlow: -800000, cumulativeValue: -6800000 },
  { quartersSinceInception: 10, quarter: 'Q3 2023', cumulativeIRR: 18, cumulativeMOIC: 1.18, netCashFlow: 500000, cumulativeValue: -4200000 },
  { quartersSinceInception: 11, quarter: 'Q4 2023', cumulativeIRR: 24, cumulativeMOIC: 1.24, netCashFlow: 1200000, cumulativeValue: -1800000 },
  { quartersSinceInception: 12, quarter: 'Q1 2024', cumulativeIRR: 28, cumulativeMOIC: 1.38, netCashFlow: 2000000, cumulativeValue: 1500000 },
  { quartersSinceInception: 13, quarter: 'Q2 2024', cumulativeIRR: 32, cumulativeMOIC: 1.52, netCashFlow: 2500000, cumulativeValue: 5200000 },
  { quartersSinceInception: 14, quarter: 'Q3 2024', cumulativeIRR: 37, cumulativeMOIC: 1.72, netCashFlow: 3200000, cumulativeValue: 10500000 },
  { quartersSinceInception: 15, quarter: 'Q4 2024', cumulativeIRR: 42.3, cumulativeMOIC: 1.92, netCashFlow: 4000000, cumulativeValue: 16800000 },
];

// Cohort Analysis by Vintage Year
export const cohortsByVintage: CohortPerformance[] = [
  { cohort: '2021 Vintage', count: 3, totalInvested: 14000000, currentValue: 31500000, moic: 2.25, irr: 48.5, tvpi: 2.25, dpi: 0.15, percentageExited: 0 },
  { cohort: '2022 Vintage', count: 2, totalInvested: 11000000, currentValue: 23800000, moic: 2.16, irr: 52.1, tvpi: 2.16, dpi: 0.22, percentageExited: 0 },
  { cohort: '2023 Vintage', count: 2, totalInvested: 7500000, currentValue: 14200000, moic: 1.89, irr: 45.8, tvpi: 1.89, dpi: 0.18, percentageExited: 0 },
  { cohort: '2024 Vintage', count: 1, totalInvested: 1500000, currentValue: 2100000, moic: 1.40, irr: 38.2, tvpi: 1.40, dpi: 0.05, percentageExited: 0 },
];

// Cohort Analysis by Stage
export const cohortsByStage: CohortPerformance[] = [
  { cohort: 'Seed', count: 2, totalInvested: 3500000, currentValue: 6300000, moic: 1.80, irr: 42.5, tvpi: 1.80, dpi: 0.12, percentageExited: 0 },
  { cohort: 'Series A', count: 4, totalInvested: 14500000, currentValue: 29800000, moic: 2.06, irr: 48.2, tvpi: 2.06, dpi: 0.28, percentageExited: 0 },
  { cohort: 'Series B', count: 2, totalInvested: 14000000, currentValue: 28200000, moic: 2.01, irr: 45.8, tvpi: 2.01, dpi: 0.15, percentageExited: 0 },
];

// Cohort Analysis by Sector
export const cohortsBySector: CohortPerformance[] = [
  { cohort: 'SaaS', count: 1, totalInvested: 8000000, currentValue: 18500000, moic: 2.31, irr: 52.3, tvpi: 2.31, dpi: 0.42, percentageExited: 0 },
  { cohort: 'FinTech', count: 1, totalInvested: 4500000, currentValue: 9800000, moic: 2.18, irr: 58.7, tvpi: 2.18, dpi: 0.35, percentageExited: 0 },
  { cohort: 'Healthcare', count: 2, totalInvested: 5000000, currentValue: 10200000, moic: 2.04, irr: 46.8, tvpi: 2.04, dpi: 0.18, percentageExited: 0 },
  { cohort: 'AI/ML', count: 1, totalInvested: 5000000, currentValue: 12800000, moic: 2.56, irr: 68.5, tvpi: 2.56, dpi: 0.22, percentageExited: 0 },
  { cohort: 'CleanTech', count: 1, totalInvested: 6000000, currentValue: 12400000, moic: 2.07, irr: 48.9, tvpi: 2.07, dpi: 0.15, percentageExited: 0 },
  { cohort: 'Developer Tools', count: 1, totalInvested: 3500000, currentValue: 7200000, moic: 2.06, irr: 52.1, tvpi: 2.06, dpi: 0.28, percentageExited: 0 },
  { cohort: 'Analytics', count: 1, totalInvested: 1500000, currentValue: 2100000, moic: 1.40, irr: 35.8, tvpi: 1.40, dpi: 0.05, percentageExited: 0 },
];

// Portfolio Valuation Trends (Quarterly)
export const valuationTrends: ValuationTrend[] = [
  { date: 'Q1 2021', portfolioValue: 5000000, unrealizedValue: 5000000, realizedValue: 0, deployedCapital: 5000000, tvpi: 1.00 },
  { date: 'Q2 2021', portfolioValue: 9200000, unrealizedValue: 9200000, realizedValue: 0, deployedCapital: 9000000, tvpi: 1.02 },
  { date: 'Q3 2021', portfolioValue: 13800000, unrealizedValue: 13800000, realizedValue: 0, deployedCapital: 12500000, tvpi: 1.10 },
  { date: 'Q4 2021', portfolioValue: 18500000, unrealizedValue: 18500000, realizedValue: 0, deployedCapital: 14500000, tvpi: 1.28 },
  { date: 'Q1 2022', portfolioValue: 22800000, unrealizedValue: 22500000, realizedValue: 300000, deployedCapital: 19000000, tvpi: 1.20 },
  { date: 'Q2 2022', portfolioValue: 27200000, unrealizedValue: 26800000, realizedValue: 400000, deployedCapital: 22500000, tvpi: 1.21 },
  { date: 'Q3 2022', portfolioValue: 31500000, unrealizedValue: 30800000, realizedValue: 700000, deployedCapital: 25000000, tvpi: 1.26 },
  { date: 'Q4 2022', portfolioValue: 35800000, unrealizedValue: 34500000, realizedValue: 1300000, deployedCapital: 28000000, tvpi: 1.28 },
  { date: 'Q1 2023', portfolioValue: 40200000, unrealizedValue: 38200000, realizedValue: 2000000, deployedCapital: 29500000, tvpi: 1.36 },
  { date: 'Q2 2023', portfolioValue: 44800000, unrealizedValue: 42000000, realizedValue: 2800000, deployedCapital: 31000000, tvpi: 1.45 },
  { date: 'Q3 2023', portfolioValue: 49500000, unrealizedValue: 46000000, realizedValue: 3500000, deployedCapital: 31000000, tvpi: 1.60 },
  { date: 'Q4 2023', portfolioValue: 54200000, unrealizedValue: 49800000, realizedValue: 4400000, deployedCapital: 31000000, tvpi: 1.75 },
  { date: 'Q1 2024', portfolioValue: 58800000, unrealizedValue: 53200000, realizedValue: 5600000, deployedCapital: 31000000, tvpi: 1.90 },
  { date: 'Q2 2024', portfolioValue: 62500000, unrealizedValue: 55800000, realizedValue: 6700000, deployedCapital: 33500000, tvpi: 1.87 },
  { date: 'Q3 2024', portfolioValue: 66200000, unrealizedValue: 58500000, realizedValue: 7700000, deployedCapital: 33500000, tvpi: 1.98 },
  { date: 'Q4 2024', portfolioValue: 70800000, unrealizedValue: 61400000, realizedValue: 9400000, deployedCapital: 33500000, tvpi: 2.11 },
];

// Deployment Pacing
export const deploymentPacing: DeploymentPacing[] = [
  { quarter: 'Q1 2021', deployed: 5000000, numberOfDeals: 1, averageDealSize: 5000000, cumulativeDeployed: 5000000, percentageOfFund: 5.0 },
  { quarter: 'Q2 2021', deployed: 4000000, numberOfDeals: 1, averageDealSize: 4000000, cumulativeDeployed: 9000000, percentageOfFund: 9.0 },
  { quarter: 'Q3 2021', deployed: 3500000, numberOfDeals: 1, averageDealSize: 3500000, cumulativeDeployed: 12500000, percentageOfFund: 12.5 },
  { quarter: 'Q4 2021', deployed: 2000000, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 14500000, percentageOfFund: 14.5 },
  { quarter: 'Q1 2022', deployed: 4500000, numberOfDeals: 1, averageDealSize: 4500000, cumulativeDeployed: 19000000, percentageOfFund: 19.0 },
  { quarter: 'Q2 2022', deployed: 3500000, numberOfDeals: 1, averageDealSize: 3500000, cumulativeDeployed: 22500000, percentageOfFund: 22.5 },
  { quarter: 'Q3 2022', deployed: 2500000, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 25000000, percentageOfFund: 25.0 },
  { quarter: 'Q4 2022', deployed: 3000000, numberOfDeals: 1, averageDealSize: 3000000, cumulativeDeployed: 28000000, percentageOfFund: 28.0 },
  { quarter: 'Q1 2023', deployed: 1500000, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 29500000, percentageOfFund: 29.5 },
  { quarter: 'Q2 2023', deployed: 1500000, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 31000000, percentageOfFund: 31.0 },
  { quarter: 'Q3 2023', deployed: 0, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 31000000, percentageOfFund: 31.0 },
  { quarter: 'Q4 2023', deployed: 0, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 31000000, percentageOfFund: 31.0 },
  { quarter: 'Q1 2024', deployed: 0, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 31000000, percentageOfFund: 31.0 },
  { quarter: 'Q2 2024', deployed: 2500000, numberOfDeals: 1, averageDealSize: 2500000, cumulativeDeployed: 33500000, percentageOfFund: 33.5 },
  { quarter: 'Q3 2024', deployed: 0, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 33500000, percentageOfFund: 33.5 },
  { quarter: 'Q4 2024', deployed: 0, numberOfDeals: 0, averageDealSize: 0, cumulativeDeployed: 33500000, percentageOfFund: 33.5 },
];

// Concentration Risk Analysis
export const concentrationByCompany: ConcentrationMetric[] = [
  { category: 'CloudScale', dimension: 'Company', value: 8000000, percentage: 23.88, count: 1 },
  { category: 'EcoEnergy', dimension: 'Company', value: 6000000, percentage: 17.91, count: 1 },
  { category: 'Quantum AI', dimension: 'Company', value: 5000000, percentage: 14.93, count: 1 },
  { category: 'FinFlow', dimension: 'Company', value: 4500000, percentage: 13.43, count: 1 },
  { category: 'DevTools Pro', dimension: 'Company', value: 3500000, percentage: 10.45, count: 1 },
  { category: 'BioTech Labs', dimension: 'Company', value: 3000000, percentage: 8.96, count: 1 },
  { category: 'HealthConnect', dimension: 'Company', value: 2000000, percentage: 5.97, count: 1 },
  { category: 'DataStream', dimension: 'Company', value: 1500000, percentage: 4.48, count: 1 },
];

export const concentrationBySector: ConcentrationMetric[] = [
  { category: 'SaaS', dimension: 'Sector', value: 8000000, percentage: 23.88, count: 1 },
  { category: 'CleanTech', dimension: 'Sector', value: 6000000, percentage: 17.91, count: 1 },
  { category: 'AI/ML', dimension: 'Sector', value: 5000000, percentage: 14.93, count: 1 },
  { category: 'Healthcare', dimension: 'Sector', value: 5000000, percentage: 14.93, count: 2 },
  { category: 'FinTech', dimension: 'Sector', value: 4500000, percentage: 13.43, count: 1 },
  { category: 'Developer Tools', dimension: 'Sector', value: 3500000, percentage: 10.45, count: 1 },
  { category: 'Analytics', dimension: 'Sector', value: 1500000, percentage: 4.48, count: 1 },
];

export const concentrationByStage: ConcentrationMetric[] = [
  { category: 'Series A', dimension: 'Stage', value: 14500000, percentage: 43.28, count: 4 },
  { category: 'Series B', dimension: 'Stage', value: 14000000, percentage: 41.79, count: 2 },
  { category: 'Seed', dimension: 'Stage', value: 5000000, percentage: 14.93, count: 2 },
];

// Benchmark Comparison
export const benchmarkData: BenchmarkComparison[] = [
  { metric: 'IRR', vestledgerValue: 42.3, industryMedian: 18.5, topQuartile: 32.0, bottomQuartile: 8.2 },
  { metric: 'TVPI', vestledgerValue: 1.92, industryMedian: 1.35, topQuartile: 1.75, bottomQuartile: 1.05 },
  { metric: 'DPI', vestledgerValue: 0.28, industryMedian: 0.45, topQuartile: 0.82, bottomQuartile: 0.15 },
  { metric: 'MOIC', vestledgerValue: 2.15, industryMedian: 1.58, topQuartile: 2.35, bottomQuartile: 1.12 },
  { metric: 'Deployment Rate (%)', vestledgerValue: 33.5, industryMedian: 42.0, topQuartile: 58.0, bottomQuartile: 28.0 },
];
