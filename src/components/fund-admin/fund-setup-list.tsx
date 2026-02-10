'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Input, Select } from '@/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  archiveFundRequested,
  closeFundRequested,
  createFundRequested,
  fundsRequested,
  fundsSelectors,
  fundUISelectors,
  unarchiveFundRequested,
  updateFundRequested,
  type CreateFundParams,
} from '@/store/slices/fundSlice';
import { FundSetupForm } from './fund-setup-form';
import { FundSetupDetail } from './fund-setup-detail';
import { FundSetupCloseArchiveDialog } from './fund-setup-close-archive-dialog';
import { formatCurrencyCompact } from '@/utils/formatting';
import type { Fund } from '@/types/fund';

type FundSetupUIState = {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'closed' | 'fundraising' | 'archived';
  selectedFundId: string | null;
};

interface FundSetupListProps {
  canMutate: boolean;
  createSignal?: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Funds' },
  { value: 'active', label: 'Active' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

type ConfirmAction = 'close' | 'archive' | 'unarchive';

export function FundSetupList({ canMutate, createSignal = 0 }: FundSetupListProps) {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useAsyncData(fundsRequested, fundsSelectors.selectState, {
    params: {},
  });

  const visibleFunds = useAppSelector(fundUISelectors.selectVisibleFunds);
  const archivedFunds = useAppSelector(fundUISelectors.selectArchivedFunds);
  const mutationStatus = useAppSelector(fundUISelectors.selectMutationStatus);

  const { value: ui, patch: patchUI } = useUIKey<FundSetupUIState>('fund-setup', {
    searchQuery: '',
    statusFilter: 'all',
    selectedFundId: null,
  });

  const [isFormOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Fund | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const allFunds = useMemo(() => {
    const archivedIds = new Set(archivedFunds.map((fund) => fund.id));
    const merged = [...visibleFunds, ...archivedFunds];
    return merged.map((fund) => ({
      fund,
      isArchived: archivedIds.has(fund.id),
    }));
  }, [archivedFunds, visibleFunds]);

  const filteredFunds = useMemo(() => {
    const query = ui.searchQuery.trim().toLowerCase();
    return allFunds.filter(({ fund, isArchived }) => {
      const matchesSearch = query.length === 0
        || fund.name.toLowerCase().includes(query)
        || fund.displayName.toLowerCase().includes(query)
        || fund.strategy.toLowerCase().includes(query);

      const matchesStatus = ui.statusFilter === 'all'
        ? true
        : ui.statusFilter === 'archived'
          ? isArchived
          : fund.status === ui.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allFunds, ui.searchQuery, ui.statusFilter]);

  const selectedFund = useMemo(() => {
    if (!ui.selectedFundId) return filteredFunds[0]?.fund ?? null;
    return allFunds.find(({ fund }) => fund.id === ui.selectedFundId)?.fund ?? filteredFunds[0]?.fund ?? null;
  }, [allFunds, filteredFunds, ui.selectedFundId]);

  const selectedIsArchived = selectedFund ? archivedFunds.some((fund) => fund.id === selectedFund.id) : false;

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  useEffect(() => {
    if (!canMutate) return;
    if (createSignal <= 0) return;
    openCreate();
  }, [canMutate, createSignal]);

  const openEdit = () => {
    if (!selectedFund) return;
    setEditTarget(selectedFund);
    setFormOpen(true);
  };

  const submitForm = (values: CreateFundParams) => {
    if (editTarget) {
      dispatch(updateFundRequested({ fundId: editTarget.id, data: values }));
    } else {
      dispatch(createFundRequested(values));
    }
    setFormOpen(false);
  };

  const submitConfirm = () => {
    if (!selectedFund || !confirmAction) return;

    if (confirmAction === 'close') {
      dispatch(closeFundRequested({ fundId: selectedFund.id }));
    }
    if (confirmAction === 'archive') {
      dispatch(archiveFundRequested({ fundId: selectedFund.id }));
    }
    if (confirmAction === 'unarchive') {
      dispatch(unarchiveFundRequested({ fundId: selectedFund.id }));
    }

    setConfirmAction(null);
  };

  const formInitialValues: CreateFundParams | undefined = editTarget
    ? {
        name: editTarget.name,
        displayName: editTarget.displayName,
        fundNumber: editTarget.fundNumber,
        status: editTarget.status,
        strategy: editTarget.strategy,
        vintage: editTarget.vintage,
        fundTerm: editTarget.fundTerm,
        totalCommitment: editTarget.totalCommitment,
        deployedCapital: editTarget.deployedCapital,
        availableCapital: editTarget.availableCapital,
        portfolioValue: editTarget.portfolioValue,
        minInvestment: editTarget.minInvestment,
        maxInvestment: editTarget.maxInvestment,
        targetSectors: editTarget.targetSectors,
        targetStages: editTarget.targetStages,
        managers: editTarget.managers,
        startDate: editTarget.startDate,
        endDate: editTarget.endDate,
        description: editTarget.description,
        irr: editTarget.irr,
        tvpi: editTarget.tvpi,
        dpi: editTarget.dpi,
      }
    : undefined;

  const isMutationPending = mutationStatus === 'loading';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card padding="md" className="xl:col-span-1" data-testid="funds-list">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Fund Setup</h3>
          {canMutate && (
            <Button size="sm" color="primary" onPress={openCreate}>
              New Fund
            </Button>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <Input
            size="sm"
            placeholder="Search funds"
            value={ui.searchQuery}
            onChange={(event) => patchUI({ searchQuery: event.target.value })}
          />
          <Select
            size="sm"
            aria-label="Status filter"
            selectedKeys={[ui.statusFilter]}
            onChange={(event) =>
              patchUI({
                statusFilter: event.target.value as FundSetupUIState['statusFilter'],
              })
            }
            options={STATUS_OPTIONS}
          />
        </div>

        {error && (
          <div className="text-xs text-[var(--app-danger)] mb-2">
            Failed to load funds. <button className="underline" onClick={refetch}>Retry</button>
          </div>
        )}

        <div className="space-y-2 max-h-[620px] overflow-y-auto">
          {isLoading && <div className="text-sm text-[var(--app-text-muted)]">Loading funds…</div>}

          {!isLoading && filteredFunds.length === 0 && (
            <div className="text-sm text-[var(--app-text-muted)]">No funds match your filters.</div>
          )}

          {filteredFunds.map(({ fund, isArchived }) => {
            const isSelected = selectedFund?.id === fund.id;

            return (
              <button
                key={fund.id}
                data-testid="fund-item"
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-bg)]'
                    : 'border-[var(--app-border)] bg-[var(--app-surface-hover)]'
                }`}
                onClick={() => patchUI({ selectedFundId: fund.id })}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium truncate">{fund.displayName}</div>
                  <div className="flex items-center gap-1">
                    {isArchived && <Badge size="sm" color="warning">Archived</Badge>}
                    <Badge size="sm" variant="flat">{fund.status}</Badge>
                  </div>
                </div>
                <div className="text-xs text-[var(--app-text-muted)] truncate">{fund.name}</div>
                <div className="text-xs text-[var(--app-text-subtle)] mt-1">
                  {formatCurrencyCompact(fund.totalCommitment)} commitment
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="xl:col-span-2">
        <FundSetupDetail
          fund={selectedFund}
          isArchived={selectedIsArchived}
          canMutate={canMutate}
          onEdit={openEdit}
          onCloseFund={() => setConfirmAction('close')}
          onArchive={() => setConfirmAction('archive')}
          onUnarchive={() => setConfirmAction('unarchive')}
        />

        {!canMutate && (
          <Card padding="sm" className="mt-3">
            <p className="text-xs text-[var(--app-text-muted)]">
              You have read-only access. Ops and GP roles can mutate fund setup data.
            </p>
          </Card>
        )}
      </div>

      <FundSetupForm
        isOpen={isFormOpen}
        mode={editTarget ? 'edit' : 'create'}
        initialValues={formInitialValues}
        isSubmitting={isMutationPending}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <FundSetupCloseArchiveDialog
        isOpen={confirmAction === 'close'}
        title="Close Fund"
        body="Closing this fund sets status to closed and prevents new active deployment workflows."
        confirmLabel="Close Fund"
        isLoading={isMutationPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={submitConfirm}
      />

      <FundSetupCloseArchiveDialog
        isOpen={confirmAction === 'archive'}
        title="Archive Fund"
        body="Archived funds are hidden from default active lists but remain available for history and reporting."
        confirmLabel="Archive"
        confirmColor="warning"
        isLoading={isMutationPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={submitConfirm}
      />

      <FundSetupCloseArchiveDialog
        isOpen={confirmAction === 'unarchive'}
        title="Unarchive Fund"
        body="This will restore the fund to active list visibility."
        confirmLabel="Unarchive"
        confirmColor="success"
        isLoading={isMutationPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={submitConfirm}
      />

      {data?.funds && data.funds.length === 0 && canMutate && (
        <Card padding="sm" className="xl:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-[var(--app-text-muted)]">No funds are configured yet.</div>
            <Button size="sm" color="primary" onPress={openCreate}>Create First Fund</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
