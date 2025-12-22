'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge } from '@/ui';
import { Calculator, TrendingUp, TrendingDown, Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import { StatusBadge } from '@/components/ui';

export interface NAVCalculation {
  id: string;
  fundId: string;
  fundName: string;
  asOfDate: Date;
  calculationDate: Date;
  status: 'draft' | 'calculated' | 'reviewed' | 'published';
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  outstandingShares: number;
  navPerShare: number;
  previousNAV?: number;
  changeAmount?: number;
  changePercent?: number;
  components: NAVComponent[];
  adjustments: NAVAdjustment[];
  reviewedBy?: string;
  publishedBy?: string;
  notes?: string;
}

export interface NAVComponent {
  id: string;
  category: 'investment' | 'cash' | 'receivable' | 'liability' | 'other';
  description: string;
  value: number;
  valuationMethod: 'cost' | 'fair-value' | 'mark-to-market' | 'discounted-cash-flow';
  lastValuationDate: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface NAVAdjustment {
  id: string;
  type: 'unrealized-gain' | 'unrealized-loss' | 'write-up' | 'write-down' | 'other';
  description: string;
  amount: number;
  justification: string;
  approvedBy?: string;
}

interface NAVCalculatorProps {
  calculations: NAVCalculation[];
  fundId?: string;
  onCalculate?: () => void;
  onReview?: (calculationId: string) => void;
  onPublish?: (calculationId: string) => void;
  onExport?: (calculationId: string, format: 'pdf' | 'excel') => void;
}

export function NAVCalculator({
  calculations,
  fundId,
  onCalculate,
  onReview,
  onPublish,
  onExport,
}: NAVCalculatorProps) {
  const filteredCalculations = calculations.filter((calc) => !fundId || calc.fundId === fundId);

  const { value: ui, patch: patchUI } = useUIKey<{
    selectedCalculationId: string | null;
  }>(`nav-calculator:${fundId ?? 'all'}`, {
    selectedCalculationId: filteredCalculations[0]?.id ?? null,
  });
  const { selectedCalculationId } = ui;

  const selectedCalculation =
    filteredCalculations.find((calc) => calc.id === selectedCalculationId) ??
    filteredCalculations[0] ??
    null;

  const getValuationMethodBadge = (method: NAVComponent['valuationMethod']) => {
    const colors = {
      'cost': 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
      'fair-value': 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
      'mark-to-market': 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
      'discounted-cash-flow': 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
    };

    return (
      <Badge size="sm" variant="flat" className={colors[method]}>
        {method.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calculation List */}
      <div className="lg:col-span-1">
        <Card padding="md">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[var(--app-primary)]" />
                <h3 className="text-lg font-semibold">NAV History</h3>
              </div>
              {onCalculate && (
                <Button
                  size="sm"
                  color="primary"
                  startContent={<RefreshCw className="w-3 h-3" />}
                  onPress={onCalculate}
                >
                  Calculate
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCalculations.map(calc => (
                <button
                  key={calc.id}
                  onClick={() => patchUI({ selectedCalculationId: calc.id })}
                  className={`w-full p-3 rounded-lg text-left transition-colors border ${
                    selectedCalculation?.id === calc.id
                      ? 'bg-[var(--app-primary-bg)] border-[var(--app-primary)]'
                      : 'bg-[var(--app-surface-hover)] border-transparent hover:border-[var(--app-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[var(--app-text-muted)]" />
                      <span className="text-sm font-medium">
                        {calc.asOfDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <StatusBadge status={calc.status} domain="fund-admin" size="sm" showIcon />
                  </div>

                  <div className="text-lg font-bold mb-1">
                    {formatCurrency(calc.navPerShare, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / share
                  </div>

                  {calc.changePercent !== undefined && (
                    <div className={`text-xs flex items-center gap-1 ${
                      calc.changePercent >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
                    }`}>
                      {calc.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercent(Math.abs(calc.changePercent))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Calculation Detail */}
      <div className="lg:col-span-2">
        {selectedCalculation ? (
          <div className="space-y-4">
            {/* Header */}
            <Card padding="md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{selectedCalculation.fundName}</h3>
                    <StatusBadge status={selectedCalculation.status} domain="fund-admin" size="sm" showIcon />
                  </div>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    As of {selectedCalculation.asOfDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-[var(--app-text-subtle)]">
                    Calculated on {selectedCalculation.calculationDate.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onExport && (
                    <>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Download className="w-3 h-3" />}
                        onPress={() => onExport(selectedCalculation.id, 'pdf')}
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Download className="w-3 h-3" />}
                        onPress={() => onExport(selectedCalculation.id, 'excel')}
                      >
                        Excel
                      </Button>
                    </>
                  )}
                  {selectedCalculation.status === 'calculated' && onReview && (
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => onReview(selectedCalculation.id)}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                  {selectedCalculation.status === 'reviewed' && onPublish && (
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => onPublish(selectedCalculation.id)}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </div>

              {/* NAV Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--app-success-bg)]">
                  <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">NAV per Share</p>
                  <p className="text-2xl font-bold text-[var(--app-success)]">
                    {formatCurrency(selectedCalculation.navPerShare, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {selectedCalculation.changePercent !== undefined && (
                    <div className={`text-sm mt-1 ${
                      selectedCalculation.changePercent >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
                    }`}>
                      {formatPercent(selectedCalculation.changePercent)} from previous
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-primary-bg)]">
                  <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Net Assets</p>
                  <p className="text-2xl font-bold text-[var(--app-primary)]">
                    {formatCurrency(selectedCalculation.netAssets, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                    {selectedCalculation.outstandingShares.toLocaleString()} shares
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-info-bg)]">
                  <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Assets</p>
                  <p className="text-2xl font-bold text-[var(--app-info)]">
                    {formatCurrency(selectedCalculation.totalAssets, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                    Liabilities: {formatCurrency(selectedCalculation.totalLiabilities, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            {/* NAV Components */}
            <Card padding="md">
              <h4 className="text-sm font-semibold mb-3">NAV Components</h4>
              <div className="space-y-2">
                {selectedCalculation.components.map(component => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-surface-hover)]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{component.description}</span>
                        {getValuationMethodBadge(component.valuationMethod)}
                        <Badge
                          size="sm"
                          variant="flat"
                          className={
                            component.confidence === 'high'
                              ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                              : component.confidence === 'medium'
                              ? 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                              : 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]'
                          }
                        >
                          {component.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Last valued: {component.lastValuationDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(component.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-[var(--app-text-subtle)] capitalize">
                        {component.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Adjustments */}
            {selectedCalculation.adjustments.length > 0 && (
              <Card padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-[var(--app-warning)]" />
                  <h4 className="text-sm font-semibold">NAV Adjustments</h4>
                </div>
                <div className="space-y-2">
                  {selectedCalculation.adjustments.map(adjustment => (
                    <div
                      key={adjustment.id}
                      className="p-3 rounded-lg bg-[var(--app-warning-bg)] border border-[var(--app-warning)]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{adjustment.description}</span>
                            <Badge size="sm" variant="flat" className="bg-white/50 text-[var(--app-warning)]">
                              {adjustment.type.replace(/-/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-[var(--app-text-muted)]">{adjustment.justification}</p>
                          {adjustment.approvedBy && (
                            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                              Approved by: {adjustment.approvedBy}
                            </p>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          adjustment.amount >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
                        }`}>
                          {formatCurrency(adjustment.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            {selectedCalculation.notes && (
              <Card padding="md">
                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                <p className="text-sm text-[var(--app-text-muted)]">{selectedCalculation.notes}</p>
              </Card>
            )}
          </div>
        ) : (
          <Card padding="md">
            <div className="text-center py-12">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-[var(--app-text-muted)] opacity-50" />
              <p className="text-[var(--app-text-muted)]">Select a NAV calculation to view details</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
