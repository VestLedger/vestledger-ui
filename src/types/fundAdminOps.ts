export interface NAVCalculation {
  id: string;
  fundId: string;
  fundName: string;
  asOfDate: Date;
  calculationDate: Date;
  status: 'draft' | 'calculated' | 'reviewed' | 'published';
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  outstandingShares: number;
  navPerShare: number;
  previousNAV?: number;
  changeAmount?: number;
  changePercent?: number;
  components: NAVComponent[];
  adjustments: NAVAdjustment[];
  reviewedBy?: string;
  publishedBy?: string;
  notes?: string;
}

export interface NAVComponent {
  id: string;
  category: 'investment' | 'cash' | 'receivable' | 'liability' | 'other';
  description: string;
  value: number;
  valuationMethod: 'cost' | 'fair-value' | 'mark-to-market' | 'discounted-cash-flow';
  lastValuationDate: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface NAVAdjustment {
  id: string;
  type: 'unrealized-gain' | 'unrealized-loss' | 'write-up' | 'write-down' | 'other';
  description: string;
  amount: number;
  justification: string;
  approvedBy?: string;
}

export interface CarriedInterestTerm {
  id: string;
  fundId: string;
  fundName: string;
  gpCarryPercentage: number;
  hurdleRate: number;
  preferredReturn: number;
  catchupPercentage: number;
  catchupCap?: number;
  vestingSchedule: VestingSchedule;
  effectiveDate: Date;
  status: 'active' | 'inactive' | 'draft';
}

export interface VestingSchedule {
  type: 'immediate' | 'cliff' | 'graded';
  cliffMonths?: number;
  vestingPeriodMonths?: number;
  accelerationTriggers?: ('exit' | 'ipo' | 'change-of-control')[];
}

export interface CarryAccrual {
  id: string;
  fundId: string;
  asOfDate: Date;
  calculationDate: Date;
  totalContributions: number;
  totalDistributions: number;
  unrealizedValue: number;
  realizedGains: number;
  unrealizedGains: number;
  totalValue: number;
  lpPreferredReturn: number;
  lpPreferredReturnPaid: boolean;
  catchupAmount: number;
  catchupPaid: number;
  accruedCarry: number;
  vestedCarry: number;
  unvestedCarry: number;
  distributedCarry: number;
  remainingCarry: number;
  irr: number;
  moic: number;
  waterfall: WaterfallTier[];
  status: 'draft' | 'calculated' | 'approved' | 'distributed';
  notes?: string;
}

export interface WaterfallTier {
  tier: number;
  name: string;
  description: string;
  lpAllocation: number;
  gpAllocation: number;
  tierStart: number;
  tierEnd?: number;
  lpAmount: number;
  gpAmount: number;
  isActive: boolean;
}

export type ExpenseType =
  | 'management-fee'
  | 'monitoring-fee'
  | 'transaction-fee'
  | 'legal'
  | 'audit'
  | 'administrative'
  | 'marketing'
  | 'other';

export interface FundExpense {
  id: string;
  fundId: string;
  fundName: string;
  type: ExpenseType;
  category: string;
  description: string;
  amount: number;
  date: Date;
  payee: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: string;
  paidDate?: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annually';
  allocatedToLPs: boolean;
  invoiceNumber?: string;
  tags?: string[];
}

export type TransferType = 'direct' | 'secondary-sale' | 'inheritance' | 'gift' | 'court-order';

export type TransferStatus =
  | 'draft'
  | 'pending-gp-approval'
  | 'pending-legal-review'
  | 'pending-buyer-funding'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface LPTransfer {
  id: string;
  transferNumber: string;
  fundId: string;
  fundName: string;
  type: TransferType;
  status: TransferStatus;
  transferorId: string;
  transferorName: string;
  transferorEmail: string;
  transfereeId?: string;
  transfereeName?: string;
  transfereeEmail?: string;
  commitmentAmount: number;
  fundedAmount: number;
  unfundedCommitment: number;
  transferPrice?: number;
  discount?: number;
  includesManagementRights: boolean;
  includesInformationRights: boolean;
  includesVotingRights: boolean;
  subjectToROFR: boolean;
  rofrDeadline?: Date;
  requiresGPConsent: boolean;
  requiresLPVote: boolean;
  requestedDate: Date;
  gpApprovalDate?: Date;
  legalReviewDate?: Date;
  closingDate?: Date;
  effectiveDate?: Date;
  gpApprover?: string;
  legalReviewer?: string;
  rejectionReason?: string;
  documents: TransferDocument[];
  accreditationVerified: boolean;
  kycCompleted: boolean;
  amlCleared: boolean;
  taxFormsReceived: boolean;
  notes?: string;
}

export interface TransferDocument {
  id: string;
  name: string;
  type: 'assignment-agreement' | 'consent-form' | 'accreditation' | 'kyc' | 'tax-form' | 'other';
  uploadedDate: Date;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
}

export interface ROFRExercise {
  id: string;
  transferId: string;
  exercisedBy: string;
  exercisedByName: string;
  exerciseDate: Date;
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
}
