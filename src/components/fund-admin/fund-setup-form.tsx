'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '@/ui';
import type { CreateFundParams } from '@/store/slices/fundSlice';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'closed', label: 'Closed' },
];

const STRATEGY_OPTIONS = [
  { value: 'early-stage', label: 'Early Stage' },
  { value: 'growth', label: 'Growth' },
  { value: 'late-stage', label: 'Late Stage' },
  { value: 'multi-stage', label: 'Multi Stage' },
  { value: 'sector-specific', label: 'Sector Specific' },
];

export interface FundSetupFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: CreateFundParams;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateFundParams) => void;
}

function getDefaultFormValues(): CreateFundParams {
  const year = new Date().getFullYear();
  return {
    name: '',
    displayName: '',
    fundNumber: 1,
    status: 'fundraising',
    strategy: 'multi-stage',
    vintage: year,
    fundTerm: 10,
    totalCommitment: 100_000_000,
    deployedCapital: 0,
    availableCapital: 100_000_000,
    portfolioValue: 0,
    minInvestment: 500_000,
    maxInvestment: 5_000_000,
    targetSectors: ['AI/ML'],
    targetStages: ['Seed', 'Series A'],
    managers: [''],
    startDate: `${year}-01-01`,
    endDate: `${year + 10}-01-01`,
    description: '',
    irr: 0,
    tvpi: 1,
    dpi: 0,
  };
}

export function FundSetupForm({
  isOpen,
  mode,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
}: FundSetupFormProps) {
  const defaults = useMemo(getDefaultFormValues, []);
  const [form, setForm] = useState<CreateFundParams>(defaults);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialValues ?? defaults);
  }, [defaults, initialValues, isOpen]);

  const setNumber = (field: keyof CreateFundParams, value: string) => {
    const parsed = Number(value);
    setForm((current) => ({
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const setTextArray = (field: 'targetSectors' | 'targetStages' | 'managers', value: string) => {
    const entries = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    setForm((current) => ({
      ...current,
      [field]: entries,
    }));
  };

  const submit = () => {
    onSubmit({
      ...form,
      availableCapital: Math.max(form.totalCommitment - form.deployedCapital, 0),
      managers: form.managers.length > 0 ? form.managers : [''],
    });
  };

  const title = mode === 'create' ? 'Create New Fund' : 'Edit Fund';
  const submitLabel = mode === 'create' ? 'Create Fund' : 'Save Changes';

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size="2xl"
      footer={(
        <>
          <Button variant="bordered" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isSubmitting} onPress={submit}>
            {submitLabel}
          </Button>
        </>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Fund Name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          isRequired
        />
        <Input
          label="Display Name"
          value={form.displayName}
          onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
          isRequired
        />
        <Input
          label="Fund Number"
          type="number"
          value={String(form.fundNumber)}
          onChange={(event) => setNumber('fundNumber', event.target.value)}
          isRequired
        />
        <Input
          label="Vintage"
          type="number"
          value={String(form.vintage)}
          onChange={(event) => setNumber('vintage', event.target.value)}
          isRequired
        />
        <Select
          label="Status"
          selectedKeys={[form.status]}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              status: event.target.value as CreateFundParams['status'],
            }))
          }
          options={STATUS_OPTIONS}
        />
        <Select
          label="Strategy"
          selectedKeys={[form.strategy]}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              strategy: event.target.value as CreateFundParams['strategy'],
            }))
          }
          options={STRATEGY_OPTIONS}
        />
        <Input
          label="Total Commitment"
          type="number"
          value={String(form.totalCommitment)}
          onChange={(event) => setNumber('totalCommitment', event.target.value)}
          isRequired
        />
        <Input
          label="Deployed Capital"
          type="number"
          value={String(form.deployedCapital)}
          onChange={(event) => setNumber('deployedCapital', event.target.value)}
          isRequired
        />
        <Input
          label="Min Investment"
          type="number"
          value={String(form.minInvestment)}
          onChange={(event) => setNumber('minInvestment', event.target.value)}
          isRequired
        />
        <Input
          label="Max Investment"
          type="number"
          value={String(form.maxInvestment)}
          onChange={(event) => setNumber('maxInvestment', event.target.value)}
          isRequired
        />
        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
          isRequired
        />
        <Input
          label="End Date"
          type="date"
          value={form.endDate ?? ''}
          onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value || undefined }))}
        />
        <Input
          label="Target Sectors (comma separated)"
          value={form.targetSectors.join(', ')}
          onChange={(event) => setTextArray('targetSectors', event.target.value)}
        />
        <Input
          label="Target Stages (comma separated)"
          value={form.targetStages.join(', ')}
          onChange={(event) => setTextArray('targetStages', event.target.value)}
        />
        <Input
          label="Managers (comma separated)"
          value={form.managers.join(', ')}
          onChange={(event) => setTextArray('managers', event.target.value)}
        />
      </div>

      <Textarea
        className="mt-3"
        label="Description"
        value={form.description ?? ''}
        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        minRows={2}
      />

      <div className="mt-3">
        <Button variant="flat" size="sm" onPress={() => setShowAdvanced((value) => !value)}>
          {showAdvanced ? 'Hide Optional Metrics' : 'Show Optional Metrics'}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Input
            label="Portfolio Value"
            type="number"
            value={String(form.portfolioValue)}
            onChange={(event) => setNumber('portfolioValue', event.target.value)}
          />
          <Input
            label="IRR"
            type="number"
            value={String(form.irr ?? 0)}
            onChange={(event) => setNumber('irr', event.target.value)}
          />
          <Input
            label="TVPI"
            type="number"
            value={String(form.tvpi ?? 1)}
            onChange={(event) => setNumber('tvpi', event.target.value)}
          />
          <Input
            label="DPI"
            type="number"
            value={String(form.dpi ?? 0)}
            onChange={(event) => setNumber('dpi', event.target.value)}
          />
          <Input
            label="Fund Term (years)"
            type="number"
            value={String(form.fundTerm)}
            onChange={(event) => setNumber('fundTerm', event.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
