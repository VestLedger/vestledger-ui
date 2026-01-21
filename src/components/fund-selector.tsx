'use client';

import { Check, ChevronDown, BarChart3, Layers } from 'lucide-react';
import { useFund } from '@/contexts/fund-context';
import { Button, Badge, Card } from '@/ui';
import { Fund } from '@/types/fund';
import { useUIKey } from '@/store/ui';
import { formatCurrencyCompact } from '@/utils/formatting';

export function FundSelector() {
  const { funds, selectedFund, viewMode, setSelectedFund, setViewMode, getFundSummary } = useFund();
  const { value: ui, patch: patchUI } = useUIKey('fund-selector', { isOpen: false });
  const { isOpen } = ui;

  const summary = getFundSummary();

  const getFundStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-app-success dark:text-app-dark-success border-app-success dark:border-app-dark-success';
      case 'closed': return 'text-app-text-muted dark:text-app-dark-text-muted border-app-border dark:border-app-dark-border';
      case 'fundraising': return 'text-app-warning dark:text-app-dark-warning border-app-warning dark:border-app-dark-warning';
      default: return 'text-app-text-muted dark:text-app-dark-text-muted border-app-border dark:border-app-dark-border';
    }
  };

  const handleFundSelect = (fund: Fund | null) => {
    setSelectedFund(fund);
    patchUI({ isOpen: false });
    if (fund) {
      setViewMode('individual');
    }
  };

  const handleConsolidatedView = () => {
    setSelectedFund(null);
    setViewMode('consolidated');
    patchUI({ isOpen: false });
  };

  return (
    <div className="relative px-3 py-2">
      {/* Current Selection Button */}
      <Button
        variant="flat"
        className="w-full justify-between bg-app-surface-hover dark:bg-app-dark-surface-hover hover:bg-app-border-subtle dark:hover:bg-app-dark-border-subtle text-left"
        endContent={<ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        onPress={() => patchUI({ isOpen: !isOpen })}
        aria-label="Select fund"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {viewMode === 'consolidated' ? (
            <>
              <Layers className="w-4 h-4 text-app-primary dark:text-app-dark-primary flex-shrink-0" />
              <span className="truncate text-sm">All Funds</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 text-app-primary dark:text-app-dark-primary flex-shrink-0" />
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
                    ? 'bg-app-primary-bg dark:bg-app-dark-primary-bg text-app-primary dark:text-app-dark-primary'
                    : 'hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
                }`}
                onClick={handleConsolidatedView}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">All Funds (Consolidated)</div>
                      <div className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                        {summary.totalFunds} funds • {formatCurrencyCompact(summary.totalCommitment)} AUM
                      </div>
                    </div>
                  </div>
                  {viewMode === 'consolidated' && <Check className="w-4 h-4" />}
                </div>
              </button>

              <div className="my-2 border-t border-app-border dark:border-app-dark-border" />

              {/* Individual Funds */}
              {funds.map((fund) => (
                <button
                  key={fund.id}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFund?.id === fund.id && viewMode === 'individual'
                      ? 'bg-app-primary-bg dark:bg-app-dark-primary-bg text-app-primary dark:text-app-dark-primary'
                      : 'hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
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
                      <div className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                        {formatCurrencyCompact(fund.totalCommitment)} • {fund.portfolioCount} companies
                      </div>
                      <div className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
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
          onClick={() => patchUI({ isOpen: false })}
        />
      )}
    </div>
  );
}
