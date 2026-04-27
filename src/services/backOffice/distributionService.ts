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
  DistributionEventType,
  DistributionStatus,
  FeeTemplate,
  LPProfile,
  ApprovalRule,
  ApprovalStatus,
  StatementTemplateConfig,
  FeeType,
  TaxFormType,
  FeeLineItem,
  LPAllocation,
  ApprovalStep,
  DistributionComment,
} from "@/types/distribution";
import { isMockMode } from "@/config/data-mode";
import { requestJson } from "@/services/shared/httpClient";
import {
  mockDistributions,
  mockDistributionSummary,
  mockDistributionCalendarEvents,
  mockFeeTemplates,
  mockStatementTemplates,
  mockLPProfiles,
  mockApprovalRules,
} from "@/data/mocks/back-office/distributions";

const FEE_TYPES = new Set(["management-fee", "admin-fee"]);

const getFeeAmount = (
  item: Distribution["feeLineItems"][number],
  grossProceeds: number,
) => {
  if (item.amount > 0) return item.amount;
  if (item.percentage) return (item.percentage / 100) * grossProceeds;
  return 0;
};

const recalculateTotals = (distribution: Partial<Distribution>) => {
  const grossProceeds = distribution.grossProceeds ?? 0;
  const feeLineItems = distribution.feeLineItems ?? [];
  const totalFees = feeLineItems.reduce((sum, item) => {
    if (!FEE_TYPES.has(item.type)) return sum;
    return sum + getFeeAmount(item, grossProceeds);
  }, 0);
  const totalExpenses = feeLineItems.reduce((sum, item) => {
    if (FEE_TYPES.has(item.type)) return sum;
    return sum + getFeeAmount(item, grossProceeds);
  }, 0);
  const netProceeds = Math.max(0, grossProceeds - totalFees - totalExpenses);
  const allocations = distribution.lpAllocations ?? [];
  const totalTaxWithholding = allocations.reduce(
    (sum, allocation) => sum + allocation.taxWithholdingAmount,
    0,
  );
  const allocatedNetTotal = allocations.reduce(
    (sum, allocation) => sum + allocation.netAmount,
    0,
  );
  const totalDistributed =
    allocations.length > 0
      ? allocatedNetTotal
      : Math.max(0, netProceeds - totalTaxWithholding);

  return {
    grossProceeds,
    totalFees,
    totalExpenses,
    netProceeds,
    totalTaxWithholding,
    totalDistributed,
  };
};

const DISTRIBUTION_STATUSES: DistributionStatus[] = [
  "draft",
  "pending-approval",
  "approved",
  "processing",
  "completed",
  "rejected",
  "cancelled",
];

const DISTRIBUTION_EVENT_TYPES: DistributionEventType[] = [
  "exit",
  "dividend",
  "recapitalization",
  "refinancing",
  "partial-exit",
  "other",
];

const APPROVAL_STATUSES: ApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
  "returned",
];

const FEE_TYPE_VALUES: FeeType[] = [
  "management-fee",
  "transaction-cost",
  "legal-fee",
  "audit-fee",
  "admin-fee",
  "other",
];

const TAX_FORM_TYPES: TaxFormType[] = ["k1", "1099", "other"];

function asFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

