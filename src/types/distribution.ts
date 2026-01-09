/**
 * Distribution Management Types
 *
 * Defines structures for distribution workflow, approvals, allocations, and statements
 */

import type { WaterfallResults } from './waterfall';

// ============================================================================
// Enums and Constants
// ============================================================================

export type DistributionStatus =
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type DistributionEventType =
  | 'exit'
  | 'dividend'
  | 'recapitalization'
  | 'refinancing'
  | 'partial-exit'
  | 'other';

export type FeeType =
  | 'management-fee'
  | 'transaction-cost'
  | 'legal-fee'
  | 'audit-fee'
  | 'admin-fee'
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export type StatementTemplate = 'standard' | 'ilpa-compliant' | 'custom';

export type TaxFormType = 'k1' | '1099' | 'other';

// ============================================================================
// Statement Branding + Template Config
// ============================================================================

export interface StatementBranding {
  logo?: string;
  companyName?: string;
  footer?: string;
  contactInfo?: string;
}

export interface StatementTemplateConfig {
  id: string;
  name: string;
  template: StatementTemplate;
  description: string;
  defaultBranding?: StatementBranding;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Fee Line Item
// ============================================================================

export interface FeeLineItem {
  id: string;
  type: FeeType;
  description: string;
  amount: number;
  percentage?: number; // % of gross proceeds
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LP Allocation
// ============================================================================

export interface LPAllocation {
  id: string;
  lpId: string;
  lpName: string;
  investorClassId: string;
  investorClassName: string;

  // Allocation amounts
  commitment: number;
  ownershipPercentage: number;
  proRataPercentage: number;
  grossAmount: number;
  netAmount: number;

  // Tax withholding
  taxJurisdiction: string;
  taxWithholdingRate: number;
  taxWithholdingAmount: number;
  taxFormType: TaxFormType;
  isTaxOverride: boolean; // Manual override flag

  // Special terms
  hasSpecialTerms: boolean;
  specialTermsNotes?: string;

  // Bank details
  bankAccountId?: string;
  bankAccountName?: string;
  wireInstructions?: string;

  // Status
  isConfirmed: boolean;
  confirmedAt?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Approval Step
// ============================================================================

export interface ApprovalStep {
  id: string;
  order: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  approverEmail: string;

  status: ApprovalStatus;
  requiredComment: boolean;
  comment?: string;

  // Timestamps
  assignedAt: string;
  respondedAt?: string;
  dueDate?: string;

  // Notification
  notificationSent: boolean;
  reminderSentAt?: string;
}

// ============================================================================
// Approval Rule
// ============================================================================

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;

  // Amount thresholds
  minAmount: number;
  maxAmount?: number; // undefined = no upper limit

