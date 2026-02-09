"use client";

import { useMemo } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/ui";
import { ListItemCard, SectionHeader, StatusBadge } from '@/ui/composites';
import type {
  DistributionEventType,
  DistributionElection,
  DistributionInKindAllocation,
  DistributionInKindAsset,
  DistributionStage,
  FractionalSharePolicy,
  HoldbackEscrow,
  SecurityTransfer,
  SecondaryTransferAdjustment,
  SideLetterTerm,
  SpecialDistributionDetails,
} from "@/types/distribution";
import { formatCurrencyCompact, formatDate } from "@/utils/formatting";
import { Plus, ShieldCheck, Shuffle, FileText } from "lucide-react";

type AdvancedData = {
  dikAssets?: DistributionInKindAsset[];
  dikAllocations?: DistributionInKindAllocation[];
  elections?: DistributionElection[];
  fractionalSharePolicy?: FractionalSharePolicy;
  securityTransfers?: SecurityTransfer[];
  secondaryTransferAdjustments?: SecondaryTransferAdjustment[];
  stagedPayments?: DistributionStage[];
  holdbackEscrow?: HoldbackEscrow;
  sideLetterTerms?: SideLetterTerm[];
  specialHandling?: SpecialDistributionDetails;
};

export interface DistributionStepAdvancedProps {
  data?: AdvancedData;
  eventType?: DistributionEventType;
  onChange: (next: AdvancedData) => void;
}

const ASSET_TYPE_OPTIONS = [
  { value: "equity", label: "Equity" },
  { value: "debt", label: "Debt" },
  { value: "fund-interest", label: "Fund Interest" },
  { value: "other", label: "Other" },
];

const FRACTIONAL_OPTIONS = [
  { value: "cash-in-lieu", label: "Cash In Lieu" },
  { value: "round-down", label: "Round Down" },
  { value: "round-up", label: "Round Up" },
];

const HOLD_BACK_STATUS_OPTIONS = [
  { value: "held", label: "Held" },
  { value: "scheduled", label: "Scheduled" },
  { value: "released", label: "Released" },
];

const STAGE_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

const SECONDARY_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Review" },
  { value: "applied", label: "Applied" },
];

const SECURITY_TRANSFER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "processing", label: "Processing" },
  { value: "settled", label: "Settled" },
  { value: "failed", label: "Failed" },
];

const SPECIAL_CATEGORY_OPTIONS = [
  { value: "dividend-recap", label: "Dividend Recap" },
  { value: "refinancing", label: "Refinancing" },
  { value: "secondary", label: "Secondary Transfer" },
  { value: "other", label: "Other" },
];

