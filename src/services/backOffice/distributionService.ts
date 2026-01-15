/**
 * Distribution Service
 *
 * Service layer for distribution workflow management
 */

import type {
  Distribution,
  DistributionFilters,
  DistributionSummary,
  DistributionCalendarEvent,
  FeeTemplate,
  LPProfile,
  ApprovalRule,
  StatementTemplateConfig,
} from '@/types/distribution';
import { isMockMode } from '@/config/data-mode';
import {
  mockDistributions,
  mockDistributionSummary,
  mockDistributionCalendarEvents,
  mockFeeTemplates,
  mockStatementTemplates,
  mockLPProfiles,
  mockApprovalRules,
} from '@/data/mocks/back-office/distributions';

// ============================================================================
// Distribution Management
// ============================================================================

/**
 * Fetch distributions with optional filters
 */
export async function fetchDistributions(
  filters?: DistributionFilters
): Promise<Distribution[]> {
  if (isMockMode()) {
    let distributions = [...mockDistributions];

    // Apply filters
    if (filters?.fundId) {
      distributions = distributions.filter((d) => d.fundId === filters.fundId);
    }

    if (filters?.status && filters.status.length > 0) {
      distributions = distributions.filter((d) => filters.status?.includes(d.status));
    }

    if (filters?.eventType && filters.eventType.length > 0) {
      distributions = distributions.filter((d) => filters.eventType?.includes(d.eventType));
    }

    if (filters?.dateFrom) {
      distributions = distributions.filter((d) => d.eventDate >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      distributions = distributions.filter((d) => d.eventDate <= filters.dateTo!);
    }

    if (filters?.minAmount !== undefined) {
      distributions = distributions.filter((d) => d.totalDistributed >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      distributions = distributions.filter((d) => d.totalDistributed <= filters.maxAmount!);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      distributions = distributions.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query)
      );
    }

    if (filters?.createdBy) {
      distributions = distributions.filter((d) => d.createdBy === filters.createdBy);
    }

    // Sort by date descending by default
    distributions.sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

    return distributions;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch a single distribution by ID
 */
export async function fetchDistribution(id: string): Promise<Distribution> {
  if (isMockMode()) {
    const distribution = mockDistributions.find((d) => d.id === id);
    if (!distribution) {
      throw new Error(`Distribution not found: ${id}`);
    }
    return distribution;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Create a new distribution
 */
export async function createDistribution(
  data: Partial<Distribution>
): Promise<Distribution> {
  if (isMockMode()) {
    const newDistribution: Distribution = {
      id: `dist-${Date.now()}`,
      fundId: data.fundId || '',
      fundName: data.fundName || '',
      name: data.name || 'New Distribution',
      eventType: data.eventType || 'exit',
      eventDate: data.eventDate || new Date().toISOString().split('T')[0],
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      description: data.description,
      status: 'draft',
      grossProceeds: data.grossProceeds || 0,
      totalFees: data.totalFees || 0,
      totalExpenses: data.totalExpenses || 0,
      netProceeds: data.netProceeds || 0,
      totalTaxWithholding: data.totalTaxWithholding || 0,
      totalDistributed: data.totalDistributed || 0,
      feeLineItems: data.feeLineItems || [],
      lpAllocations: data.lpAllocations || [],
      approvalChainId: data.approvalChainId || '',
      approvalSteps: data.approvalSteps || [],
      statementsGenerated: false,
      statements: [],
      createdBy: data.createdBy || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      revisionNumber: 1,
      comments: [],
      isRecurring: data.isRecurring || false,
      ...(data.recurringSchedule && { recurringSchedule: data.recurringSchedule }),
      ...(data.dikAssets && { dikAssets: data.dikAssets }),
      ...(data.dikAllocations && { dikAllocations: data.dikAllocations }),
      ...(data.elections && { elections: data.elections }),
      ...(data.fractionalSharePolicy && { fractionalSharePolicy: data.fractionalSharePolicy }),
      ...(data.securityTransfers && { securityTransfers: data.securityTransfers }),
      ...(data.secondaryTransferAdjustments && { secondaryTransferAdjustments: data.secondaryTransferAdjustments }),
      ...(data.stagedPayments && { stagedPayments: data.stagedPayments }),
      ...(data.holdbackEscrow && { holdbackEscrow: data.holdbackEscrow }),
      ...(data.sideLetterTerms && { sideLetterTerms: data.sideLetterTerms }),
      ...(data.specialHandling && { specialHandling: data.specialHandling }),
    };

    mockDistributions.push(newDistribution);
    return newDistribution;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Update an existing distribution
 */
export async function updateDistribution(
  id: string,
  data: Partial<Distribution>
): Promise<Distribution> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Distribution not found: ${id}`);
    }

    const updated = {
      ...mockDistributions[index],
      ...data,
      id, // Preserve ID
      revisionNumber: mockDistributions[index].revisionNumber + 1,
      updatedAt: new Date().toISOString(),
    };

    mockDistributions[index] = updated;
    return updated;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Delete a distribution (only drafts can be deleted)
 */
export async function deleteDistribution(id: string): Promise<void> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Distribution not found: ${id}`);
    }

    if (!mockDistributions[index].isDraft) {
      throw new Error('Only draft distributions can be deleted');
    }

    mockDistributions.splice(index, 1);
    return;
  }

  throw new Error('Distribution API not implemented yet');
}

// ============================================================================
// Approval Workflow
// ============================================================================

export interface SubmitForApprovalParams {
  distributionId: string;
  comment?: string;
}

/**
 * Submit distribution for approval
 */
export async function submitForApproval(
  params: SubmitForApprovalParams
): Promise<Distribution> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === params.distributionId);
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];

    // Determine approval chain based on amount
    const approvalRule = mockApprovalRules.find(
      (rule) =>
        distribution.totalDistributed >= rule.minAmount &&
        (!rule.maxAmount || distribution.totalDistributed < rule.maxAmount)
    );

    if (!approvalRule) {
      throw new Error('No matching approval rule found');
    }

    // Create approval steps
    const approvalSteps = approvalRule.approvers.map((approver, index) => ({
      id: `approval-${Date.now()}-${index}`,
      order: approver.order,
      approverId: `user-${index + 1}`,
      approverName: `${approver.role} User`,
      approverRole: approver.role,
      approverEmail: `${approver.role.toLowerCase().replace(/\s+/g, '.')}@quantum.vc`,
      status: index === 0 ? ('pending' as const) : ('pending' as const),
      requiredComment: false,
      assignedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      notificationSent: index === 0,
    }));

    const updated = {
      ...distribution,
      status: 'pending-approval' as const,
      isDraft: false,
      approvalChainId: approvalRule.id,
      approvalSteps,
      currentApprovalStep: 1,
      submittedForApprovalAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (params.comment) {
      updated.comments = [
        ...updated.comments,
        {
          id: `comment-${Date.now()}`,
          distributionId: params.distributionId,
          userId: updated.createdBy,
          userName: updated.createdBy,
          userRole: 'PM',
          comment: params.comment,
          isInternal: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    mockDistributions[index] = updated;
    return updated;
  }

  throw new Error('Distribution API not implemented yet');
}

export interface ApproveDistributionParams {
  distributionId: string;
  approverId: string;
  comment?: string;
}

/**
 * Approve a distribution at current approval step
 */
export async function approveDistribution(
  params: ApproveDistributionParams
): Promise<Distribution> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === params.distributionId);
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex((s) => s.order === currentStep);

    if (stepIndex === -1) {
      throw new Error('Current approval step not found');
    }

    // Update approval step
    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: 'approved',
      comment: params.comment,
      respondedAt: new Date().toISOString(),
    };

    // Check if this was the last approval step
    const isLastStep = currentStep === distribution.approvalSteps.length;

    const updated = {
      ...distribution,
      status: isLastStep ? ('approved' as const) : distribution.status,
      currentApprovalStep: isLastStep ? currentStep : currentStep + 1,
      approvedAt: isLastStep ? new Date().toISOString() : distribution.approvedAt,
      updatedAt: new Date().toISOString(),
    };

    if (params.comment) {
      updated.comments = [
        ...updated.comments,
        {
          id: `comment-${Date.now()}`,
          distributionId: params.distributionId,
          userId: params.approverId,
          userName: distribution.approvalSteps[stepIndex].approverName,
          userRole: distribution.approvalSteps[stepIndex].approverRole,
          comment: params.comment,
          isInternal: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    mockDistributions[index] = updated;
    return updated;
  }

  throw new Error('Distribution API not implemented yet');
}

export interface RejectDistributionParams {
  distributionId: string;
  approverId: string;
  reason: string;
}

/**
 * Reject a distribution
 */
export async function rejectDistribution(
  params: RejectDistributionParams
): Promise<Distribution> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === params.distributionId);
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex((s) => s.order === currentStep);

    if (stepIndex === -1) {
      throw new Error('Current approval step not found');
    }

    // Update approval step
    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: 'rejected',
      comment: params.reason,
      respondedAt: new Date().toISOString(),
    };

    const updated = {
      ...distribution,
      status: 'rejected' as const,
      updatedAt: new Date().toISOString(),
      comments: [
        ...distribution.comments,
        {
          id: `comment-${Date.now()}`,
          distributionId: params.distributionId,
          userId: params.approverId,
          userName: distribution.approvalSteps[stepIndex].approverName,
          userRole: distribution.approvalSteps[stepIndex].approverRole,
          comment: params.reason,
          isInternal: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    mockDistributions[index] = updated;
    return updated;
  }

  throw new Error('Distribution API not implemented yet');
}

export interface ReturnForRevisionParams {
  distributionId: string;
  approverId: string;
  reason: string;
}

/**
 * Return a distribution for revision
 */
export async function returnForRevision(
  params: ReturnForRevisionParams
): Promise<Distribution> {
  if (isMockMode()) {
    const index = mockDistributions.findIndex((d) => d.id === params.distributionId);
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex((s) => s.order === currentStep);

    if (stepIndex === -1) {
      throw new Error('Current approval step not found');
    }

    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: 'returned',
      comment: params.reason,
      respondedAt: new Date().toISOString(),
    };

    const updated = {
      ...distribution,
      status: 'draft' as const,
      isDraft: true,
      revisionNumber: distribution.revisionNumber + 1,
      updatedAt: new Date().toISOString(),
      comments: [
        ...distribution.comments,
        {
          id: `comment-${Date.now()}`,
          distributionId: params.distributionId,
          userId: params.approverId,
          userName: distribution.approvalSteps[stepIndex].approverName,
          userRole: distribution.approvalSteps[stepIndex].approverRole,
          comment: params.reason,
          isInternal: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    mockDistributions[index] = updated;
    return updated;
  }

  throw new Error('Distribution API not implemented yet');
}

// ============================================================================
// Supporting Data
// ============================================================================

/**
 * Fetch distribution summary
 */
export async function fetchDistributionSummary(): Promise<DistributionSummary> {
  if (isMockMode()) {
    return mockDistributionSummary;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch calendar events
 */
export async function fetchDistributionCalendarEvents(
  startDate?: string,
  endDate?: string
): Promise<DistributionCalendarEvent[]> {
  if (isMockMode()) {
    let events = [...mockDistributionCalendarEvents];

    if (startDate) {
      events = events.filter((e) => e.date >= startDate);
    }

    if (endDate) {
      events = events.filter((e) => e.date <= endDate);
    }

    return events;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch fee templates
 */
export async function fetchFeeTemplates(fundId?: string): Promise<FeeTemplate[]> {
  if (isMockMode()) {
    if (fundId) {
      return mockFeeTemplates.filter((t) => !t.fundId || t.fundId === fundId);
    }
    return mockFeeTemplates;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch statement templates
 */
export async function fetchStatementTemplates(): Promise<StatementTemplateConfig[]> {
  if (isMockMode()) {
    return mockStatementTemplates;
  }

  throw new Error('Statement templates API not implemented yet');
}

/**
 * Fetch LP profiles
 */
export async function fetchLPProfiles(): Promise<LPProfile[]> {
  if (isMockMode()) {
    return mockLPProfiles;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch LP profile by ID
 */
export async function fetchLPProfile(id: string): Promise<LPProfile> {
  if (isMockMode()) {
    const profile = mockLPProfiles.find((p) => p.id === id);
    if (!profile) {
      throw new Error(`LP profile not found: ${id}`);
    }
    return profile;
  }

  throw new Error('Distribution API not implemented yet');
}

/**
 * Fetch approval rules
 */
export async function fetchApprovalRules(): Promise<ApprovalRule[]> {
  if (isMockMode()) {
    return mockApprovalRules;
  }

  throw new Error('Distribution API not implemented yet');
}
