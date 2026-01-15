"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@/ui";
import { ListItemCard, StatusBadge } from "@/components/ui";
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
              <ListItemCard
                key={item.id}
                title={item.distributionName}
                description={`Statement date ${formatDate(item.statementDate)} - ${formatCurrency(item.amount)}`}
                meta={isConfirmed ? `Confirmed ${formatDate(item.confirmedAt || new Date())}` : undefined}
                badges={<StatusBadge status={isConfirmed ? "confirmed" : "pending"} size="sm" />}
                padding="sm"
                actions={(
                  !isConfirmed ? (
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<CheckCircle className="h-4 w-4" />}
                      onPress={() => handleConfirm(item.id)}
                      isDisabled={!item.requiresConfirmation}
                    >
                      Confirm Receipt
                    </Button>
                  ) : undefined
                )}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
