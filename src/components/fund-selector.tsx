'use client';

import { Check, ChevronDown, BarChart3, Layers } from 'lucide-react';
import { useFund } from '@/contexts/fund-context';
import { Button, Badge, Card } from '@/ui';
import { useState } from 'react';
import { Fund } from '@/types/fund';

export function FundSelector() {
  const { funds, selectedFund, viewMode, setSelectedFund, setViewMode, getFundSummary } = useFund();
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  };

  const summary = getFundSummary();

  const getFundStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[var(--app-success)] border-[var(--app-success)]';
      case 'closed': return 'text-[var(--app-text-muted)] border-[var(--app-border)]';
      case 'fundraising': return 'text-[var(--app-warning)] border-[var(--app-warning)]';
      default: return 'text-[var(--app-text-muted)] border-[var(--app-border)]';
    }
  };

  const handleFundSelect = (fund: Fund | null) => {
    setSelectedFund(fund);
    setIsOpen(false);
    if (fund) {
      setViewMode('individual');
    }
  };

  const handleConsolidatedView = () => {
    setSelectedFund(null);
    setViewMode('consolidated');
    setIsOpen(false);
  };

  return (
    <div className="relative px-3 py-2">
      {/* Current Selection Button */}
      <Button
        variant="flat"
        className="w-full justify-between bg-[var(--app-surface-hover)] hover:bg-[var(--app-border-subtle)] text-left"
        endContent={<ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        onPress={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {viewMode === 'consolidated' ? (
            <>
              <Layers className="w-4 h-4 text-[var(--app-primary)] flex-shrink-0" />
              <span className="truncate text-sm">All Funds</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 text-[var(--app-primary)] flex-shrink-0" />
              <span className="truncate text-sm">{selectedFund?.displayName || 'Select Fund'}</span>
            </>
          )}
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-80 min-w-[260px] max-w-[calc(100vw-1rem)]">
          <Card padding="sm" className="shadow-lg">
            <div className="space-y-1">
              {/* Consolidated View Option */}
              <button
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'consolidated'
                    ? 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]'
                    : 'hover:bg-[var(--app-surface-hover)]'
                }`}
                onClick={handleConsolidatedView}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">All Funds (Consolidated)</div>
                      <div className="text-xs text-[var(--app-text-muted)]">
                        {summary.totalFunds} funds • {formatCurrency(summary.totalCommitment)} AUM
                      </div>
                    </div>
                  </div>
                  {viewMode === 'consolidated' && <Check className="w-4 h-4" />}
                </div>
              </button>

              <div className="my-2 border-t border-[var(--app-border)]" />

              {/* Individual Funds */}
              {funds.map((fund) => (
                <button
                  key={fund.id}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFund?.id === fund.id && viewMode === 'individual'
                      ? 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]'
                      : 'hover:bg-[var(--app-surface-hover)]'
                  }`}
                  onClick={() => handleFundSelect(fund)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{fund.displayName}</span>
                        <Badge
                          size="sm"
                          variant="bordered"
                          className={`${getFundStatusColor(fund.status)} text-xs flex-shrink-0`}
                        >
                          {fund.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-[var(--app-text-muted)]">
                        {formatCurrency(fund.totalCommitment)} • {fund.portfolioCount} companies
                      </div>
                      <div className="text-xs text-[var(--app-text-subtle)]">
                        IRR: {fund.irr.toFixed(1)}% • TVPI: {fund.tvpi.toFixed(2)}x
                      </div>
                    </div>
                    {selectedFund?.id === fund.id && viewMode === 'individual' && (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
