"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Textarea } from "@/ui";
import { SectionHeader, StatusBadge, Timeline, type TimelineItem } from "@/components/ui";
import { getStatusColorVars } from "@/utils/styling/statusColors";
import { formatDate } from "@/utils/formatting";
import type { ApprovalStatus, ApprovalStep, Distribution } from "@/types/distribution";
import {
  ArrowRight,
  Bell,
  Mail,
  MessageSquare,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

export interface ApprovalStepperProps {
  distribution: Distribution;
  onApprove: (params: { distributionId: string; approverId: string; comment: string }) => void;
  onReject: (params: { distributionId: string; approverId: string; reason: string }) => void;
  onReturnForRevision?: (params: {
    distributionId: string;
    approverId: string;
    reason: string;
  }) => void;
  isSubmitting?: boolean;
}

type ApprovalThreadItem = {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp?: string;
};

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
};

const buildInitials = (name: string) =>
  name
    .split(" ")
    .map((segment) => segment.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const buildThread = (distribution: Distribution, step: ApprovalStep): ApprovalThreadItem[] => {
  const entries: ApprovalThreadItem[] = [];

  if (step.comment) {
    entries.push({
      id: `${step.id}-comment`,
      author: step.approverName,
      role: step.approverRole,
      message: step.comment,
      timestamp: step.respondedAt ?? step.assignedAt,
    });
  }

  distribution.comments
    .filter((comment) => comment.userRole === step.approverRole)
    .forEach((comment) => {
      const duplicate = entries.some(
        (entry) => entry.author === comment.userName && entry.message === comment.comment
      );
      if (!duplicate) {
        entries.push({
          id: comment.id,
          author: comment.userName,
          role: comment.userRole,
          message: comment.comment,
          timestamp: comment.createdAt,
        });
      }
    });

  return entries.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return aTime - bTime;
  });
};

