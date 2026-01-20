"use client";

import { Card } from "@/ui";
import { SectionHeader } from "@/components/ui";
import type { FeeLineItem, FeeTemplate } from "@/types/distribution";
import { FeeExpenseTable, type FeeLineItemErrors } from "./fee-expense-table";

export interface DistributionStepFeesProps {
  items: FeeLineItem[];
  templates: FeeTemplate[];
  grossProceeds: number;
  isLoading: boolean;
  error?: { message?: string } | null;
  onRetry?: () => void;
  onChange: (items: FeeLineItem[]) => void;
  itemErrors?: Record<string, FeeLineItemErrors>;
  showErrors?: boolean;
}

export function DistributionStepFees({
  items,
  templates,
  grossProceeds,
  isLoading,
  error,
  onRetry,
  onChange,
  itemErrors,
  showErrors = false,
}: DistributionStepFeesProps) {
  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Fees & Expenses"
        description="Apply fee templates or add custom expenses to calculate net proceeds."
      />

      <FeeExpenseTable
        items={items}
        templates={templates}
        grossProceeds={grossProceeds}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onChange={onChange}
        itemErrors={itemErrors}
        showErrors={showErrors}
      />
    </Card>
  );
}
