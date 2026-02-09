"use client";

import { Badge, Card, Textarea } from "@/ui";
import { SectionHeader } from '@/ui/composites';
import type { ApprovalRule } from "@/types/distribution";
import { formatCurrencyCompact } from "@/utils/formatting";

export interface DistributionStepSubmitProps {
  approvalRules: ApprovalRule[];
  totalDistributed: number;
  comment: string;
  onCommentChange: (comment: string) => void;
}

export function DistributionStepSubmit({
  approvalRules,
  totalDistributed,
  comment,
  onCommentChange,
}: DistributionStepSubmitProps) {
  const selectedRule =
    approvalRules.find(
      (rule) =>
        rule.isActive &&
        totalDistributed >= rule.minAmount &&
        (rule.maxAmount === undefined || totalDistributed < rule.maxAmount)
    ) ?? null;

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Submit for Approval"
        description="Approval routing is auto-selected based on the distribution total."
      />

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="font-medium">Total Distributed</div>
          <div className="font-semibold">{formatCurrencyCompact(totalDistributed)}</div>
        </div>
        {selectedRule ? (
          <div className="mt-2 text-xs text-[var(--app-text-muted)]">
            Rule: {selectedRule.name}
          </div>
        ) : (
          <div className="mt-2 text-xs text-[var(--app-danger)]">
            No approval rule matched this distribution total.
          </div>
        )}
      </div>

      {selectedRule && (
        <div className="space-y-2">
          {selectedRule.approvers.map((approver) => (
            <div
              key={`${selectedRule.id}-${approver.role}-${approver.order}`}
              className="flex items-center justify-between rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{approver.role}</div>
                <div className="text-xs text-[var(--app-text-muted)]">
                  Step {approver.order}
                </div>
              </div>
              <Badge size="sm" variant="flat">
                {approver.isParallel ? "Parallel" : "Sequential"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Textarea
        label="Submission comment"
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        minRows={3}
        placeholder="Optional note for approvers"
      />
    </Card>
  );
}
