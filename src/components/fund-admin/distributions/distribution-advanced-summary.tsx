"use client";

import { useMemo } from "react";
import { Badge, Card } from "@/ui";
import { ListItemCard, SectionHeader, StatusBadge } from "@/components/ui";
import type { Distribution } from "@/types/distribution";
import { formatCurrencyCompact, formatDate, formatPercent } from "@/utils/formatting";

export interface DistributionAdvancedSummaryProps {
  distribution: Distribution;
}

const formatOptionalDate = (value?: string) => (value ? formatDate(value) : "TBD");

export function DistributionAdvancedSummary({ distribution }: DistributionAdvancedSummaryProps) {
  const dikAssets = useMemo(() => distribution.dikAssets ?? [], [distribution.dikAssets]);
  const dikAllocations = distribution.dikAllocations ?? [];
  const elections = distribution.elections ?? [];
  const fractionalSharePolicy = distribution.fractionalSharePolicy;
  const securityTransfers = distribution.securityTransfers ?? [];
  const secondaryTransferAdjustments = distribution.secondaryTransferAdjustments ?? [];
  const stagedPayments = distribution.stagedPayments ?? [];
  const holdbackEscrow = distribution.holdbackEscrow;
  const sideLetterTerms = distribution.sideLetterTerms ?? [];
  const specialHandling = distribution.specialHandling;

  const totalDikValue = useMemo(
    () => dikAssets.reduce((sum, asset) => sum + asset.totalValue, 0),
    [dikAssets]
  );
  const assetMap = useMemo(
    () => new Map(dikAssets.map((asset) => [asset.id, asset])),
    [dikAssets]
  );

  const hasAdvancedData =
    dikAssets.length > 0 ||
    dikAllocations.length > 0 ||
    elections.length > 0 ||
    securityTransfers.length > 0 ||
    secondaryTransferAdjustments.length > 0 ||
    stagedPayments.length > 0 ||
    sideLetterTerms.length > 0 ||
    Boolean(holdbackEscrow) ||
    Boolean(fractionalSharePolicy) ||
    Boolean(specialHandling);

  if (!hasAdvancedData) {
    return (
      <Card padding="lg">
        <SectionHeader
          title="Advanced Distribution Features"
          description="No advanced distribution data has been captured for this event yet."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <SectionHeader
          title="In-Kind Distribution Package"
          description="Review assets, elections, and transfer activity for in-kind distributions."
          action={(
            <Badge size="sm" variant="flat">
              {formatCurrencyCompact(totalDikValue)} total DIK
            </Badge>
          )}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">DIK Assets</div>
              <Badge size="sm" variant="flat">
                {dikAssets.length} assets
              </Badge>
            </div>
            {dikAssets.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No in-kind assets recorded.
              </div>
            ) : (
              dikAssets.map((asset) => (
                <ListItemCard
                  key={asset.id}
                  title={asset.name}
                  description={`${asset.totalShares.toLocaleString()} shares @ ${formatCurrencyCompact(asset.perShareValue)} (${formatCurrencyCompact(asset.totalValue)} total)`}
                  meta={`Custody ${asset.custodyAccount ?? "TBD"} • Settlement ${formatOptionalDate(asset.settlementDate)}`}
                  padding="sm"
                  badges={<Badge size="sm" variant="flat">{asset.assetType}</Badge>}
                />
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">DIK Allocations</div>
              <Badge size="sm" variant="flat">
                {dikAllocations.length} allocations
              </Badge>
            </div>
            {dikAllocations.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No in-kind allocations configured.
              </div>
            ) : (
              dikAllocations.map((allocation) => {
                const assetName = assetMap.get(allocation.assetId)?.name ?? "In-kind asset";
                return (
                  <ListItemCard
                    key={allocation.id}
                    title={allocation.lpName}
                    description={`${assetName} • ${allocation.sharesAllocated.toLocaleString()} shares`}
                    meta={`Fractional ${allocation.fractionalShares.toFixed(2)} • Cash-in-lieu ${formatCurrencyCompact(allocation.cashInLieuAmount)}`}
                    padding="sm"
                    badges={<Badge size="sm" variant="flat">{allocation.electionType}</Badge>}
                  />
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Security Transfers</div>
              <Badge size="sm" variant="flat">
                {securityTransfers.length} transfers
              </Badge>
            </div>
            {securityTransfers.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No transfer agent workflows recorded.
              </div>
            ) : (
              securityTransfers.map((transfer) => {
                const assetName = assetMap.get(transfer.assetId)?.name ?? "Security";
                const reference = transfer.referenceId ? ` • Ref ${transfer.referenceId}` : "";
                return (
                  <ListItemCard
                    key={transfer.id}
                    title={transfer.lpName}
                    description={`${assetName} • Agent ${transfer.transferAgent}`}
                    meta={`Submitted ${formatOptionalDate(transfer.submittedAt)} • Settled ${formatOptionalDate(transfer.settledAt)}${reference}`}
                    padding="sm"
                    badges={<StatusBadge status={transfer.status} size="sm" domain="fund-admin" />}
                  />
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">LP Elections</div>
              <Badge size="sm" variant="flat">
                {elections.length} elections
              </Badge>
            </div>
            {elections.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No election responses recorded.
              </div>
            ) : (
              elections.map((election) => {
                const allocationMix =
                  election.electionType === "split" && election.cashPercentage !== undefined
                    ? ` (${formatPercent(election.cashPercentage, 0)} cash / ${formatPercent(election.sharePercentage ?? 0, 0)} shares)`
                    : "";
                return (
                  <ListItemCard
                    key={election.id}
                    title={election.lpName}
                    description={`Preference: ${election.electionType}${allocationMix}`}
                    meta={election.submittedAt ? `Submitted ${formatDate(election.submittedAt)}` : "Awaiting response"}
                    padding="sm"
                    badges={<StatusBadge status={election.status} size="sm" domain="fund-admin" />}
                  />
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Fractional Share Policy</div>
            {fractionalSharePolicy ? (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
                <div className="flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                  <Badge size="sm" variant="flat">
                    {fractionalSharePolicy.method}
                  </Badge>
                  <Badge size="sm" variant="flat">
                    Cash-in-lieu {formatPercent(fractionalSharePolicy.cashInLieuRate ?? 0, 1)}
                  </Badge>
                  <Badge size="sm" variant="flat">
                    Rounding {fractionalSharePolicy.roundingPrecision ?? 0} decimals
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--app-text-muted)]">
                No fractional share policy set.
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card padding="lg" className="space-y-6">
        <SectionHeader
          title="Advanced Distribution Controls"
          description="Track staged payments, holdbacks, and special terms applied to this distribution."
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Staged Payments</div>
              <Badge size="sm" variant="flat">
                {stagedPayments.length} stages
              </Badge>
            </div>
            {stagedPayments.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No staged payments configured.
              </div>
            ) : (
              stagedPayments.map((stage) => (
                <ListItemCard
                  key={stage.id}
                  title={stage.label}
                  description={`Scheduled ${formatDate(stage.scheduledDate)} • ${formatCurrencyCompact(stage.amount)}`}
                  meta={stage.notes ?? "No additional notes."}
                  padding="sm"
                  badges={<StatusBadge status={stage.status} size="sm" domain="fund-admin" />}
                />
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Holdback & Escrow</div>
            {holdbackEscrow ? (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-[var(--app-text-muted)]">Holdback Amount</div>
                    <div className="font-semibold">
                      {formatCurrencyCompact(holdbackEscrow.amount)} ({formatPercent(holdbackEscrow.percentage, 1)})
                    </div>
                  </div>
                  <StatusBadge status={holdbackEscrow.status} size="sm" domain="fund-admin" />
                </div>
                <div className="mt-2 text-xs text-[var(--app-text-muted)]">
                  Release {formatOptionalDate(holdbackEscrow.releaseDate)} • {holdbackEscrow.reason}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--app-text-muted)]">
                No holdback or escrow configured.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Secondary Transfer Adjustments</div>
              <Badge size="sm" variant="flat">
                {secondaryTransferAdjustments.length} adjustments
              </Badge>
            </div>
            {secondaryTransferAdjustments.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No secondary transfer adjustments logged.
              </div>
            ) : (
              secondaryTransferAdjustments.map((adjustment) => (
                <ListItemCard
                  key={adjustment.id}
                  title={adjustment.lpName}
                  description={`${formatCurrencyCompact(adjustment.adjustmentAmount)} adjustment`}
                  meta={`Effective ${formatDate(adjustment.effectiveDate)} • ${adjustment.reason}`}
                  padding="sm"
                  badges={<StatusBadge status={adjustment.status} size="sm" domain="fund-admin" />}
                />
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Side Letter Terms</div>
              <Badge size="sm" variant="flat">
                {sideLetterTerms.length} terms
              </Badge>
            </div>
            {sideLetterTerms.length === 0 ? (
              <div className="text-sm text-[var(--app-text-muted)]">
                No side letter terms applied.
              </div>
            ) : (
              sideLetterTerms.map((term) => (
                <ListItemCard
                  key={term.id}
                  title={term.lpName}
                  description={`${term.termType} • ${term.adjustmentValue}`}
                  meta={term.description}
                  padding="sm"
                  badges={
                    <StatusBadge
                      status={term.applied ? "applied" : "pending"}
                      size="sm"
                      domain="fund-admin"
                    />
                  }
                />
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Special Distribution Details</div>
            {specialHandling ? (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" variant="flat">
                    {specialHandling.category}
                  </Badge>
                  {specialHandling.leverageAmount !== undefined && (
                    <Badge size="sm" variant="flat">
                      Leverage {formatCurrencyCompact(specialHandling.leverageAmount)}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-xs text-[var(--app-text-muted)]">
                  {specialHandling.summary}
                </div>
                {specialHandling.notes && (
                  <div className="mt-2 text-xs text-[var(--app-text-subtle)]">
                    {specialHandling.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-[var(--app-text-muted)]">
                No special distribution handling recorded.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
