'use client';

import { Card, Button, Badge } from '@/ui';
import { TrendingUp, Calendar, ChevronRight, ChevronDown, Download, RefreshCw } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import { StatusBadge } from '@/components/ui';

export interface CarriedInterestTerm {
  id: string;
  fundId: string;
  fundName: string;
  gpCarryPercentage: number; // e.g., 20%
  hurdleRate: number; // e.g., 8% IRR
  preferredReturn: number; // e.g., 8%
  catchupPercentage: number; // e.g., 100% (GP gets 100% until caught up)
  catchupCap?: number; // Optional cap on catchup
  vestingSchedule: VestingSchedule;
  effectiveDate: Date;
  status: 'active' | 'inactive' | 'draft';
}

export interface VestingSchedule {
  type: 'immediate' | 'cliff' | 'graded';
  cliffMonths?: number; // e.g., 12 months
  vestingPeriodMonths?: number; // e.g., 48 months
  accelerationTriggers?: ('exit' | 'ipo' | 'change-of-control')[];
}

export interface CarryAccrual {
  id: string;
  fundId: string;
  asOfDate: Date;
  calculationDate: Date;
  totalContributions: number;
  totalDistributions: number;
  unrealizedValue: number;
  realizedGains: number;
  unrealizedGains: number;
  totalValue: number;
  lpPreferredReturn: number;
  lpPreferredReturnPaid: boolean;
  catchupAmount: number;
  catchupPaid: number;
  accruedCarry: number;
  vestedCarry: number;
  unvestedCarry: number;
  distributedCarry: number;
  remainingCarry: number;
  irr: number;
  moic: number; // Multiple on Invested Capital
  waterfall: WaterfallTier[];
  status: 'draft' | 'calculated' | 'approved' | 'distributed';
  notes?: string;
}

export interface WaterfallTier {
  tier: number;
  name: string;
  description: string;
  lpAllocation: number;
  gpAllocation: number;
  tierStart: number;
  tierEnd?: number;
  lpAmount: number;
  gpAmount: number;
  isActive: boolean;
}

interface CarriedInterestTrackerProps {
  terms?: CarriedInterestTerm[];
  accruals: CarryAccrual[];
  fundId?: string;
  onCalculateAccrual?: (fundId: string) => void;
  onEditTerms?: (fundId: string) => void;
  onApproveAccrual?: (accrualId: string) => void;
  onDistribute?: (accrualId: string) => void;
  onExport?: (accrualId: string, format: 'pdf' | 'excel') => void;
}