function toDateOnly(value: unknown): string {
  if (!value) return new Date().toISOString().split("T")[0];
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function asDistributionStatus(value: unknown): DistributionStatus {
  const normalized = String(value);
  return DISTRIBUTION_STATUSES.includes(normalized as DistributionStatus)
    ? (normalized as DistributionStatus)
    : "draft";
}

function asDistributionEventType(value: unknown): DistributionEventType {
  const normalized = String(value);
  return DISTRIBUTION_EVENT_TYPES.includes(normalized as DistributionEventType)
    ? (normalized as DistributionEventType)
    : "other";
}

function asApprovalStatus(value: unknown): ApprovalStatus {
  const normalized = String(value);
  return APPROVAL_STATUSES.includes(normalized as ApprovalStatus)
    ? (normalized as ApprovalStatus)
    : "pending";
}

function asFeeType(value: unknown): FeeType {
  const normalized = String(value);
  return FEE_TYPE_VALUES.includes(normalized as FeeType)
    ? (normalized as FeeType)
    : "other";
}

function asTaxFormType(value: unknown): TaxFormType {
  const normalized = String(value).toLowerCase();
  return TAX_FORM_TYPES.includes(normalized as TaxFormType)
    ? (normalized as TaxFormType)
    : "other";
}

type ApiDistributionListResponse = {
  data: unknown[];
  meta?: unknown;
};

type ApiDistributionCalendarEvent = {
  id: string;
  title: string;
  fundId: string;
  fundName: string;
  eventType: string;
  status: string;
  eventDate: unknown;
  paymentDate: unknown;
  totalAmount?: unknown;
};

function mapApiDistributionToUi(distribution: unknown): Distribution {
  const record = asRecord(distribution);

  const feeLineItems: FeeLineItem[] = asArray(record["fees"]).map(
    (fee): FeeLineItem => {
      const feeRecord = asRecord(fee);
      const percentage = feeRecord["percentage"];
      const notes = feeRecord["notes"];
      return {
        id: String(feeRecord["id"]),
        type: asFeeType(feeRecord["type"]),
        description: String(
          feeRecord["name"] ?? feeRecord["description"] ?? "",
        ),
        amount: asFiniteNumber(feeRecord["amount"]),
        ...(percentage === null || percentage === undefined
          ? {}
          : { percentage: asFiniteNumber(percentage) }),
        ...(notes === null || notes === undefined
          ? {}
          : { notes: String(notes) }),
        createdAt: toIsoString(feeRecord["createdAt"]),
        updatedAt: toIsoString(feeRecord["updatedAt"]),
      };
    },
  );

  const lpAllocations: LPAllocation[] = asArray(record["allocations"]).map(
    (allocation): LPAllocation => {
      const allocationRecord = asRecord(allocation);
      const lpRecord = asRecord(allocationRecord["lp"]);
      const specialTermsNotes = allocationRecord["specialTermsNotes"];
      const bankAccountId = allocationRecord["bankAccountId"];
      const bankAccountName = allocationRecord["bankAccountName"];
      const wireInstructions = allocationRecord["wireInstructions"];
      const confirmedAt = allocationRecord["confirmedAt"];
      const notes = allocationRecord["notes"];

      return {
        id: String(allocationRecord["id"]),
        lpId: String(allocationRecord["lpId"]),
        lpName: String(allocationRecord["lpName"] ?? lpRecord["name"] ?? ""),
        investorClassId: String(allocationRecord["investorClassId"] ?? ""),
        investorClassName: String(allocationRecord["investorClassName"] ?? ""),
        commitment: asFiniteNumber(allocationRecord["commitment"]),
        ownershipPercentage: asFiniteNumber(allocationRecord["ownershipPct"]),
        proRataPercentage: asFiniteNumber(
          allocationRecord["proRataPercentage"],
        ),
        grossAmount: asFiniteNumber(allocationRecord["grossAmount"]),
        netAmount: asFiniteNumber(allocationRecord["netAmount"]),
        taxJurisdiction: String(
          allocationRecord["taxJurisdiction"] ??
            lpRecord["taxJurisdiction"] ??
            "US",
        ),
        taxWithholdingRate: asFiniteNumber(
          allocationRecord["taxWithholdingRate"],
        ),
        taxWithholdingAmount: asFiniteNumber(
          allocationRecord["taxWithholdingAmount"] ??
            allocationRecord["taxWithholding"],
        ),
        taxFormType: asTaxFormType(allocationRecord["taxFormType"]),
        isTaxOverride: Boolean(allocationRecord["isTaxOverride"]),
        hasSpecialTerms: Boolean(allocationRecord["hasSpecialTerms"]),
        ...(specialTermsNotes
          ? { specialTermsNotes: String(specialTermsNotes) }
          : {}),
        ...(bankAccountId ? { bankAccountId: String(bankAccountId) } : {}),
        ...(bankAccountName
          ? { bankAccountName: String(bankAccountName) }
          : {}),
        ...(wireInstructions
          ? { wireInstructions: String(wireInstructions) }
          : {}),
        isConfirmed: Boolean(allocationRecord["isConfirmed"]),
        ...(confirmedAt ? { confirmedAt: toIsoString(confirmedAt) } : {}),
        ...(notes ? { notes: String(notes) } : {}),
        createdAt: toIsoString(allocationRecord["createdAt"]),
        updatedAt: toIsoString(allocationRecord["updatedAt"]),
      };
    },
  );

  const approvalSteps: ApprovalStep[] = asArray(record["approvals"]).map(
    (approval): ApprovalStep => {
      const approvalRecord = asRecord(approval);
      const comments = approvalRecord["comments"];
      const respondedAt = approvalRecord["respondedAt"];
      const dueDate = approvalRecord["dueDate"];
      const reminderSentAt = approvalRecord["reminderSentAt"];

      return {
        id: String(approvalRecord["id"]),
        order: asFiniteNumber(approvalRecord["order"]),
        approverId: String(approvalRecord["approverId"]),
        approverName: String(approvalRecord["approverName"] ?? "Approver"),
        approverRole: String(approvalRecord["approverRole"] ?? "Approver"),
        approverEmail: String(approvalRecord["approverEmail"] ?? ""),
        status: asApprovalStatus(approvalRecord["status"]),
        requiredComment: Boolean(approvalRecord["requiredComment"]),
        ...(comments ? { comment: String(comments) } : {}),
        assignedAt: toIsoString(
          approvalRecord["assignedAt"] ?? approvalRecord["createdAt"],
        ),
        ...(respondedAt ? { respondedAt: toIsoString(respondedAt) } : {}),
        ...(dueDate ? { dueDate: toIsoString(dueDate) } : {}),
        notificationSent: Boolean(approvalRecord["notificationSent"]),
        ...(reminderSentAt
          ? { reminderSentAt: toIsoString(reminderSentAt) }
          : {}),
      };
    },
  );

  const comments: DistributionComment[] = asArray(record["comments"]).map(
    (comment): DistributionComment => {
      const commentRecord = asRecord(comment);
      const attachments = commentRecord["attachments"];
      return {
        id: String(commentRecord["id"]),
        distributionId: String(commentRecord["distributionId"]),
        userId: String(commentRecord["userId"]),
        userName: String(commentRecord["userName"]),
        userRole: String(commentRecord["userRole"]),
        comment: String(commentRecord["comment"]),
        isInternal: Boolean(commentRecord["isInternal"]),
        ...(Array.isArray(attachments)
          ? { attachments: attachments.map(String) }
          : {}),
        createdAt: toIsoString(commentRecord["createdAt"]),
        updatedAt: toIsoString(commentRecord["updatedAt"]),
      };
    },
  );

  const fundRecord = asRecord(record["fund"]);
  const fundName = String(
    record["fundName"] ?? fundRecord["displayName"] ?? fundRecord["name"] ?? "",
  );

  return {
    id: String(record["id"]),
    fundId: String(record["fundId"]),
    fundName,
    name: String(record["name"]),
    eventType: asDistributionEventType(record["eventType"]),
    eventDate: toDateOnly(record["eventDate"]),
    paymentDate: toDateOnly(record["paymentDate"]),
    ...(record["description"]
      ? { description: String(record["description"]) }
      : {}),
    status: asDistributionStatus(record["status"]),
    grossProceeds: asFiniteNumber(record["grossProceeds"]),
    totalFees: asFiniteNumber(record["totalFees"]),
    totalExpenses: asFiniteNumber(record["totalExpenses"]),
    netProceeds: asFiniteNumber(record["netProceeds"]),
    totalTaxWithholding: asFiniteNumber(record["totalTaxWithholding"]),
    totalDistributed: asFiniteNumber(record["totalDistributed"]),
    feeLineItems,
    ...(record["waterfallScenarioId"]
      ? { waterfallScenarioId: String(record["waterfallScenarioId"]) }
      : {}),
    lpAllocations,
    approvalChainId: String(record["approvalChainId"] ?? ""),
    approvalSteps,
    ...(record["currentApprovalStep"]
      ? { currentApprovalStep: asFiniteNumber(record["currentApprovalStep"]) }
      : {}),
    statementsGenerated: false,
    statements: [],
    createdBy: String(record["createdBy"] ?? "Unknown"),
    createdAt: toIsoString(record["createdAt"]),
    updatedAt: toIsoString(record["updatedAt"]),
    ...(record["submittedForApprovalAt"]
      ? {
          submittedForApprovalAt: toIsoString(record["submittedForApprovalAt"]),
        }
      : {}),
    ...(record["approvedAt"]
      ? { approvedAt: toIsoString(record["approvedAt"]) }
      : {}),
    ...(record["processedAt"]
      ? { processedAt: toIsoString(record["processedAt"]) }
      : {}),
    ...(record["completedAt"]
      ? { completedAt: toIsoString(record["completedAt"]) }
      : {}),
    isDraft: Boolean(record["isDraft"]),
    revisionNumber: asFiniteNumber(record["revisionNumber"], 1),
    ...(record["previousVersionId"]
      ? { previousVersionId: String(record["previousVersionId"]) }
      : {}),
    comments,
    ...(record["internalNotes"]
      ? { internalNotes: String(record["internalNotes"]) }
      : {}),
    isRecurring: Boolean(record["isRecurring"]),
  };
}

function mapUiDistributionToApiBody(
  distribution: Partial<Distribution>,
): Record<string, unknown> {
  const totals = recalculateTotals(distribution);
  const fundId = distribution.fundId || "";
  const eventDate =
    distribution.eventDate || new Date().toISOString().split("T")[0];
  const paymentDate = distribution.paymentDate || eventDate;
  const feeLineItems = distribution.feeLineItems ?? [];

  return {
    fundId,
    fundName: distribution.fundName,
    name: distribution.name ?? "New Distribution",
    description: distribution.description,
    eventType: distribution.eventType ?? "other",
    eventDate,
    paymentDate,
    totalAmount: totals.totalDistributed,
    grossProceeds: totals.grossProceeds,
    netProceeds: totals.netProceeds,
    totalFees: totals.totalFees,
    totalExpenses: totals.totalExpenses,
    totalTaxWithholding: totals.totalTaxWithholding,
    totalDistributed: totals.totalDistributed,
    waterfallScenarioId: distribution.waterfallScenarioId,
    internalNotes: distribution.internalNotes,
    isRecurring: distribution.isRecurring,
    fees: feeLineItems.map((item) => ({
      type: item.type,
      name: item.description || item.type,
      amount: getFeeAmount(item, totals.grossProceeds),
      ...(item.percentage !== undefined ? { percentage: item.percentage } : {}),
      paidBy: "fund",
      ...(item.notes ? { notes: item.notes } : {}),
    })),
  };
}

// ============================================================================
// Distribution Management
// ============================================================================

/**
 * Fetch distributions with optional filters
 */
export async function fetchDistributions(
  filters?: DistributionFilters,
): Promise<Distribution[]> {
  if (isMockMode("backOffice")) {
    let distributions = [...mockDistributions];

    // Apply filters
    if (filters?.fundId) {
      distributions = distributions.filter((d) => d.fundId === filters.fundId);
    }

    if (filters?.status && filters.status.length > 0) {
      distributions = distributions.filter((d) =>
        filters.status?.includes(d.status),
      );
    }

    if (filters?.eventType && filters.eventType.length > 0) {
      distributions = distributions.filter((d) =>
        filters.eventType?.includes(d.eventType),
      );
    }

    if (filters?.dateFrom) {
      distributions = distributions.filter(
        (d) => d.eventDate >= filters.dateFrom!,
      );
    }

    if (filters?.dateTo) {
      distributions = distributions.filter(
        (d) => d.eventDate <= filters.dateTo!,
      );
    }

    if (filters?.minAmount !== undefined) {
      distributions = distributions.filter(
        (d) => d.totalDistributed >= filters.minAmount!,
      );
    }

    if (filters?.maxAmount !== undefined) {
      distributions = distributions.filter(
        (d) => d.totalDistributed <= filters.maxAmount!,
      );
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      distributions = distributions.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query),
      );
    }

    if (filters?.createdBy) {
      distributions = distributions.filter(
        (d) => d.createdBy === filters.createdBy,
      );
    }

    // Sort by date descending by default
    distributions.sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );

    return distributions;
  }

  const query = {
    fromDate: filters?.dateFrom,
    toDate: filters?.dateTo,
    status: filters?.status?.length === 1 ? filters.status[0] : undefined,
    eventType:
      filters?.eventType?.length === 1 ? filters.eventType[0] : undefined,
  };

  const payload = filters?.fundId
    ? await requestJson<ApiDistributionListResponse>(
        `/funds/${filters.fundId}/distributions`,
        {
          query,
          fallbackMessage: "Failed to load distributions",
        },
      )
    : await requestJson<ApiDistributionListResponse>("/distributions", {
        query,
        fallbackMessage: "Failed to load distributions",
      });

  const list = Array.isArray(payload?.data) ? payload.data : [];
  let distributions = list.map(mapApiDistributionToUi);

  // Apply UI-side filters for fields not supported by the API query DTO.
  if (filters?.status && filters.status.length > 0) {
    distributions = distributions.filter((d) =>
      filters.status?.includes(d.status),
    );
  }

  if (filters?.eventType && filters.eventType.length > 0) {
    distributions = distributions.filter((d) =>
      filters.eventType?.includes(d.eventType),
    );
  }

  if (filters?.minAmount !== undefined) {
    distributions = distributions.filter(
      (d) => d.totalDistributed >= filters.minAmount!,
    );
  }

  if (filters?.maxAmount !== undefined) {
    distributions = distributions.filter(
      (d) => d.totalDistributed <= filters.maxAmount!,
    );
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    distributions = distributions.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        (d.description ?? "").toLowerCase().includes(query) ||
        d.fundName.toLowerCase().includes(query),
    );
  }

  if (filters?.createdBy) {
    distributions = distributions.filter(
      (d) => d.createdBy === filters.createdBy,
    );
  }

  // Default sort: eventDate descending (match mock behavior)
  distributions.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );

  return distributions;
}