  // Required approvers (in order)
  approvers: {
    role: string;
    order: number;
    isParallel: boolean; // Can multiple people at this level approve in parallel?
  }[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Distribution Impact
// ============================================================================

export interface DistributionImpact {
  // Before metrics
  navBefore: number;
  dpiBefore: number;
  tvpiBefore: number;
  undrawnCapitalBefore: number;

  // After metrics (projected)
  navAfter: number;
  dpiAfter: number;
  tvpiAfter: number;
  undrawnCapitalAfter: number;

  // Changes
  navChange: number;
  dpiChange: number;
  tvpiChange: number;
  undrawnCapitalChange: number;

  // Covenant warnings
  covenantWarnings: {
    covenantName: string;
    threshold: number;
    currentValue: number;
    projectedValue: number;
    isViolation: boolean;
    severity: 'info' | 'warning' | 'critical';
  }[];
}

// ============================================================================
// Distribution Statement
// ============================================================================

export interface DistributionStatement {
  id: string;
  distributionId: string;
  lpId: string;
  lpName: string;

  template: StatementTemplate;
  generatedAt: string;
  generatedBy: string;

  // PDF/Document
  pdfUrl?: string;
  pdfGenerated: boolean;

  // Email notification
  emailSent: boolean;
  emailSentAt?: string;
  emailTo: string;

  // LP confirmation
  lpConfirmed: boolean;
  lpConfirmedAt?: string;

  // Tax forms
  taxForms: {
    type: TaxFormType;
    url?: string;
    generated: boolean;
  }[];

  // Branding
  customBranding?: StatementBranding;
}

// ============================================================================
// Distribution
// ============================================================================

export interface Distribution {
  id: string;
  fundId: string;
  fundName: string;

  // Basic info
  name: string;
  eventType: DistributionEventType;
  eventDate: string;
  paymentDate: string;
  description?: string;

  // Status
  status: DistributionStatus;

  // Amounts
  grossProceeds: number;
  totalFees: number;
  totalExpenses: number;
  netProceeds: number;
  totalTaxWithholding: number;
  totalDistributed: number;

  // Fees and expenses
  feeLineItems: FeeLineItem[];

  // Waterfall integration
  waterfallScenarioId?: string;
  waterfallScenarioName?: string;
  waterfallResults?: WaterfallResults;

  // LP allocations
  lpAllocations: LPAllocation[];

  // Approval workflow
  approvalChainId: string;
  approvalSteps: ApprovalStep[];
  currentApprovalStep?: number;

  // Impact analysis
  impact?: DistributionImpact;

  // Statements
  statementsGenerated: boolean;
  statementsGeneratedAt?: string;
  statements: DistributionStatement[];

  // Audit trail
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedForApprovalAt?: string;
  approvedAt?: string;
  processedAt?: string;
  completedAt?: string;

  // Draft/revision tracking
  isDraft: boolean;
  revisionNumber: number;
  previousVersionId?: string;

  // Comments/notes
  comments: DistributionComment[];
  internalNotes?: string;

  // Scheduling
  isRecurring: boolean;
  recurringSchedule?: RecurringSchedule;
}

// ============================================================================
// Distribution Comment
// ============================================================================

export interface DistributionComment {
  id: string;
  distributionId: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Recurring Schedule
// ============================================================================

export interface RecurringSchedule {
  id: string;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  occurrences: number;
  isActive: boolean;
  reminderDaysBefore: number[];
}

// ============================================================================
// Distribution Calendar Event
// ============================================================================

export interface DistributionCalendarEvent {
  id: string;
  distributionId?: string; // undefined if it's a scheduled future distribution
  title: string;
  date: string;
  eventType: DistributionEventType | 'scheduled' | 'reminder';
  status: DistributionStatus | 'upcoming';
  amount?: number;
  fundId: string;
  fundName: string;
  description?: string;
  isRecurring: boolean;
  color?: string;
}

// ============================================================================
// Fee Template
// ============================================================================

export interface FeeTemplate {
  id: string;
  name: string;
  description: string;
  feeLineItems: Omit<FeeLineItem, 'id' | 'createdAt' | 'updatedAt'>[];
  isSystem: boolean;
  fundId?: string; // Fund-specific template
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LP Profile (for tax withholding)
// ============================================================================

export interface LPProfile {
  id: string;
  name: string;
  legalName: string;
  type: 'individual' | 'institutional' | 'entity';

  // Tax info
  taxJurisdiction: string;
  taxId?: string;
  defaultTaxWithholdingRate: number;
  taxFormType: TaxFormType;

  // Commitment
  totalCommitment: number;
  capitalCalled: number;
  capitalDistributed: number;

  // Contact
  email: string;
  phone?: string;

  // Bank details
  primaryBankAccountId?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Distribution Wizard State (for multi-step form)
// ============================================================================

export interface DistributionWizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];

  // Step data
  eventData?: Partial<Distribution>;
  feesData?: FeeLineItem[];
  waterfallData?: {
    scenarioId?: string;
    results?: WaterfallResults;
  };
  allocationsData?: LPAllocation[];
  taxData?: {
    lpId: string;
    rate: number;
    override: boolean;
  }[];
  impactData?: DistributionImpact;
  previewData?: {
    template: StatementTemplate;
    customBranding?: StatementBranding;
  };

  // Validation
  validationErrors: {
    step: number;
    errors: string[];
  }[];

  // Draft
  isDraft: boolean;
  draftSavedAt?: string;
  autoSaveEnabled: boolean;
}

// ============================================================================
// Distribution Filters (for list view)
// ============================================================================

export interface DistributionFilters {
  fundId?: string;
  status?: DistributionStatus[];
  eventType?: DistributionEventType[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  createdBy?: string;
}

// ============================================================================
// Distribution Summary (for dashboard/metrics)
// ============================================================================

export interface DistributionSummary {
  totalDistributions: number;
  totalDistributed: number;
  pendingApproval: number;
  upcomingDistributions: number;

  byStatus: {
    status: DistributionStatus;
    count: number;
    totalAmount: number;
  }[];

  byFund: {
    fundId: string;
    fundName: string;
    count: number;
    totalAmount: number;
  }[];

  recentDistributions: Distribution[];
  upcomingScheduled: DistributionCalendarEvent[];
}
