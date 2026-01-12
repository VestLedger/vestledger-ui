'use client';

import { useEffect, useMemo } from 'react';
import { Button, Input, Select, Textarea } from '@/ui';
import { useUIKey } from '@/store/ui';
import type { FeeLineItem, FeeTemplate, FeeType } from '@/types/distribution';
import { formatCurrencyCompact } from '@/utils/formatting';
import { Plus, Trash2 } from 'lucide-react';

type FeeExpenseTableUIState = {
  selectedTemplateId: string;
  managementFeeBase: number;
  managementFeeRate: number;
  managementFeeBaseSource: 'gross' | 'custom';
};

const feeTypeOptions: Array<{ value: FeeType; label: string }> = [
  { value: 'management-fee', label: 'Management Fee' },
  { value: 'transaction-cost', label: 'Transaction Cost' },
  { value: 'legal-fee', label: 'Legal Fee' },
  { value: 'audit-fee', label: 'Audit Fee' },
  { value: 'admin-fee', label: 'Admin Fee' },
  { value: 'other', label: 'Other' },
];

const getFeeAmount = (item: FeeLineItem, grossProceeds: number) => {
  if (item.amount > 0) return item.amount;
  if (item.percentage) return (item.percentage / 100) * grossProceeds;
  return 0;
};

export interface FeeExpenseTableProps {
  items: FeeLineItem[];
  templates: FeeTemplate[];
  grossProceeds: number;
  isLoading: boolean;
  error?: { message?: string } | null;
  onRetry?: () => void;
  onChange: (items: FeeLineItem[]) => void;
}

