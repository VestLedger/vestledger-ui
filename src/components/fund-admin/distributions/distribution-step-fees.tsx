"use client";

import { Card } from "@/ui";
import type { FeeLineItem, FeeTemplate } from "@/types/distribution";
import { FeeExpenseTable } from "./fee-expense-table";

export interface DistributionStepFeesProps {
  items: FeeLineItem[];
  templates: FeeTemplate[];
  grossProceeds: number;
  isLoading: boolean;
  error?: { message?: string } | null;
  onRetry?: () => void;
  onChange: (items: FeeLineItem[]) => void;
}

export function DistributionStepFees({
  items,
  templates,
  grossProceeds,
  isLoading,
  error,
  onRetry,
  onChange,
}: DistributionStepFeesProps) {
  return (
    <Card padding="lg" className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fees & Expenses</h3>
        <p className="text-sm text-[var(--app-text-muted)]">
          Apply fee templates or add custom expenses to calculate net proceeds.
        </p>
      </div>

      <FeeExpenseTable
        items={items}
        templates={templates}
        grossProceeds={grossProceeds}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onChange={onChange}
      />
    </Card>
  );
}
