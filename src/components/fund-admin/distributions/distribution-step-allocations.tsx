"use client";

import { Card } from "@/ui";
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
}

export function DistributionStepAllocations({
  allocations,
  totalDistributed,
  onChange,
  onRecalculate,
  comparisonMap,
  comparisonLabel,
}: DistributionStepAllocationsProps) {
  const hasComparison = !!comparisonLabel && !!comparisonMap && Object.keys(comparisonMap).length > 0;

  return (
    <Card padding="lg" className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">LP Allocations</h3>
        <p className="text-sm text-[var(--app-text-muted)]">
          Review and adjust pro-rata allocations. Total distributed: {formatCurrencyCompact(totalDistributed)}.
        </p>
        {comparisonLabel && (
          <p className="text-xs text-[var(--app-text-muted)]">
            Comparing against: {comparisonLabel}.
          </p>
        )}
      </div>

      <LPAllocationTable
        allocations={allocations}
        onChange={onChange}
        onRecalculate={onRecalculate}
        comparisonMap={comparisonMap}
        showComparison={hasComparison}
      />
    </Card>
  );
}
