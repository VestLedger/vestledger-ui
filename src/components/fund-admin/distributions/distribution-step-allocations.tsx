"use client";

import { Card } from "@/ui";
import { SectionHeader } from "@/components/ui";
import type { LPAllocation } from "@/types/distribution";
import { LPAllocationTable } from "./lp-allocation-table";
import { formatCurrencyCompact } from "@/utils/formatting";

export interface DistributionStepAllocationsProps {
  allocations: LPAllocation[];
  totalDistributed: number;
  onChange: (allocations: LPAllocation[]) => void;
  onRecalculate: () => void;
  comparisonMap?: Record<string, number>;
  comparisonLabel?: string;
  allocationErrors?: Record<string, Partial<{
    grossAmount: string;
    netAmount: string;
    taxWithholdingRate: string;
  }>>;
  showErrors?: boolean;
}

export function DistributionStepAllocations({
  allocations,
  totalDistributed,
  onChange,
  onRecalculate,
  comparisonMap,
  comparisonLabel,
  allocationErrors,
  showErrors = false,
}: DistributionStepAllocationsProps) {
  const hasComparison = !!comparisonLabel && !!comparisonMap && Object.keys(comparisonMap).length > 0;

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="LP Allocations"
        description={`Review and adjust pro-rata allocations. Total distributed: ${formatCurrencyCompact(totalDistributed)}.`}
      />
      {comparisonLabel && (
        <p className="text-xs text-[var(--app-text-muted)]">
          Comparing against: {comparisonLabel}.
        </p>
      )}

      <LPAllocationTable
        allocations={allocations}
        onChange={onChange}
        onRecalculate={onRecalculate}
        comparisonMap={comparisonMap}
        showComparison={hasComparison}
        allocationErrors={allocationErrors}
        showErrors={showErrors}
      />
    </Card>
  );
}
