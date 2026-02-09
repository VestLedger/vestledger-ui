"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Select } from "@/ui";
import { ListItemCard, SectionHeader, StatusBadge } from '@/ui/composites';
import type { LPDistributionElection } from "@/data/mocks/lp-portal/lp-investor-portal";
import { formatCurrency, formatDate } from "@/utils/formatting";
import { ClipboardList } from "lucide-react";

export interface DistributionElectionsProps {
  elections: LPDistributionElection[];
}

export function DistributionElections({ elections }: DistributionElectionsProps) {
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(
    () => new Set(elections.filter((item) => item.status === "submitted").map((item) => item.id))
  );
  const [selectionMap, setSelectionMap] = useState<Record<string, string>>(() =>
    elections.reduce((acc, election) => {
      acc[election.id] = election.selectedOptionId || election.options[0]?.id || "";
      return acc;
    }, {} as Record<string, string>)
  );

  const pendingCount = useMemo(
    () => elections.filter((item) => !submittedIds.has(item.id)).length,
    [elections, submittedIds]
  );

  const handleSelectionChange = (id: string, value: string) => {
    setSelectionMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (id: string) => {
    setSubmittedIds((prev) => new Set(prev).add(id));
  };

  return (
    <Card padding="lg">
      <SectionHeader
        title="Distribution Elections"
        description="Choose cash or in-kind delivery for eligible distributions."
        action={(
          <Badge size="sm" variant="flat">
            {pendingCount} pending
          </Badge>
        )}
      />

      <div className="mt-4 space-y-3">
        {elections.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No election requests at this time.
          </div>
        ) : (
          elections.map((election) => {
            const isSubmitted = submittedIds.has(election.id);
            const selectedOption = selectionMap[election.id];
            return (
              <ListItemCard
                key={election.id}
                title={election.distributionName}
                description={`${election.assetName} • Due ${formatDate(election.dueDate)}`}
                meta={`Estimated value ${formatCurrency(election.estimatedValue)}`}
                padding="sm"
                badges={<StatusBadge status={isSubmitted ? "submitted" : election.status} size="sm" />}
                actions={(
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      aria-label="Election choice"
                      selectedKeys={selectedOption ? [selectedOption] : []}
                      onChange={(event) => handleSelectionChange(election.id, event.target.value)}
                      options={election.options.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                      size="sm"
                      className="min-w-[180px]"
                    />
                    <Button
                      size="sm"
                      color="primary"
                      isDisabled={isSubmitted || !selectedOption}
                      startContent={<ClipboardList className="h-4 w-4" />}
                      onPress={() => handleSubmit(election.id)}
                    >
                      {isSubmitted ? "Submitted" : "Submit"}
                    </Button>
                  </div>
                )}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
