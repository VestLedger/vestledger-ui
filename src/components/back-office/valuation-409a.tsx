'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress, Input, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { getRouteConfig } from '@/config/routes';
import { TrendingUp, FileText, Download, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Building2, ChevronRight, Calculator } from 'lucide-react';

interface Valuation409A {
  id: string;
  company: string;
  valuationDate: string;
  expirationDate: string;
  fairMarketValue: number;
  commonStock: number;
  preferredStock: number;
  status: 'current' | 'expiring-soon' | 'expired';
  provider: string;
  reportUrl: string;
  methodology: string;
}

interface StrikePrice {
  id: string;
  grantDate: string;
  strikePrice: number;
  sharesGranted: number;
  recipient: string;
  vestingSchedule: string;
  status: 'active' | 'exercised' | 'expired';
}

interface ValuationHistory {
  id: string;
  date: string;
  fmv: number;
  change: number;
  trigger: string;
}

const mockValuations: Valuation409A[] = [
  {
    id: '1',
    company: 'CloudScale Inc.',
    valuationDate: '2024-09-15',
    expirationDate: '2025-09-15',
    fairMarketValue: 12.50,
    commonStock: 12.50,
    preferredStock: 28.75,
    status: 'current',
    provider: 'Aranca Valuation',
    reportUrl: '#',
    methodology: 'OPM (Option Pricing Model)'
  },
  {
    id: '2',
    company: 'DataFlow Systems',
    valuationDate: '2024-11-01',
    expirationDate: '2025-11-01',
    fairMarketValue: 8.25,
    commonStock: 8.25,
    preferredStock: 18.50,
    status: 'current',
    provider: 'Carta Valuation Services',
    reportUrl: '#',
    methodology: 'PWERM (Probability-Weighted Expected Return)'
  },
  {
    id: '3',
    company: 'FinTech Solutions',
    valuationDate: '2024-03-20',
    expirationDate: '2025-03-20',
    fairMarketValue: 15.75,
    commonStock: 15.75,
    preferredStock: 32.00,
    status: 'expiring-soon',
    provider: 'RSM Valuation',
    reportUrl: '#',
    methodology: 'Hybrid (OPM + Market)'
  }
];

const mockStrikePrices: StrikePrice[] = [
  {
    id: '1',
    grantDate: '2024-10-01',
    strikePrice: 12.50,
    sharesGranted: 50000,
    recipient: 'Sarah Johnson (CTO)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active'
  },
  {
    id: '2',
    grantDate: '2024-10-15',
    strikePrice: 12.50,
    sharesGranted: 25000,
    recipient: 'Michael Chen (VP Engineering)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active'
  },
  {
    id: '3',
    grantDate: '2024-11-05',
    strikePrice: 8.25,
    sharesGranted: 30000,
    recipient: 'Emily Rodriguez (Head of Product)',
    vestingSchedule: '4-year, 1-year cliff',
    status: 'active'
  }
];

const mockHistory: ValuationHistory[] = [
  {
    id: '1',
    date: '2024-11-01',
    fmv: 8.25,
    change: 0,
    trigger: 'Annual refresh'
  },
  {
    id: '2',
    date: '2024-09-15',
    fmv: 12.50,
    change: 25.0,
    trigger: 'Series B funding ($25M)'
  },
  {
    id: '3',
    date: '2024-03-20',
    fmv: 15.75,
    change: 57.5,
    trigger: 'Material event - new revenue milestone'
  },
  {
    id: '4',
    date: '2023-09-10',
    fmv: 10.00,
    change: 42.9,
    trigger: 'Series A funding ($10M)'
  }
];

export function Valuation409A() {
  const [selectedTab, setSelectedTab] = useState<string>('valuations');
  const routeConfig = getRouteConfig('/409a-valuations');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'expiring-soon':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'expired':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-4 h-4" />;
      case 'expiring-soon':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {routeConfig && (
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        )}

        {/* Page Header with Tabs */}
        <PageHeader
          title="409A Valuations"
          description="Manage IRS-compliant fair market value determinations for stock options"
          icon={Calculator}
          aiSummary={{
            text: `${mockValuations.length} portfolio companies tracked. ${mockValuations.filter(v => v.status === 'current').length} current valuations, ${mockValuations.filter(v => v.status === 'expiring-soon').length} expiring soon. ${mockStrikePrices.filter(sp => sp.status === 'active').length} active option grants.`,
            confidence: 0.92
          }}
          primaryAction={{
            label: 'Request New Valuation',
            onClick: () => {
              // Handle new valuation request
            },
          }}
          tabs={[
            {
              id: 'valuations',
              label: 'Valuations',
              count: mockValuations.length,
            },
            {
              id: 'strike-prices',
              label: 'Strike Prices',
              count: mockStrikePrices.length,
            },
            {
              id: 'history',
              label: 'Valuation History',
              count: mockHistory.length,
            },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
              <CheckCircle className="w-6 h-6 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Active Valuations</p>
              <p className="text-2xl font-bold">
                {mockValuations.filter(v => v.status === 'current').length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
              <Clock className="w-6 h-6 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Expiring Soon</p>
              <p className="text-2xl font-bold">
                {mockValuations.filter(v => v.status === 'expiring-soon').length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
              <Building2 className="w-6 h-6 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Portfolio Companies</p>
              <p className="text-2xl font-bold">{mockValuations.length}</p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
              <DollarSign className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Avg. FMV</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  mockValuations.reduce((acc, v) => acc + v.fairMarketValue, 0) / mockValuations.length
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Content */}
        {selectedTab === 'valuations' && (
          <div className="space-y-3">
            {mockValuations.map((valuation) => {
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
                          <Badge size="sm" className={getStatusColor(valuation.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(valuation.status)}
                              <span className="capitalize">{valuation.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
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
                {mockStrikePrices.map((grant) => (
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
                {mockHistory.map((item, index) => (
                  <div key={item.id} className="relative">
                    {index !== mockHistory.length - 1 && (
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
      </div>
    </PageContainer>
  );
}
