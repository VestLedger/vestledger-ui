/**
 * Fund Management Types
 *
 * Defines the structure for managing multiple VC funds
 */

export type FundStatus = 'active' | 'closed' | 'fundraising';
export type FundStrategy = 'early-stage' | 'growth' | 'late-stage' | 'multi-stage' | 'sector-specific';

export interface Fund {
  id: string;
  name: string;
  displayName: string;
  fundNumber: number; // e.g., Fund I = 1, Fund II = 2
  status: FundStatus;
  strategy: FundStrategy;

  // Fund size and capital
  totalCommitment: number;
  deployedCapital: number;
  availableCapital: number;

  // Timeline
  vintage: number; // Year the fund started
  startDate: string;
  endDate?: string;
  fundTerm: number; // Years, typically 10

  // Performance metrics
  portfolioCount: number;
  activeDeals: number;
  totalInvestments: number;
  portfolioValue: number;
  irr: number;
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributed to Paid-In

  // Investment focus
  minInvestment: number;
  maxInvestment: number;
  targetSectors: string[];
  targetStages: string[];

  // Metadata
  description?: string;
  managers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FundSummary {
  totalFunds: number;
  totalCommitment: number;
  totalDeployed: number;
  totalPortfolioValue: number;
  totalPortfolioCompanies: number;
  averageIRR: number;
  activeFunds: number;
  closedFunds: number;
}

export type FundViewMode = 'individual' | 'consolidated' | 'comparison';

export interface FundContextType {
  funds: Fund[];
  selectedFund: Fund | null;
  viewMode: FundViewMode;
  setSelectedFund: (fund: Fund | null) => void;
  setViewMode: (mode: FundViewMode) => void;
  getActiveFunds: () => Fund[];
  getFundById: (id: string) => Fund | undefined;
  getFundSummary: () => FundSummary;
}

export interface FundArchiveState {
  archivedFundIds: string[];
}