/**
 * Fetch a single distribution by ID
 */
export async function fetchDistribution(id: string): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const distribution = mockDistributions.find((d) => d.id === id);
    if (!distribution) {
      throw new Error(`Distribution not found: ${id}`);
    }
    return distribution;
  }

  const payload = await requestJson<unknown>(`/distributions/${id}`, {
    fallbackMessage: "Failed to load distribution",
  });
  return mapApiDistributionToUi(payload);
}

/**
 * Create a new distribution
 */
export async function createDistribution(
  data: Partial<Distribution>,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const totals = recalculateTotals(data);
    const newDistribution: Distribution = {
      id: `dist-${Date.now()}`,
      fundId: data.fundId || "",
      fundName: data.fundName || "",
      name: data.name || "New Distribution",
      eventType: data.eventType || "exit",
      eventDate: data.eventDate || new Date().toISOString().split("T")[0],
      paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
      description: data.description,
      status: "draft",
      grossProceeds: totals.grossProceeds,
      totalFees: totals.totalFees,
      totalExpenses: totals.totalExpenses,
      netProceeds: totals.netProceeds,
      totalTaxWithholding: totals.totalTaxWithholding,
      totalDistributed: totals.totalDistributed,
      feeLineItems: data.feeLineItems || [],
      lpAllocations: data.lpAllocations || [],
      approvalChainId: data.approvalChainId || "",
      approvalSteps: data.approvalSteps || [],
      statementsGenerated: false,
      statements: [],
      createdBy: data.createdBy || "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      revisionNumber: 1,
      comments: [],
      isRecurring: data.isRecurring || false,
      ...(data.recurringSchedule && {
        recurringSchedule: data.recurringSchedule,
      }),
      ...(data.dikAssets && { dikAssets: data.dikAssets }),
      ...(data.dikAllocations && { dikAllocations: data.dikAllocations }),
      ...(data.elections && { elections: data.elections }),
      ...(data.fractionalSharePolicy && {
        fractionalSharePolicy: data.fractionalSharePolicy,
      }),
      ...(data.securityTransfers && {
        securityTransfers: data.securityTransfers,
      }),
      ...(data.secondaryTransferAdjustments && {
        secondaryTransferAdjustments: data.secondaryTransferAdjustments,
      }),
      ...(data.stagedPayments && { stagedPayments: data.stagedPayments }),
      ...(data.holdbackEscrow && { holdbackEscrow: data.holdbackEscrow }),
      ...(data.sideLetterTerms && { sideLetterTerms: data.sideLetterTerms }),
      ...(data.specialHandling && { specialHandling: data.specialHandling }),
    };

    mockDistributions.push(newDistribution);
    return newDistribution;
  }

  if (!data.fundId) {
    throw new Error("fundId is required to create a distribution");
  }

  const created = await requestJson<unknown>(
    `/funds/${data.fundId}/distributions`,
    {
      method: "POST",
      body: mapUiDistributionToApiBody(data),
      fallbackMessage: "Failed to create distribution",
    },
  );
  return mapApiDistributionToUi(created);
}

