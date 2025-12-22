'use client'

import { Card, Button, Badge } from '@/ui';
import { getRouteConfig } from '@/config/routes';
import { Download, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Building2, ChevronRight, Calculator } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { valuation409aRequested, valuation409aSelectors } from '@/store/slices/backOfficeSlice';
import { ErrorState, LoadingState } from '@/components/ui/async-states';
import { formatCurrency } from '@/utils/formatting';
import { MetricsGrid, PageScaffold, StatusBadge } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';

export function Valuation409A() {
  const { data, isLoading, error, refetch } = useAsyncData(valuation409aRequested, valuation409aSelectors.selectState);
  const { value: ui, patch: patchUI } = useUIKey('back-office-valuation-409a', { selectedTab: 'valuations' });
  const { selectedTab } = ui;
  const routeConfig = getRouteConfig('/409a-valuations');

  if (isLoading) return <LoadingState message="Loading 409A valuations…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load 409A valuations"
        onRetry={refetch}
      />
    );
  }

  const valuations = data?.valuations || [];
  const strikePrices = data?.strikePrices || [];
  const history = data?.history || [];

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const summaryCards: MetricsGridItem[] = [
    {
      type: 'stats',
      props: {
        title: 'Active Valuations',
        value: valuations.filter(v => v.status === 'current').length,
        icon: CheckCircle,
        variant: 'success',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Expiring Soon',
        value: valuations.filter(v => v.status === 'expiring-soon').length,
        icon: Clock,
        variant: 'warning',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Portfolio Companies',
        value: valuations.length,
        icon: Building2,
        variant: 'primary',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Avg. FMV',
        value: formatCurrency(
          valuations.reduce((acc, v) => acc + v.fairMarketValue, 0) / valuations.length
        ),
        icon: DollarSign,
        variant: 'primary',
      },
    },
  ];

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      containerProps={{ className: 'space-y-6' }}
      header={{
        title: '409A Valuations',
        description: 'Manage IRS-compliant fair market value determinations for stock options',
        icon: Calculator,
        aiSummary: {
          text: `${valuations.length} portfolio companies tracked. ${valuations.filter(v => v.status === 'current').length} current valuations, ${valuations.filter(v => v.status === 'expiring-soon').length} expiring soon. ${strikePrices.filter(sp => sp.status === 'active').length} active option grants.`,
          confidence: 0.92,
        },
        primaryAction: {
          label: 'Request New Valuation',
          onClick: () => {
            // Handle new valuation request
          },
        },
        tabs: [
          {
            id: 'valuations',
            label: 'Valuations',
            count: valuations.length,
          },
          {
            id: 'strike-prices',
            label: 'Strike Prices',
            count: strikePrices.length,
          },
          {
            id: 'history',
            label: 'Valuation History',
            count: history.length,
          },
        ],
        activeTab: selectedTab,
        onTabChange: (tabId) => patchUI({ selectedTab: tabId }),
      }}
    >

      {/* Summary Cards */}
      <MetricsGrid
        items={summaryCards}
        columns={{ base: 1, md: 2, lg: 4 }}
      />

      {/* Tab Content */}
      {selectedTab === 'valuations' && (
          <div className="space-y-3">
            {valuations.map((valuation) => {
              const daysUntilExpiry = getDaysUntilExpiration(valuation.expirationDate);
              return (
                <Card key={valuation.id} padding="lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                        <Building2 className="w-6 h-6 text-[var(--app-primary)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{valuation.company}</h3>
                          <StatusBadge status={valuation.status} domain="general" size="sm" showIcon />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)] mb-1">Fair Market Value</p>
                            <p className="text-lg font-bold text-[var(--app-primary)]">
                              {formatCurrency(valuation.fairMarketValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)] mb-1">Common Stock</p>
                            <p className="font-semibold">{formatCurrency(valuation.commonStock)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)] mb-1">Preferred Stock</p>
                            <p className="font-semibold">{formatCurrency(valuation.preferredStock)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--app-text-muted)] mb-1">Days Until Expiry</p>
                            <p className={`font-semibold ${daysUntilExpiry < 90 ? 'text-[var(--app-warning)]' : 'text-[var(--app-success)]'}`}>
                              {daysUntilExpiry} days
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-[var(--app-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Issued: {new Date(valuation.valuationDate).toLocaleDateString()}</span>
                          </div>
                          <span>•</span>
                          <span>Provider: {valuation.provider}</span>
                          <span>•</span>
                          <span>Method: {valuation.methodology}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="flat"
                        size="sm"
                        startContent={<Download className="w-4 h-4" />}
                      >
                        Download Report
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        isIconOnly
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Strike Prices Tab */}
        {selectedTab === 'strike-prices' && (
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Recent Option Grants</h3>
              <div className="space-y-3">
                {strikePrices.map((grant) => (
                  <div key={grant.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{grant.recipient}</p>
                          <Badge size="sm" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                            {grant.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--app-text-muted)]">Grant Date</p>
                            <p className="font-medium">{new Date(grant.grantDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Strike Price</p>
                            <p className="font-medium text-[var(--app-primary)]">{formatCurrency(grant.strikePrice)}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Shares</p>
                            <p className="font-medium">{grant.sharesGranted.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Vesting</p>
                            <p className="font-medium">{grant.vestingSchedule}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Fair Market Value Timeline</h3>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.id} className="relative">
                    {index !== history.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-[var(--app-border)]" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-[var(--app-primary-bg)] border-2 border-[var(--app-primary)]">
                        <DollarSign className="w-4 h-4 text-[var(--app-primary)]" />
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{formatCurrency(item.fmv)} per share</p>
                            <p className="text-sm text-[var(--app-text-muted)]">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          {item.change !== 0 && (
                            <Badge className={item.change > 0 ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]' : 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]'}>
                              {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--app-text-subtle)]">{item.trigger}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Info Card */}
      <Card padding="md" className="bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--app-info)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--app-info)] mb-1">409A Valuation Requirements</p>
            <p className="text-xs text-[var(--app-text-muted)]">
              409A valuations are typically required annually or within 12 months of a material event
              (funding round, M&A, significant revenue changes). Valuations expire after 12 months and
              must be refreshed to maintain compliance with IRS safe harbor provisions.
            </p>
          </div>
        </div>
      </Card>
    </PageScaffold>
  );
}