export function ApprovalStepper({
  distribution,
  onApprove,
  onReject,
  onReturnForRevision,
  isSubmitting = false,
}: ApprovalStepperProps) {
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const approvalSteps = useMemo(
    () => distribution.approvalSteps ?? [],
    [distribution.approvalSteps]
  );
  const pendingCount = approvalSteps.filter((step) => step.status === "pending").length;
  const currentStep = approvalSteps.find(
    (step) => step.order === distribution.currentApprovalStep
  );
  const activeStep =
    currentStep ?? approvalSteps.find((step) => step.status === "pending") ?? null;

  const statusSummary = useMemo(() => {
    const counts = approvalSteps.reduce(
      (acc, step) => {
        acc[step.status] += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, returned: 0 } as Record<ApprovalStatus, number>
    );
    return `Approval workflow status: ${counts.pending} pending, ${counts.approved} approved, ${counts.rejected} rejected, ${counts.returned} returned.`;
  }, [approvalSteps]);

  const auditEvents = useMemo(() => {
    const events: Array<{ id: string; label: string; timestamp?: string; status: ApprovalStatus }> = [];

    if (distribution.submittedForApprovalAt) {
      events.push({
        id: "submitted",
        label: "Submitted for approval",
        timestamp: distribution.submittedForApprovalAt,
        status: "pending",
      });
    }

    approvalSteps.forEach((step) => {
      if (step.status === "pending") return;
      events.push({
        id: `${step.id}-audit`,
        label: `${step.approverName} (${step.approverRole}) ${STATUS_LABELS[step.status].toLowerCase()}`,
        timestamp: step.respondedAt ?? step.assignedAt,
        status: step.status,
      });
    });

    return events.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });
  }, [approvalSteps, distribution.submittedForApprovalAt]);
  const auditTimelineItems: TimelineItem[] = useMemo(
    () =>
      auditEvents.map((event) => {
        const colors = getStatusColorVars(event.status, "fund-admin");
        return {
          id: event.id,
          title: event.label,
          subtitle: event.timestamp ? formatDate(event.timestamp) : undefined,
          dotColor: colors.text,
        };
      }),
    [auditEvents]
  );

  const handleCommentChange = (stepId: string, value: string) => {
    setCommentDrafts((prev) => ({ ...prev, [stepId]: value }));
  };

  const handleApprove = (step: ApprovalStep) => {
    const comment = (commentDrafts[step.id] ?? "").trim();
    if (!comment) return;
    onApprove({ distributionId: distribution.id, approverId: step.approverId, comment });
    setCommentDrafts((prev) => ({ ...prev, [step.id]: "" }));
  };

  const handleReject = (step: ApprovalStep) => {
    const comment = (commentDrafts[step.id] ?? "").trim();
    if (!comment) return;
    onReject({ distributionId: distribution.id, approverId: step.approverId, reason: comment });
    setCommentDrafts((prev) => ({ ...prev, [step.id]: "" }));
  };

  const handleReturnForRevision = (step: ApprovalStep) => {
    const comment = (commentDrafts[step.id] ?? "").trim();
    if (!comment || !onReturnForRevision) return;
    onReturnForRevision({
      distributionId: distribution.id,
      approverId: step.approverId,
      reason: comment,
    });
    setCommentDrafts((prev) => ({ ...prev, [step.id]: "" }));
  };

  if (approvalSteps.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-sm text-[var(--app-text-muted)]">
          No approval chain assigned yet.
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-5">
      <SectionHeader
        title="Approval Workflow"
        description="Role-based approvals route automatically based on distribution amount."
        action={(
          <div className="flex items-center gap-2 rounded-full bg-[var(--app-surface-hover)] px-3 py-1 text-sm">
            <Bell className="h-4 w-4 text-[var(--app-warning)]" />
            <span className="font-medium">{pendingCount}</span>
            <span className="text-[var(--app-text-muted)]">pending</span>
          </div>
        )}
      />
      <div className="sr-only" role="status" aria-live="polite">
        {statusSummary}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {approvalSteps.map((step, index) => {
          const colors = getStatusColorVars(step.status, "fund-admin");
          const badgeClass = `bg-[${colors.bg}] text-[${colors.text}]`;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <Badge size="sm" variant="flat" className={badgeClass}>
                {step.approverRole}
              </Badge>
              {index < approvalSteps.length - 1 && (
                <ArrowRight className="h-3 w-3 text-[var(--app-text-subtle)]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {approvalSteps.map((step) => {
          const isCurrent = activeStep?.id === step.id;
          const canTakeAction = step.status === "pending" && isCurrent;
          const comment = commentDrafts[step.id] ?? "";
          const hasComment = comment.trim().length > 0;
          const thread = buildThread(distribution, step);
          const colors = getStatusColorVars(step.status, "fund-admin");

          return (
            <div
              key={step.id}
              className={`rounded-lg border p-4 ${
                isCurrent ? "border-[var(--app-primary)]" : "border-[var(--app-border)]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {buildInitials(step.approverName)}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[var(--app-surface)]"
                      style={{ backgroundColor: colors.text }}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{step.approverRole}</div>
                      <StatusBadge status={step.status} domain="fund-admin" size="sm" showIcon />
                      {isCurrent && (
                        <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-[var(--app-text-muted)]">
                      {step.approverName} - {step.approverEmail}
                    </div>
                    <div className="text-xs text-[var(--app-text-subtle)]">
                      Assigned {formatDate(step.assignedAt)}
                      {step.dueDate ? ` - Due ${formatDate(step.dueDate)}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {thread.length === 0 ? (
                  <div className="text-xs text-[var(--app-text-muted)]">
                    No comments yet for this approval level.
                  </div>
                ) : (
                  thread.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-hover)] px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                        <span className="font-medium text-[var(--app-text)]">
                          {entry.author} - {entry.role}
                        </span>
                        {entry.timestamp && <span>{formatDate(entry.timestamp)}</span>}
                      </div>
                      <div className="mt-1">{entry.message}</div>
                    </div>
                  ))
                )}
              </div>

              {canTakeAction && (
                <div className="mt-4 space-y-3 border-t border-[var(--app-border-subtle)] pt-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                    <MessageSquare className="h-3 w-3" />
                    Comment required for approval decisions.
                  </div>
                  <Textarea
                    label="Decision comment"
                    value={comment}
                    onChange={(event) => handleCommentChange(step.id, event.target.value)}
                    minRows={3}
                    placeholder="Add context for your decision"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      color="primary"
                      startContent={<ThumbsUp className="h-4 w-4" />}
                      onPress={() => handleApprove(step)}
                      isDisabled={!hasComment || isSubmitting}
                    >
                      Approve
                    </Button>
                    {onReturnForRevision && (
                      <Button
                        variant="flat"
                        startContent={<RotateCcw className="h-4 w-4" />}
                        className="text-[var(--app-warning)]"
                        onPress={() => handleReturnForRevision(step)}
                        isDisabled={!hasComment || isSubmitting}
                      >
                        Return for Revision
                      </Button>
                    )}
                    <Button
                      variant="flat"
                      startContent={<ThumbsDown className="h-4 w-4" />}
                      className="text-[var(--app-danger)]"
                      onPress={() => handleReject(step)}
                      isDisabled={!hasComment || isSubmitting}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--app-border)] p-4">
          <div className="text-sm font-semibold mb-3">Approval Audit Log</div>
          {auditEvents.length === 0 ? (
            <div className="text-sm text-[var(--app-text-muted)]">
              Audit events will appear once approvals are actioned.
            </div>
          ) : (
            <Timeline items={auditTimelineItems} />
          )}
        </div>

        <div className="rounded-lg border border-[var(--app-border)] p-4">
          <div className="text-sm font-semibold mb-3">Email Notification Preview</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <Mail className="h-3 w-3" />
              {activeStep
                ? `To: ${activeStep.approverEmail}`
                : "Approval chain completed"}
            </div>
            <div className="font-medium">
              Subject: Approval required for {distribution.name}
            </div>
            <div className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-hover)] p-3 text-xs text-[var(--app-text-muted)]">
              Hi {activeStep?.approverName ?? "team"}, a distribution approval is awaiting your review.
              Please log in to VestLedger to approve or return for revision.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