export function CarriedInterestTracker({
  terms = [],
  accruals,
  fundId,
  onCalculateAccrual,
  onEditTerms,
  onApproveAccrual,
  onDistribute,
  onExport,
}: CarriedInterestTrackerProps) {
  const filteredAccruals = accruals.filter((accrual) => !fundId || accrual.fundId === fundId);

  const { value: ui, patch: patchUI } = useUIKey<{
    selectedAccrualId: string | null;
    expandedWaterfall: boolean;
  }>(`carried-interest-tracker:${fundId ?? 'all'}`, {
    selectedAccrualId: filteredAccruals[0]?.id ?? null,
    expandedWaterfall: false,
  });
  const { selectedAccrualId, expandedWaterfall } = ui;

  const selectedAccrual =
    filteredAccruals.find((accrual) => accrual.id === selectedAccrualId) ??
    filteredAccruals[0] ??
    null;

  const activeTerm = terms.find(t => (!fundId || t.fundId === fundId) && t.status === 'active');

  return (
    <div className="space-y-4">
      {/* Terms Summary */}
      {activeTerm && (
        <Card padding="md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Carry Terms - {activeTerm.fundName}</h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Effective {activeTerm.effectiveDate.toLocaleDateString()}
              </p>
            </div>
            {onEditTerms && (
              <Button
                size="sm"
                variant="flat"
                onPress={() => onEditTerms(activeTerm.fundId)}
              >
                Edit Terms
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
              <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">GP Carry</p>
              <p className="text-xl font-bold text-[var(--app-primary)]">
                {formatPercent(activeTerm.gpCarryPercentage)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
              <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Hurdle Rate</p>
              <p className="text-xl font-bold text-[var(--app-info)]">
                {formatPercent(activeTerm.hurdleRate)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
              <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Pref Return</p>
              <p className="text-xl font-bold text-[var(--app-warning)]">
                {formatPercent(activeTerm.preferredReturn)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
              <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Catchup</p>
              <p className="text-xl font-bold text-[var(--app-success)]">
                {formatPercent(activeTerm.catchupPercentage)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
              <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Vesting</p>
              <p className="text-lg font-bold capitalize">
                {activeTerm.vestingSchedule.type}
              </p>
              {activeTerm.vestingSchedule.cliffMonths && (
                <p className="text-xs text-[var(--app-text-muted)]">
                  {activeTerm.vestingSchedule.cliffMonths}mo cliff
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Accrual History */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--app-primary)]" />
                  <h3 className="text-lg font-semibold">Carry History</h3>
                </div>
                {onCalculateAccrual && activeTerm && (
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<RefreshCw className="w-3 h-3" />}
                    onPress={() => onCalculateAccrual(activeTerm.fundId)}
                  >
                    Calculate
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredAccruals.map(accrual => (
                  <button
                    key={accrual.id}
                    onClick={() => patchUI({ selectedAccrualId: accrual.id })}
                    className={`w-full p-3 rounded-lg text-left transition-colors border ${
                      selectedAccrual?.id === accrual.id
                        ? 'bg-[var(--app-primary-bg)] border-[var(--app-primary)]'
                        : 'bg-[var(--app-surface-hover)] border-transparent hover:border-[var(--app-border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-[var(--app-text-muted)]" />
                        <span className="text-sm font-medium">
                          {accrual.asOfDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <StatusBadge status={accrual.status} domain="fund-admin" size="sm" />
                    </div>

                    <div className="text-lg font-bold mb-1 text-[var(--app-success)]">
                      {formatCurrency(accrual.accruedCarry)}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--app-text-muted)]">
                        IRR: {formatPercent(accrual.irr)}
                      </span>
                      <span className="text-[var(--app-text-muted)]">
                        {accrual.moic.toFixed(2)}x MOIC
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Accrual Detail */}
        <div className="lg:col-span-2">
          {selectedAccrual ? (
            <div className="space-y-4">
              {/* Header */}
              <Card padding="md">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">Carry Accrual</h3>
                      <StatusBadge status={selectedAccrual.status} domain="fund-admin" size="sm" />
                    </div>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      As of {selectedAccrual.asOfDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-[var(--app-text-subtle)]">
                      Calculated on {selectedAccrual.calculationDate.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onExport && (
                      <>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Download className="w-3 h-3" />}
                          onPress={() => onExport(selectedAccrual.id, 'pdf')}
                        >
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Download className="w-3 h-3" />}
                          onPress={() => onExport(selectedAccrual.id, 'excel')}
                        >
                          Excel
                        </Button>
                      </>
                    )}
                    {selectedAccrual.status === 'calculated' && onApproveAccrual && (
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => onApproveAccrual(selectedAccrual.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {selectedAccrual.status === 'approved' && onDistribute && (
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => onDistribute(selectedAccrual.id)}
                      >
                        Distribute
                      </Button>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">IRR</p>
                    <p className="text-2xl font-bold text-[var(--app-info)]">
                      {formatPercent(selectedAccrual.irr)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">MOIC</p>
                    <p className="text-2xl font-bold text-[var(--app-primary)]">
                      {selectedAccrual.moic.toFixed(2)}x
                    </p>
                  </div>
                </div>

                {/* Fund Position */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Contributions</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(selectedAccrual.totalContributions)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Distributions</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(selectedAccrual.totalDistributions)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Unrealized</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(selectedAccrual.unrealizedValue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
                    <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Value</p>
                    <p className="text-lg font-bold text-[var(--app-success)]">
                      {formatCurrency(selectedAccrual.totalValue)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Carry Breakdown */}
              <Card padding="md">
                <h4 className="text-sm font-semibold mb-3">Carry Breakdown</h4>

                <div className="space-y-3">
                  {/* LP Preferred Return */}
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">LP Preferred Return</span>
                        {selectedAccrual.lpPreferredReturnPaid && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                            Paid
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-bold">
                        {formatCurrency(selectedAccrual.lpPreferredReturn)}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--app-text-muted)]">
                      100% to LPs until preferred return met
                    </div>
                  </div>

                  {/* Catchup */}
                  <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--app-warning)]">GP Catchup</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--app-warning)]">
                          {formatCurrency(selectedAccrual.catchupAmount)}
                        </div>
                        <div className="text-xs text-[var(--app-text-muted)]">
                          Paid: {formatCurrency(selectedAccrual.catchupPaid)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--app-text-muted)]">
                      {activeTerm?.catchupPercentage}% to GP until catch-up achieved
                    </div>
                  </div>

                  {/* Accrued Carry */}
                  <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--app-success)]">Total Accrued Carry</span>
                      <span className="text-2xl font-bold text-[var(--app-success)]">
                        {formatCurrency(selectedAccrual.accruedCarry)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[var(--app-success)]/20">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Vested</p>
                        <p className="text-sm font-bold text-[var(--app-success)]">
                          {formatCurrency(selectedAccrual.vestedCarry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Unvested</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(selectedAccrual.unvestedCarry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Distributed</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(selectedAccrual.distributedCarry)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Carry */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-primary-bg)]">
                    <span className="text-sm font-medium text-[var(--app-primary)]">
                      Remaining Carry (Vested & Undistributed)
                    </span>
                    <span className="text-xl font-bold text-[var(--app-primary)]">
                      {formatCurrency(selectedAccrual.remainingCarry)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Waterfall Detail */}
              <Card padding="md">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => patchUI({ expandedWaterfall: !expandedWaterfall })}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Distribution Waterfall</h4>
                    <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                      {selectedAccrual.waterfall.length} Tiers
                    </Badge>
                  </div>
                  {expandedWaterfall ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>

                {expandedWaterfall && (
                  <div className="space-y-2 mt-3">
                    {selectedAccrual.waterfall.map(tier => (
                      <div
                        key={tier.tier}
                        className={`p-3 rounded-lg border ${
                          tier.isActive
                            ? 'bg-[var(--app-primary-bg)] border-[var(--app-primary)]'
                            : 'bg-[var(--app-surface-hover)] border-[var(--app-border)]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold">Tier {tier.tier}: {tier.name}</span>
                              {tier.isActive && (
                                <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[var(--app-text-muted)] mb-2">{tier.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-[var(--app-text-muted)]">
                                LP: {formatPercent(tier.lpAllocation * 100)}
                              </span>
                              <span className="text-[var(--app-text-muted)]">
                                GP: {formatPercent(tier.gpAllocation * 100)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-[var(--app-text-muted)] mb-1">Total in Tier</div>
                            <div className="text-sm font-bold">
                              {formatCurrency(tier.lpAmount + tier.gpAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--app-border)]">
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)]">LP Amount</p>
                            <p className="text-sm font-medium">{formatCurrency(tier.lpAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)]">GP Amount</p>
                            <p className="text-sm font-medium text-[var(--app-success)]">
                              {formatCurrency(tier.gpAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Notes */}
              {selectedAccrual.notes && (
                <Card padding="md">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-[var(--app-text-muted)]">{selectedAccrual.notes}</p>
                </Card>
              )}
            </div>
          ) : (
            <Card padding="md">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[var(--app-text-muted)] opacity-50" />
                <p className="text-[var(--app-text-muted)]">Select a carry accrual to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
