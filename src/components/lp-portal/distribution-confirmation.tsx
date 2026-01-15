"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@/ui";
import type { LPDistributionConfirmation } from "@/data/mocks/lp-portal/lp-investor-portal";
import { formatCurrency, formatDate } from "@/utils/formatting";
import { CheckCircle } from "lucide-react";

export interface DistributionConfirmationProps {
  confirmations: LPDistributionConfirmation[];
}

export function DistributionConfirmation({ confirmations }: DistributionConfirmationProps) {
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(
    () =>
      new Set(
        confirmations
          .filter((item) => !item.requiresConfirmation && item.confirmedAt)
          .map((item) => item.id)
      )
  );

  const pendingItems = useMemo(
    () => confirmations.filter((item) => item.requiresConfirmation),
    [confirmations]
  );

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => new Set(prev).add(id));
  };

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Confirm Receipt</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Acknowledge receipt of distribution statements.
          </p>
        </div>
        <Badge size="sm" variant="flat">
          {pendingItems.length} pending
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {confirmations.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No confirmations required right now.
          </div>
        ) : (
          confirmations.map((item) => {
            const isConfirmed = confirmedIds.has(item.id) || Boolean(item.confirmedAt);
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--app-border)] px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold">{item.distributionName}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">
                    Statement date {formatDate(item.statementDate)} - {formatCurrency(item.amount)}
                  </div>
                  {isConfirmed && (
                    <div className="text-xs text-[var(--app-text-subtle)]">
                      Confirmed {formatDate(item.confirmedAt || new Date())}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  {isConfirmed ? (
                    <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                      Confirmed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<CheckCircle className="h-4 w-4" />}
                      onPress={() => handleConfirm(item.id)}
                      isDisabled={!item.requiresConfirmation}
                    >
                      Confirm Receipt
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
