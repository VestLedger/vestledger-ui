/**
 * Waterfall Distribution Types
 *
 * Defines structures for waterfall modeling, scenarios, tiers, and calculations
 */

// ============================================================================
// Enums and Constants
// ============================================================================

export type WaterfallModel = 'european' | 'american' | 'blended';
export type TierType = 'roc' | 'preferred-return' | 'catch-up' | 'carry' | 'custom';

export interface BlendedWaterfallConfig {
  europeanWeight: number; // 0-100
  americanWeight: number; // 0-100
}

export interface ClawbackProvision {
  enabled: boolean;
  hurdleRate: number; // %
  clawbackRate: number; // % of shortfall recaptured
  distributionLifeYears: number;
}

export interface LookbackProvision {
  enabled: boolean;
  lookbackYears: number;
  lossCarryForward: number;
  carryAtRiskRate: number; // %
}

export interface TierTimelineEntry {
  tierId: string;
  tierName: string;
  reachedAt: string;
  exitValue: number;
  cumulativeDistributed: number;
}

// ============================================================================
// Investor Class
// ============================================================================

export interface InvestorClass {
  id: string;
  name: string;
  type: 'lp' | 'gp';
  ownershipPercentage: number; // 0-100
  commitment: number;
  capitalCalled: number;
  capitalReturned: number;
  notes?: string;
  order: number; // For drag-and-drop ordering
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Waterfall Tier
// ============================================================================

export interface WaterfallTier {
  id: string;
  name: string;
  type: TierType;
  order: number;

  // Tier parameters
  threshold?: number; // Amount threshold before this tier activates
  hurdleRate?: number; // Preferred return rate (e.g., 8%)
  gpCarryPercentage?: number; // GP carry % for this tier
  lpPercentage?: number; // LP split %
  splitType?: 'pro-rata' | 'equal' | 'custom';

  // Calculated results (populated after calculation)
  totalAmount?: number;
  gpAmount?: number;
  lpAmount?: number;

  description?: string;
  isCustom: boolean;
}

// ============================================================================
// Tier Allocation
// ============================================================================

export interface TierAllocation {
  tierId: string;
  tierName: string;
  investorClassId: string;
  investorClassName: string;
  amount: number;
  percentage: number;
  cumulativeAmount: number;
}

// ============================================================================
// Waterfall Results
// ============================================================================

export interface WaterfallResults {
  // Overall metrics
  totalExitValue: number;
  totalInvested: number;
  totalReturned: number;

  // GP metrics
  gpCarry: number;
  gpCarryPercentage: number;
  gpManagementFees: number;
  gpTotalReturn: number;

  // LP metrics
  lpTotalReturn: number;
  lpAverageMultiple: number;

  // Per investor class results
  investorClassResults: InvestorClassResult[];

  // Tier-by-tier breakdown
  tierBreakdown: TierBreakdown[];

  // Phase 6 enhancements
  tierTimeline?: TierTimelineEntry[];
  clawback?: {
    totalCarryPaid: number;
    requiredReturn: number;
    shortfall: number;
    clawbackDue: number;
    netCarryAfterClawback: number;
    status: 'clear' | 'at-risk' | 'triggered';
  };
  lookback?: {
    lookbackYears: number;
    lossesToRecover: number;
    carryAtRisk: number;
    carryReleased: number;
    status: 'monitor' | 'at-risk' | 'cleared';
  };
  blendedBreakdown?: BlendedWaterfallConfig;
}

export interface InvestorClassResult {
  investorClassId: string;
  investorClassName: string;
  invested: number;
  returned: number;
  multiple: number; // MOIC
  irr: number;
  carry: number;
  netReturn: number;
  profit: number;
  allocations: TierAllocation[];
}

export interface TierBreakdown {
  tierId: string;
  tierName: string;
  tierType: TierType;
  totalAmount: number;
  gpAmount: number;
  lpAmount: number;
  percentage: number;
  cumulativeAmount: number;
  allocations: TierAllocation[];
}

// ============================================================================
// Waterfall Scenario
// ============================================================================

export interface WaterfallScenario {
  id: string;
  name: string;
  description?: string;
  fundId?: string;
  fundName?: string;

  // Model configuration
  model: WaterfallModel;
  blendedConfig?: BlendedWaterfallConfig;
  investorClasses: InvestorClass[];
  tiers: WaterfallTier[];

  clawbackProvision?: ClawbackProvision;
  lookbackProvision?: LookbackProvision;

  // Input parameters
  exitValue: number;
  totalInvested: number;
  managementFees: number;

  // Calculated results
  results?: WaterfallResults;

  // Metadata
  isFavorite: boolean;
  isTemplate: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

// ============================================================================
// Sensitivity Analysis
// ============================================================================

export interface SensitivityDataPoint {
  exitValue: number;
  gpCarry: number;
  gpCarryPercentage: number;
  lpReturn: number;
  lpMultiple: number;
  totalMultiple: number;
}

export interface SensitivityAnalysis {
  scenarioId: string;
  minExitValue: number;
  maxExitValue: number;
  step: number;
  dataPoints: SensitivityDataPoint[];
  breakEvenPoints: {
    tierName: string;
    exitValue: number;
  }[];
}

// ============================================================================
// Scenario Comparison
// ============================================================================

export interface ScenarioComparison {
  scenarios: WaterfallScenario[];
  comparisonMetrics: {
    scenarioId: string;
    scenarioName: string;
    gpCarry: number;
    lpReturn: number;
    totalMultiple: number;
  }[];
}

// ============================================================================
// Waterfall Template
// ============================================================================

export interface WaterfallTemplate {
  id: string;
  name: string;
  description: string;
  model: WaterfallModel;
  tiers: Omit<WaterfallTier, 'id'>[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'pptx';
export type ExportTemplate = 'executive-summary' | 'detailed' | 'board-presentation';

export interface ExportOptions {
  format: ExportFormat;
  template: ExportTemplate;
  includeCharts: boolean;
  includeTierBreakdown: boolean;
  includeLPAllocations: boolean;
  customBranding?: {
    logo?: string;
    companyName?: string;
    footer?: string;
  };
}