/**
 * Update an existing distribution
 */
export async function updateDistribution(
  id: string,
  data: Partial<Distribution>,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Distribution not found: ${id}`);
    }

    const base = {
      ...mockDistributions[index],
      ...data,
    };
    const totals = recalculateTotals(base);
    const updated = {
      ...base,
      ...totals,
      id, // Preserve ID
      revisionNumber: mockDistributions[index].revisionNumber + 1,
      updatedAt: new Date().toISOString(),
    };

    mockDistributions[index] = updated;
    return updated;
  }

  const existing = await fetchDistribution(id);
  const merged: Partial<Distribution> = { ...existing, ...data };
  const fundId = merged.fundId;
  if (!fundId) {
    throw new Error("fundId is required to update a distribution");
  }

  const updated = await requestJson<unknown>(
    `/funds/${fundId}/distributions/${id}`,
    {
      method: "PUT",
      body: mapUiDistributionToApiBody(merged),
      fallbackMessage: "Failed to update distribution",
    },
  );
  return mapApiDistributionToUi(updated);
}

/**
 * Delete a distribution (only drafts can be deleted)
 */
export async function deleteDistribution(id: string): Promise<void> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Distribution not found: ${id}`);
    }

    if (!mockDistributions[index].isDraft) {
      throw new Error("Only draft distributions can be deleted");
    }

    mockDistributions.splice(index, 1);
    return;
  }

  const existing = await fetchDistribution(id);
  await requestJson<void>(`/funds/${existing.fundId}/distributions/${id}`, {
    method: "DELETE",
    fallbackMessage: "Failed to delete distribution",
  });
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
  params: SubmitForApprovalParams,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex(
      (d) => d.id === params.distributionId,
    );
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];

    // Determine approval chain based on amount
    const approvalRule = mockApprovalRules.find(
      (rule) =>
        distribution.totalDistributed >= rule.minAmount &&
        (!rule.maxAmount || distribution.totalDistributed < rule.maxAmount),
    );

    if (!approvalRule) {
      throw new Error("No matching approval rule found");
    }

    // Create approval steps
    const approvalSteps = approvalRule.approvers.map((approver, index) => ({
      id: `approval-${Date.now()}-${index}`,
      order: approver.order,
      approverId: `user-${index + 1}`,
      approverName: `${approver.role} User`,
      approverRole: approver.role,
      approverEmail: `${approver.role.toLowerCase().replace(/\s+/g, ".")}@quantum.vc`,
      status: index === 0 ? ("pending" as const) : ("pending" as const),
      requiredComment: false,
      assignedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      notificationSent: index === 0,
    }));

    const updated = {
      ...distribution,
      status: "pending-approval" as const,
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
          userRole: "PM",
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

  const payload = await requestJson<unknown>(
    `/distributions/${params.distributionId}/submit`,
    {
      method: "POST",
      body: { comment: params.comment },
      fallbackMessage: "Failed to submit distribution for approval",
    },
  );
  return mapApiDistributionToUi(payload);
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
  params: ApproveDistributionParams,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex(
      (d) => d.id === params.distributionId,
    );
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex(
      (s) => s.order === currentStep,
    );

    if (stepIndex === -1) {
      throw new Error("Current approval step not found");
    }

    // Update approval step
    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: "approved",
      comment: params.comment,
      respondedAt: new Date().toISOString(),
    };

    // Check if this was the last approval step
    const isLastStep = currentStep === distribution.approvalSteps.length;

    const updated = {
      ...distribution,
      status: isLastStep ? ("approved" as const) : distribution.status,
      currentApprovalStep: isLastStep ? currentStep : currentStep + 1,
      approvedAt: isLastStep
        ? new Date().toISOString()
        : distribution.approvedAt,
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

  const payload = await requestJson<unknown>(
    `/distributions/${params.distributionId}/approve`,
    {
      method: "POST",
      body: { decision: "approve", comment: params.comment },
      fallbackMessage: "Failed to approve distribution",
    },
  );
  return mapApiDistributionToUi(payload);
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
  params: RejectDistributionParams,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex(
      (d) => d.id === params.distributionId,
    );
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex(
      (s) => s.order === currentStep,
    );

    if (stepIndex === -1) {
      throw new Error("Current approval step not found");
    }

    // Update approval step
    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: "rejected",
      comment: params.reason,
      respondedAt: new Date().toISOString(),
    };

    const updated = {
      ...distribution,
      status: "rejected" as const,
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

  const payload = await requestJson<unknown>(
    `/distributions/${params.distributionId}/approve`,
    {
      method: "POST",
      body: { decision: "reject", comment: params.reason },
      fallbackMessage: "Failed to reject distribution",
    },
  );
  return mapApiDistributionToUi(payload);
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
  params: ReturnForRevisionParams,
): Promise<Distribution> {
  if (isMockMode("backOffice")) {
    const index = mockDistributions.findIndex(
      (d) => d.id === params.distributionId,
    );
    if (index === -1) {
      throw new Error(`Distribution not found: ${params.distributionId}`);
    }

    const distribution = mockDistributions[index];
    const currentStep = distribution.currentApprovalStep || 1;
    const stepIndex = distribution.approvalSteps.findIndex(
      (s) => s.order === currentStep,
    );

    if (stepIndex === -1) {
      throw new Error("Current approval step not found");
    }

    distribution.approvalSteps[stepIndex] = {
      ...distribution.approvalSteps[stepIndex],
      status: "returned",
      comment: params.reason,
      respondedAt: new Date().toISOString(),
    };

    const updated = {
      ...distribution,
      status: "draft" as const,
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

  const payload = await requestJson<unknown>(
    `/distributions/${params.distributionId}/approve`,
    {
      method: "POST",
      body: { decision: "return", comment: params.reason },
      fallbackMessage: "Failed to return distribution for revision",
    },
  );
  return mapApiDistributionToUi(payload);
}

// ============================================================================
// Supporting Data
// ============================================================================

/**
 * Fetch distribution summary
 */
export async function fetchDistributionSummary(): Promise<DistributionSummary> {
  if (isMockMode("backOffice")) {
    return mockDistributionSummary;
  }

  const distributions = await fetchDistributions();
  const totalDistributed = distributions.reduce(
    (sum, d) => sum + d.totalDistributed,
    0,
  );
  const today = new Date();

  const byStatus = DISTRIBUTION_STATUSES.map((status) => {
    const items = distributions.filter((d) => d.status === status);
    return {
      status,
      count: items.length,
      totalAmount: items.reduce((sum, d) => sum + d.totalDistributed, 0),
    };
  }).filter((row) => row.count > 0);

  const byFund = Object.values(
    distributions.reduce<
      Record<
        string,
        { fundId: string; fundName: string; count: number; totalAmount: number }
      >
    >((acc, d) => {
      const current = acc[d.fundId] ?? {
        fundId: d.fundId,
        fundName: d.fundName,
        count: 0,
        totalAmount: 0,
      };
      current.count += 1;
      current.totalAmount += d.totalDistributed;
      acc[d.fundId] = current;
      return acc;
    }, {}),
  );

  const recentDistributions = [...distributions]
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    )
    .slice(0, 5);

  const upcomingScheduled = (await fetchDistributionCalendarEvents()).filter(
    (event) => new Date(event.date).getTime() >= today.getTime(),
  );

  return {
    totalDistributions: distributions.length,
    totalDistributed,
    pendingApproval: distributions.filter(
      (d) => d.status === "pending-approval",
    ).length,
    upcomingDistributions: upcomingScheduled.length,
    byStatus,
    byFund,
    recentDistributions,
    upcomingScheduled,
  };
}

/**
 * Fetch calendar events
 */
export async function fetchDistributionCalendarEvents(
  startDate?: string,
  endDate?: string,
): Promise<DistributionCalendarEvent[]> {
  if (isMockMode("backOffice")) {
    let events = [...mockDistributionCalendarEvents];

    if (startDate) {
      events = events.filter((e) => e.date >= startDate);
    }

    if (endDate) {
      events = events.filter((e) => e.date <= endDate);
    }

    return events;
  }

  const payload = await requestJson<ApiDistributionCalendarEvent[]>(
    `/distributions/calendar`,
    {
      query: {
        fromDate: startDate,
        toDate: endDate,
      },
      fallbackMessage: "Failed to load distribution calendar events",
    },
  );

  const events = Array.isArray(payload) ? payload : [];
  return events.map((event) => ({
    id: String(event.id),
    distributionId: String(event.id),
    title: String(event.title),
    date: toDateOnly(event.paymentDate ?? event.eventDate),
    eventType: asDistributionEventType(event.eventType),
    status: asDistributionStatus(event.status),
    ...(event.totalAmount !== undefined
      ? { amount: asFiniteNumber(event.totalAmount) }
      : {}),
    fundId: String(event.fundId),
    fundName: String(event.fundName),
    isRecurring: false,
  }));
}

/**
 * Fetch fee templates
 */
export async function fetchFeeTemplates(
  fundId?: string,
): Promise<FeeTemplate[]> {
  if (isMockMode("backOffice")) {
    if (fundId) {
      return mockFeeTemplates.filter((t) => !t.fundId || t.fundId === fundId);
    }
    return mockFeeTemplates;
  }

  const payload = await requestJson<FeeTemplate[]>(
    "/distributions/config/fee-templates",
    {
      query: fundId ? { fundId } : undefined,
      fallbackMessage: "Failed to load fee templates",
    },
  );
  return Array.isArray(payload) ? payload : [];
}

/**
 * Fetch statement templates
 */
export async function fetchStatementTemplates(): Promise<
  StatementTemplateConfig[]
> {
  if (isMockMode("backOffice")) {
    return mockStatementTemplates;
  }

  const payload = await requestJson<StatementTemplateConfig[]>(
    "/distributions/config/statement-templates",
    {
      fallbackMessage: "Failed to load statement templates",
    },
  );
  return Array.isArray(payload) ? payload : [];
}

/**
 * Fetch LP profiles
 */
export async function fetchLPProfiles(): Promise<LPProfile[]> {
  if (isMockMode("backOffice")) {
    return mockLPProfiles;
  }

  const payload = await requestJson<LPProfile[]>(
    "/distributions/config/lp-profiles",
    {
      fallbackMessage: "Failed to load LP profiles",
    },
  );
  return Array.isArray(payload) ? payload : [];
}

/**
 * Fetch LP profile by ID
 */
export async function fetchLPProfile(id: string): Promise<LPProfile> {
  if (isMockMode("backOffice")) {
    const profile = mockLPProfiles.find((p) => p.id === id);
    if (!profile) {
      throw new Error(`LP profile not found: ${id}`);
    }
    return profile;
  }

  const profiles = await fetchLPProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) {
    throw new Error(`LP profile not found: ${id}`);
  }
  return profile;
}

/**
 * Fetch approval rules
 */
export async function fetchApprovalRules(): Promise<ApprovalRule[]> {
  if (isMockMode("backOffice")) {
    return mockApprovalRules;
  }

  const payload = await requestJson<ApprovalRule[]>(
    "/distributions/config/approval-rules",
    {
      fallbackMessage: "Failed to load approval rules",
    },
  );
  return Array.isArray(payload) ? payload : [];
}