export function FeeExpenseTable({
  items,
  templates,
  grossProceeds,
  isLoading,
  error,
  onRetry,
  onChange,
}: FeeExpenseTableProps) {
  const { value: ui, patch: patchUI } = useUIKey<FeeExpenseTableUIState>(
    'distribution-fee-expense-table',
    {
      selectedTemplateId: '',
      managementFeeBase: grossProceeds,
      managementFeeRate: 2,
      managementFeeBaseSource: 'gross',
    }
  );

  const totalFees = useMemo(
    () => items.reduce((sum, item) => sum + getFeeAmount(item, grossProceeds), 0),
    [grossProceeds, items]
  );
  const netProceeds = Math.max(0, grossProceeds - totalFees);
  const feePercent = grossProceeds > 0 ? (totalFees / grossProceeds) * 100 : 0;
  const managementFeeAmount = (ui.managementFeeBase * ui.managementFeeRate) / 100;

  const selectedTemplate = templates.find((template) => template.id === ui.selectedTemplateId);

  useEffect(() => {
    if (ui.managementFeeBaseSource !== 'gross') return;
    if (ui.managementFeeBase !== grossProceeds) {
      patchUI({ managementFeeBase: grossProceeds });
    }
  }, [grossProceeds, patchUI, ui.managementFeeBase, ui.managementFeeBaseSource]);

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    const now = new Date().toISOString();
    const nextItems = selectedTemplate.feeLineItems.map((item, index) => ({
      id: `fee-${Date.now()}-${index}`,
      type: item.type,
      description: item.description,
      amount: item.amount,
      percentage: item.percentage,
      notes: item.notes,
      createdAt: now,
      updatedAt: now,
    }));
    onChange(nextItems);
  };

  const handleAddFee = () => {
    const now = new Date().toISOString();
    onChange([
      ...items,
      {
        id: `fee-${Date.now()}`,
        type: 'management-fee',
        description: '',
        amount: 0,
        percentage: undefined,
        notes: '',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  const handleUpdate = (id: string, patch: Partial<FeeLineItem>) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleApplyManagementFee = () => {
    if (managementFeeAmount <= 0) return;
    const now = new Date().toISOString();
    const notes = `Calculated on ${formatCurrencyCompact(ui.managementFeeBase)} base.`;
    const existingIndex = items.findIndex((item) => item.type === 'management-fee');
    if (existingIndex !== -1) {
      const nextItems = items.map((item, index) => {
        if (index !== existingIndex) return item;
        return {
          ...item,
          description: item.description || 'Management Fee',
          amount: managementFeeAmount,
          percentage: ui.managementFeeRate,
          notes: item.notes || notes,
          updatedAt: now,
        };
      });
      onChange(nextItems);
      return;
    }
    onChange([
      ...items,
      {
        id: `fee-${Date.now()}`,
        type: 'management-fee',
        description: 'Management Fee',
        amount: managementFeeAmount,
        percentage: ui.managementFeeRate,
        notes,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          label="Fee Template"
          selectedKeys={ui.selectedTemplateId ? [ui.selectedTemplateId] : []}
          onChange={(event) => patchUI({ selectedTemplateId: event.target.value })}
          options={templates.map((template) => ({
            label: template.name,
            value: template.id,
          }))}
          placeholder={isLoading ? 'Loading templates...' : 'Choose template'}
        />
        <Button
          size="sm"
          variant="bordered"
          isDisabled={!selectedTemplate}
          onPress={handleApplyTemplate}
        >
          Apply Template
        </Button>
        {error && onRetry && (
          <Button size="sm" variant="light" onPress={onRetry}>
            Retry templates
          </Button>
        )}
        <Button
          size="sm"
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleAddFee}
        >
          Add Custom Fee
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Management Fee Calculator</div>
            <div className="text-xs text-[var(--app-text-muted)]">
              Calculate a management fee and apply it to the first matching line item.
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            onPress={handleApplyManagementFee}
            isDisabled={managementFeeAmount <= 0}
          >
            Apply Management Fee
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Base amount"
            type="number"
            value={ui.managementFeeBase.toString()}
            onChange={(event) =>
              patchUI({
                managementFeeBase: Math.max(0, Number(event.target.value) || 0),
                managementFeeBaseSource: 'custom',
              })
            }
          />
          <Input
            label="Rate (%)"
            type="number"
            value={ui.managementFeeRate.toString()}
            onChange={(event) =>
              patchUI({
                managementFeeRate: Math.max(0, Number(event.target.value) || 0),
              })
            }
          />
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2">
            <div className="text-xs text-[var(--app-text-muted)]">Calculated</div>
            <div className="font-semibold">{formatCurrencyCompact(managementFeeAmount)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
          <Button
            size="sm"
            variant="bordered"
            onPress={() =>
              patchUI({
                managementFeeBase: grossProceeds,
                managementFeeBaseSource: 'gross',
              })
            }
            isDisabled={grossProceeds <= 0}
          >
            Use Gross Proceeds
          </Button>
          <span>Applies to the first management fee line item.</span>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--app-border)] overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_120px_120px_120px_1fr_40px] gap-2 bg-[var(--app-surface-hover)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)]">
          <div title="Fee category applied to the distribution.">Type</div>
          <div title="Line item description for reporting.">Description</div>
          <div title="Fixed amount deducted from gross proceeds.">Amount</div>
          <div title="Percent of gross proceeds.">Percent</div>
          <div title="Calculated total based on amount or percentage.">Calculated</div>
          <div title="Notes for internal tracking.">Notes</div>
          <div />
        </div>
        <div className="divide-y divide-[var(--app-border)]">
          {items.length === 0 && (
            <div className="px-3 py-4 text-sm text-[var(--app-text-muted)]">
              Add fee line items to build the distribution expense stack.
            </div>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[140px_1fr_120px_120px_120px_1fr_40px] gap-2 px-3 py-3"
            >
              <Select
                selectedKeys={[item.type]}
                onChange={(event) => handleUpdate(item.id, { type: event.target.value as FeeType })}
                options={feeTypeOptions}
                aria-label="Fee type"
              />
              <Input
                value={item.description}
                onChange={(event) => handleUpdate(item.id, { description: event.target.value })}
                placeholder="Description"
              />
              <Input
                type="number"
                value={item.amount.toString()}
                onChange={(event) =>
                  handleUpdate(item.id, {
                    amount: Number(event.target.value) || 0,
                  })
                }
                placeholder="0"
              />
              <Input
                type="number"
                value={item.percentage?.toString() ?? ''}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  handleUpdate(item.id, {
                    percentage: Number.isNaN(value) ? undefined : value,
                  });
                }}
                placeholder="%"
              />
              <div className="flex items-center text-sm text-[var(--app-text-muted)]">
                {formatCurrencyCompact(getFeeAmount(item, grossProceeds))}
              </div>
              <Textarea
                value={item.notes ?? ''}
                onChange={(event) => handleUpdate(item.id, { notes: event.target.value })}
                minRows={1}
                maxRows={2}
                placeholder="Notes"
              />
              <Button
                size="sm"
                variant="light"
                isIconOnly
                aria-label="Delete fee"
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 text-[var(--app-danger)]" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-[140px_1fr_120px_120px_120px_1fr_40px] gap-2 bg-[var(--app-surface)] px-3 py-3 text-xs">
            <div className="text-[var(--app-text-muted)]">Summary</div>
            <div className="text-[var(--app-text-muted)]">Gross → Net</div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--app-text-muted)]">Gross</div>
              <div className="font-semibold">{formatCurrencyCompact(grossProceeds)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--app-text-muted)]">Fees %</div>
              <div className="font-semibold">{feePercent.toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--app-text-muted)]">Net</div>
              <div className="font-semibold">{formatCurrencyCompact(netProceeds)}</div>
            </div>
            <div className="text-[var(--app-text-muted)]">
              Fees: {formatCurrencyCompact(totalFees)}
            </div>
            <div />
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
          <div className="text-xs text-[var(--app-text-muted)]">Gross Proceeds</div>
          <div className="font-semibold">{formatCurrencyCompact(grossProceeds)}</div>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
          <div className="text-xs text-[var(--app-text-muted)]">Total Fees & Expenses</div>
          <div className="font-semibold">{formatCurrencyCompact(totalFees)}</div>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
          <div className="text-xs text-[var(--app-text-muted)]">Net Proceeds</div>
          <div className="font-semibold">{formatCurrencyCompact(netProceeds)}</div>
        </div>
      </div>
    </div>
  );
}