export function DistributionStepAdvanced({ data, eventType, onChange }: DistributionStepAdvancedProps) {
  const dikAssets = useMemo(() => data?.dikAssets ?? [], [data?.dikAssets]);
  const dikAllocations = data?.dikAllocations ?? [];
  const elections = data?.elections ?? [];
  const securityTransfers = data?.securityTransfers ?? [];
  const stagedPayments = data?.stagedPayments ?? [];
  const secondaryTransferAdjustments = data?.secondaryTransferAdjustments ?? [];
  const sideLetterTerms = data?.sideLetterTerms ?? [];
  const fractionalSharePolicy = data?.fractionalSharePolicy;
  const holdbackEscrow = data?.holdbackEscrow;
  const specialHandling = data?.specialHandling;

  const updateData = (patch: Partial<AdvancedData>) => {
    onChange({
      ...data,
      ...patch,
    });
  };

  const totalDikValue = useMemo(
    () => dikAssets.reduce((sum, asset) => sum + asset.totalValue, 0),
    [dikAssets]
  );
  const assetOptions = useMemo(
    () => dikAssets.map((asset) => ({ value: asset.id, label: asset.name })),
    [dikAssets]
  );

  const handleAssetChange = (id: string, patch: Partial<DistributionInKindAsset>) => {
    updateData({
      dikAssets: dikAssets.map((asset) =>
        asset.id === id
          ? {
              ...asset,
              ...patch,
              totalValue: (patch.totalShares ?? asset.totalShares) * (patch.perShareValue ?? asset.perShareValue),
            }
          : asset
      ),
    });
  };

  const handleAddAsset = () => {
    const nextAsset: DistributionInKindAsset = {
      id: `dik-asset-${Date.now()}`,
      name: "New In-Kind Asset",
      assetType: "equity",
      totalShares: 10_000,
      perShareValue: 10,
      totalValue: 100_000,
      notes: "Add asset details.",
    };
    updateData({ dikAssets: [...dikAssets, nextAsset] });
  };

  const handleTransferChange = (id: string, patch: Partial<SecurityTransfer>) => {
    updateData({
      securityTransfers: securityTransfers.map((transfer) =>
        transfer.id === id ? { ...transfer, ...patch } : transfer
      ),
    });
  };

  const handleAddTransfer = () => {
    const nextTransfer: SecurityTransfer = {
      id: `transfer-${Date.now()}`,
      assetId: dikAssets[0]?.id ?? "",
      lpId: "lp-new",
      lpName: "New LP",
      transferAgent: "Transfer Agent",
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
      referenceId: "TA-REF",
    };
    updateData({ securityTransfers: [...securityTransfers, nextTransfer] });
  };

  const handleStageChange = (id: string, patch: Partial<DistributionStage>) => {
    updateData({
      stagedPayments: stagedPayments.map((stage) =>
        stage.id === id ? { ...stage, ...patch } : stage
      ),
    });
  };

  const handleAddStage = () => {
    const nextStage: DistributionStage = {
      id: `stage-${Date.now()}`,
      label: "New Stage",
      scheduledDate: new Date().toISOString().split("T")[0],
      amount: 1_000_000,
      status: "scheduled",
    };
    updateData({ stagedPayments: [...stagedPayments, nextStage] });
  };

  const handleAdjustmentChange = (id: string, patch: Partial<SecondaryTransferAdjustment>) => {
    updateData({
      secondaryTransferAdjustments: secondaryTransferAdjustments.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const handleAddAdjustment = () => {
    const nextAdjustment: SecondaryTransferAdjustment = {
      id: `adjust-${Date.now()}`,
      lpId: "lp-new",
      lpName: "New LP",
      adjustmentAmount: 0,
      reason: "Secondary adjustment",
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    updateData({ secondaryTransferAdjustments: [...secondaryTransferAdjustments, nextAdjustment] });
  };

  const handleSideLetterChange = (id: string, patch: Partial<SideLetterTerm>) => {
    updateData({
      sideLetterTerms: sideLetterTerms.map((term) =>
        term.id === id ? { ...term, ...patch } : term
      ),
    });
  };

  const handleAddSideLetter = () => {
    const nextTerm: SideLetterTerm = {
      id: `side-letter-${Date.now()}`,
      lpId: "lp-new",
      lpName: "New LP",
      termType: "Custom term",
      description: "Describe special terms for this LP.",
      adjustmentType: "other",
      adjustmentValue: "TBD",
      applied: false,
    };
    updateData({ sideLetterTerms: [...sideLetterTerms, nextTerm] });
  };

  const handleHoldbackChange = (patch: Partial<HoldbackEscrow>) => {
    updateData({
      holdbackEscrow: {
        amount: 0,
        percentage: 0,
        reason: "",
        releaseDate: new Date().toISOString().split("T")[0],
        status: "scheduled",
        ...holdbackEscrow,
        ...patch,
      },
    });
  };

  const handleSpecialHandlingChange = (patch: Partial<SpecialDistributionDetails>) => {
    updateData({
      specialHandling: {
        category: "other",
        summary: "",
        ...specialHandling,
        ...patch,
      },
    });
  };

  const handleFractionalShareChange = (patch: Partial<FractionalSharePolicy>) => {
    updateData({
      fractionalSharePolicy: {
        method: "cash-in-lieu",
        cashInLieuRate: 100,
        roundingPrecision: 2,
        ...fractionalSharePolicy,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-4">
        <SectionHeader
          title="Distribution-In-Kind Assets"
          description="Track securities, notes, and assets distributed in-kind."
          action={
            <>
              <Badge size="sm" variant="flat">
                {formatCurrencyCompact(totalDikValue)} total
              </Badge>
              <Button
                size="sm"
                variant="bordered"
                startContent={<Plus className="h-4 w-4" />}
                onPress={handleAddAsset}
              >
                Add Asset
              </Button>
            </>
          }
        />

        <div className="space-y-3">
          {dikAssets.length === 0 ? (
            <div className="text-sm text-[var(--app-text-muted)]">
              No in-kind assets added yet.
            </div>
          ) : (
            dikAssets.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-[var(--app-border)] p-3">
                <div className="grid gap-3 md:grid-cols-4">
                  <Input
                    label="Asset name"
                    value={asset.name}
                    onChange={(event) => handleAssetChange(asset.id, { name: event.target.value })}
                  />
                  <Select
                    label="Asset type"
                    selectedKeys={[asset.assetType]}
                    onChange={(event) =>
                      handleAssetChange(asset.id, { assetType: event.target.value as DistributionInKindAsset["assetType"] })
                    }
                    options={ASSET_TYPE_OPTIONS}
                  />
                  <Input
                    label="Total shares"
                    type="number"
                    value={asset.totalShares.toString()}
                    onChange={(event) => handleAssetChange(asset.id, { totalShares: Number(event.target.value) || 0 })}
                  />
                  <Input
                    label="Per-share value"
                    type="number"
                    value={asset.perShareValue.toString()}
                    onChange={(event) => handleAssetChange(asset.id, { perShareValue: Number(event.target.value) || 0 })}
                  />
                </div>
                <div className="mt-2 text-xs text-[var(--app-text-muted)]">
                  Total value {formatCurrencyCompact(asset.totalValue)}
                </div>
              </div>
            ))
          )}
        </div>

        {dikAllocations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">DIK Allocations</div>
            {dikAllocations.map((allocation) => (
              <ListItemCard
                key={allocation.id}
                title={allocation.lpName}
                description={`${allocation.sharesAllocated.toLocaleString()} shares`}
                meta={`Fractional: ${allocation.fractionalShares.toFixed(2)} • Cash-in-lieu ${formatCurrencyCompact(allocation.cashInLieuAmount)}`}
                padding="sm"
                badges={<Badge size="sm" variant="flat">{allocation.electionType}</Badge>}
              />
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg" className="space-y-4">
        <SectionHeader
          title="Security Transfer Tracking"
          description="Monitor transfer agent workflows for in-kind securities."
          action={(
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddTransfer}
            >
              Add Transfer
            </Button>
          )}
        />
        {securityTransfers.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No security transfers tracked yet.
          </div>
        ) : (
          securityTransfers.map((transfer) => (
            <div key={transfer.id} className="rounded-lg border border-[var(--app-border)] p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  label="LP name"
                  value={transfer.lpName}
                  onChange={(event) => handleTransferChange(transfer.id, { lpName: event.target.value })}
                />
                <Select
                  label="Asset"
                  selectedKeys={transfer.assetId ? [transfer.assetId] : []}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, { assetId: event.target.value })
                  }
                  options={assetOptions}
                  placeholder="Select asset"
                />
                <Input
                  label="Transfer agent"
                  value={transfer.transferAgent}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, { transferAgent: event.target.value })
                  }
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Select
                  label="Status"
                  selectedKeys={[transfer.status]}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, {
                      status: event.target.value as SecurityTransfer["status"],
                    })
                  }
                  options={SECURITY_TRANSFER_STATUS_OPTIONS}
                />
                <Input
                  label="Submitted at"
                  type="date"
                  value={transfer.submittedAt ?? ""}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, { submittedAt: event.target.value })
                  }
                />
                <Input
                  label="Settled at"
                  type="date"
                  value={transfer.settledAt ?? ""}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, { settledAt: event.target.value })
                  }
                />
              </div>
              <div className="mt-3">
                <Input
                  label="Reference ID"
                  value={transfer.referenceId ?? ""}
                  onChange={(event) =>
                    handleTransferChange(transfer.id, { referenceId: event.target.value })
                  }
                />
              </div>
            </div>
          ))
        )}
      </Card>

      <Card padding="lg" className="space-y-4">
        <SectionHeader
          title="Fractional Share Handling"
          description="Define rounding and cash-in-lieu rules for fractional shares."
          action={<Shuffle className="h-5 w-5 text-[var(--app-primary)]" />}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Method"
            selectedKeys={[fractionalSharePolicy?.method ?? "cash-in-lieu"]}
            onChange={(event) =>
              handleFractionalShareChange({ method: event.target.value as FractionalSharePolicy["method"] })
            }
            options={FRACTIONAL_OPTIONS}
          />
          <Input
            label="Cash-in-lieu rate (%)"
            type="number"
            value={(fractionalSharePolicy?.cashInLieuRate ?? 100).toString()}
            onChange={(event) => handleFractionalShareChange({ cashInLieuRate: Number(event.target.value) || 0 })}
          />
          <Input
            label="Rounding precision"
            type="number"
            value={(fractionalSharePolicy?.roundingPrecision ?? 2).toString()}
            onChange={(event) => handleFractionalShareChange({ roundingPrecision: Number(event.target.value) || 0 })}
          />
        </div>
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="LP Election Summary"
          description="Capture LP preferences for cash vs. in-kind distributions."
          action={(
            <Button size="sm" variant="bordered">
              Send Election Forms
            </Button>
          )}
        />
        {elections.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No elections collected yet.
          </div>
        ) : (
          elections.map((election) => (
            <ListItemCard
              key={election.id}
              title={election.lpName}
              description={`Preference: ${election.electionType}`}
              meta={election.submittedAt ? `Submitted ${formatDate(election.submittedAt)}` : "Awaiting response"}
              padding="sm"
              badges={<StatusBadge status={election.status} size="sm" />}
            />
          ))
        )}
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Staged Payments"
          description="Schedule partial distribution releases and true-ups."
          action={(
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddStage}
            >
              Add Stage
            </Button>
          )}
        />
        {stagedPayments.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No staged payments configured.
          </div>
        ) : (
          stagedPayments.map((stage) => (
            <div key={stage.id} className="rounded-lg border border-[var(--app-border)] p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  label="Stage"
                  value={stage.label}
                  onChange={(event) => handleStageChange(stage.id, { label: event.target.value })}
                />
                <Input
                  label="Scheduled date"
                  type="date"
                  value={stage.scheduledDate}
                  onChange={(event) => handleStageChange(stage.id, { scheduledDate: event.target.value })}
                />
                <Input
                  label="Amount"
                  type="number"
                  value={stage.amount.toString()}
                  onChange={(event) => handleStageChange(stage.id, { amount: Number(event.target.value) || 0 })}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Select
                  label="Status"
                  selectedKeys={[stage.status]}
                  onChange={(event) =>
                    handleStageChange(stage.id, { status: event.target.value as DistributionStage["status"] })
                  }
                  options={STAGE_STATUS_OPTIONS}
                />
                {stage.notes && (
                  <Badge size="sm" variant="flat">
                    {stage.notes}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Holdback & Escrow"
          description="Reserve proceeds for contingent liabilities or escrow."
          action={<ShieldCheck className="h-5 w-5 text-[var(--app-success)]" />}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Holdback amount"
            type="number"
            value={(holdbackEscrow?.amount ?? 0).toString()}
            onChange={(event) => handleHoldbackChange({ amount: Number(event.target.value) || 0 })}
          />
          <Input
            label="Holdback percentage"
            type="number"
            value={(holdbackEscrow?.percentage ?? 0).toString()}
            onChange={(event) => handleHoldbackChange({ percentage: Number(event.target.value) || 0 })}
          />
          <Input
            label="Release date"
            type="date"
            value={holdbackEscrow?.releaseDate ?? ""}
            onChange={(event) => handleHoldbackChange({ releaseDate: event.target.value })}
          />
          <Select
            label="Status"
            selectedKeys={[holdbackEscrow?.status ?? "scheduled"]}
            onChange={(event) =>
              handleHoldbackChange({ status: event.target.value as HoldbackEscrow["status"] })
            }
            options={HOLD_BACK_STATUS_OPTIONS}
          />
        </div>
        <Textarea
          label="Holdback reason"
          value={holdbackEscrow?.reason ?? ""}
          onChange={(event) => handleHoldbackChange({ reason: event.target.value })}
          minRows={2}
        />
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Side Letter Terms"
          description="Apply special LP terms such as fee offsets or withholding caps."
          action={(
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddSideLetter}
            >
              Add Term
            </Button>
          )}
        />
        {sideLetterTerms.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No side letter terms applied.
          </div>
        ) : (
          sideLetterTerms.map((term) => (
            <div key={term.id} className="rounded-lg border border-[var(--app-border)] p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="LP name"
                  value={term.lpName}
                  onChange={(event) => handleSideLetterChange(term.id, { lpName: event.target.value })}
                />
                <Input
                  label="Term type"
                  value={term.termType}
                  onChange={(event) => handleSideLetterChange(term.id, { termType: event.target.value })}
                />
                <Input
                  label="Adjustment value"
                  value={term.adjustmentValue}
                  onChange={(event) => handleSideLetterChange(term.id, { adjustmentValue: event.target.value })}
                />
                <Select
                  label="Applied"
                  selectedKeys={[term.applied ? "yes" : "no"]}
                  onChange={(event) => handleSideLetterChange(term.id, { applied: event.target.value === "yes" })}
                  options={[
                    { value: "yes", label: "Applied" },
                    { value: "no", label: "Not applied" },
                  ]}
                />
              </div>
              <Textarea
                label="Description"
                value={term.description}
                onChange={(event) => handleSideLetterChange(term.id, { description: event.target.value })}
                minRows={2}
              />
            </div>
          ))
        )}
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Secondary Transfer Adjustments"
          description="Record allocation adjustments from secondary transfers."
          action={(
            <Button
              size="sm"
              variant="bordered"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddAdjustment}
            >
              Add Adjustment
            </Button>
          )}
        />
        {secondaryTransferAdjustments.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No secondary transfer adjustments applied.
          </div>
        ) : (
          secondaryTransferAdjustments.map((adjustment) => (
            <div key={adjustment.id} className="rounded-lg border border-[var(--app-border)] p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  label="LP"
                  value={adjustment.lpName}
                  onChange={(event) => handleAdjustmentChange(adjustment.id, { lpName: event.target.value })}
                />
                <Input
                  label="Adjustment amount"
                  type="number"
                  value={adjustment.adjustmentAmount.toString()}
                  onChange={(event) =>
                    handleAdjustmentChange(adjustment.id, { adjustmentAmount: Number(event.target.value) || 0 })
                  }
                />
                <Select
                  label="Status"
                  selectedKeys={[adjustment.status]}
                  onChange={(event) =>
                    handleAdjustmentChange(adjustment.id, { status: event.target.value as SecondaryTransferAdjustment["status"] })
                  }
                  options={SECONDARY_STATUS_OPTIONS}
                />
              </div>
              <Textarea
                label="Reason"
                value={adjustment.reason}
                onChange={(event) => handleAdjustmentChange(adjustment.id, { reason: event.target.value })}
                minRows={2}
              />
            </div>
          ))
        )}
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Special Distribution Details"
          description="Capture recapitalization, refinancing, or special handling notes."
          action={(
            <div className="text-xs text-[var(--app-text-muted)]">
              Event type: {eventType ?? "N/A"}
            </div>
          )}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Category"
            selectedKeys={[specialHandling?.category ?? "other"]}
            onChange={(event) =>
              handleSpecialHandlingChange({ category: event.target.value as SpecialDistributionDetails["category"] })
            }
            options={SPECIAL_CATEGORY_OPTIONS}
          />
          <Input
            label="Leverage amount"
            type="number"
            value={(specialHandling?.leverageAmount ?? 0).toString()}
            onChange={(event) => handleSpecialHandlingChange({ leverageAmount: Number(event.target.value) || 0 })}
          />
        </div>
        <Textarea
          label="Summary"
          value={specialHandling?.summary ?? ""}
          onChange={(event) => handleSpecialHandlingChange({ summary: event.target.value })}
          minRows={2}
        />
        <Textarea
          label="Notes"
          value={specialHandling?.notes ?? ""}
          onChange={(event) => handleSpecialHandlingChange({ notes: event.target.value })}
          minRows={2}
        />
      </Card>

      <Card padding="lg" className="space-y-3">
        <SectionHeader
          title="Compliance Artifacts"
          description="Maintain supporting documentation for advanced distribution terms."
          action={<FileText className="h-5 w-5 text-[var(--app-primary)]" />}
        />
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm text-[var(--app-text-muted)]">
          Upload DIK schedules, escrow agreements, and side letter references before final approval.
        </div>
      </Card>
    </div>
  );
}
