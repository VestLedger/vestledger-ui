"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge, Button, Card } from "@/ui";
import { ListItemCard, SectionHeader, StatusBadge } from '@/ui/composites';
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
          .filter((item) => item.confirmedAt)
          .map((item) => item.id)
      )
  );

  const isConfirmed = useCallback(
    (item: LPDistributionConfirmation) =>
      confirmedIds.has(item.id) || Boolean(item.confirmedAt),
    [confirmedIds]
  );

  const pendingItems = useMemo(
    () =>
      confirmations.filter(
        (item) => item.requiresConfirmation && !isConfirmed(item)
      ),
    [confirmations, isConfirmed]
  );

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => new Set(prev).add(id));
  };

  return (
    <Card padding="lg">
      <SectionHeader
        title="Confirm Receipt"
        description="Acknowledge receipt of distribution statements."
        action={(
          <Badge size="sm" variant="flat">
            {pendingItems.length} pending
          </Badge>
        )}
      />

      <div className="mt-4 space-y-3">
        {confirmations.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No confirmations required right now.
          </div>
        ) : (
          confirmations.map((item) => {
            const confirmed = isConfirmed(item);
            return (
              <ListItemCard
                key={item.id}
                title={item.distributionName}
                description={`Statement date ${formatDate(item.statementDate)} - ${formatCurrency(item.amount)}`}
                meta={confirmed ? `Confirmed ${formatDate(item.confirmedAt || new Date())}` : undefined}
                badges={<StatusBadge status={confirmed ? "confirmed" : "pending"} size="sm" />}
                padding="sm"
                actions={(
                  !confirmed ? (
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
