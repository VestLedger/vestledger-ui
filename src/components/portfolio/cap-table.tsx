'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress, Input, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { Users, PieChart, TrendingUp, DollarSign, Plus, Edit3, Download, Share2, AlertCircle, Building2, Calendar, Percent, History, Calculator } from 'lucide-react';
import { getRouteConfig } from '@/config/routes';
import { FundSelector } from '../fund-selector';

interface Shareholder {
  id: string;
  name: string;
  type: 'founder' | 'employee' | 'investor' | 'advisor' | 'other';
  shares: number;
  shareClass: string;
  ownership: number;
  fullyDiluted: number;
  vestingSchedule?: {
    total: number;
    vested: number;
    cliff: string;
    vestingPeriod: string;
  };
  investmentAmount?: number;
  pricePerShare?: number;
  dateAcquired: string;
}

interface ShareClass {
  id: string;
  name: string;
  type: 'common' | 'preferred' | 'options';
  authorized: number;
  issued: number;
  available: number;
  pricePerShare: number;
  liquidationPreference?: number;
  participationRights?: 'participating' | 'non-participating';
  votingRights: number;
}

interface FundingRound {
  id: string;
  name: string;
  date: string;
  amount: number;
  preMoneyValuation: number;
  postMoneyValuation: number;
  pricePerShare: number;
  investors: { name: string; amount: number; shares: number }[];
}

const mockShareClasses: ShareClass[] = [
  {
    id: '1',
    name: 'Common Stock',
    type: 'common',
    authorized: 10000000,
    issued: 7500000,
    available: 2500000,
    pricePerShare: 1.00,
    votingRights: 1
  },
  {
    id: '2',
    name: 'Series A Preferred',
    type: 'preferred',
    authorized: 5000000,
    issued: 4000000,
    available: 1000000,
    pricePerShare: 5.00,
    liquidationPreference: 1,
    participationRights: 'non-participating',
    votingRights: 1
  },
  {
    id: '3',
    name: 'Employee Stock Options',
    type: 'options',
    authorized: 2000000,
    issued: 1200000,
    available: 800000,
    pricePerShare: 1.00,
    votingRights: 0
  }
];

const mockShareholders: Shareholder[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    type: 'founder',
    shares: 3000000,
    shareClass: 'Common Stock',
    ownership: 25.5,
    fullyDiluted: 23.1,
    vestingSchedule: {
      total: 3000000,
      vested: 2250000,
      cliff: '12 months',
      vestingPeriod: '4 years'
    },
    dateAcquired: '2021-01-01'
  },
  {
    id: '2',
    name: 'David Kim',
    type: 'founder',
    shares: 3000000,
    shareClass: 'Common Stock',
    ownership: 25.5,
    fullyDiluted: 23.1,
    vestingSchedule: {
      total: 3000000,
      vested: 2250000,
      cliff: '12 months',
      vestingPeriod: '4 years'
    },
    dateAcquired: '2021-01-01'
  },
  {
    id: '3',
    name: 'Acme Ventures',
    type: 'investor',
    shares: 4000000,
    shareClass: 'Series A Preferred',
    ownership: 34.0,
    fullyDiluted: 30.8,
    investmentAmount: 20000000,
    pricePerShare: 5.00,
    dateAcquired: '2023-06-15'
  },
  {
    id: '4',
    name: 'Tech Growth Fund',
    type: 'investor',
    shares: 1000000,
    shareClass: 'Series A Preferred',
    ownership: 8.5,
    fullyDiluted: 7.7,
    investmentAmount: 5000000,
    pricePerShare: 5.00,
    dateAcquired: '2023-06-15'
  },
  {
    id: '5',
    name: 'Employee Pool',
    type: 'employee',
    shares: 800000,
    shareClass: 'Common Stock',
    ownership: 6.5,
    fullyDiluted: 6.2,
    dateAcquired: '2021-01-01'
  }
];

const mockRounds: FundingRound[] = [
  {
    id: '1',
    name: 'Seed',
    date: '2021-01-15',
    amount: 2000000,
    preMoneyValuation: 8000000,
    postMoneyValuation: 10000000,
    pricePerShare: 1.25,
    investors: [
      { name: 'Angel Investor Group', amount: 1500000, shares: 1200000 },
      { name: 'Startup Accelerator', amount: 500000, shares: 400000 }
    ]
  },
  {
    id: '2',
    name: 'Series A',
    date: '2023-06-15',
    amount: 25000000,
    preMoneyValuation: 75000000,
    postMoneyValuation: 100000000,
    pricePerShare: 5.00,
    investors: [
      { name: 'Acme Ventures', amount: 20000000, shares: 4000000 },
      { name: 'Tech Growth Fund', amount: 5000000, shares: 1000000 }
    ]
  }
];

export function CapTable() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [showAddShareholder, setShowAddShareholder] = useState(false);

  const routeConfig = getRouteConfig('/cap-table');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShares = (shares: number) => {
    return new Intl.NumberFormat('en-US').format(shares);
  };

  const getShareholderTypeColor = (type: string) => {
    switch (type) {
      case 'founder': return 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]';
      case 'investor': return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'employee': return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'advisor': return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  const totalShares = mockShareholders.reduce((sum, sh) => sum + sh.shares, 0);
  const totalInvestment = mockShareholders.reduce((sum, sh) => sum + (sh.investmentAmount || 0), 0);

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

        {/* Page Header */}
        <PageHeader
          title={routeConfig?.label || 'Cap Table'}
          description={routeConfig?.description}
          icon={routeConfig?.icon}
          aiSummary={{
            text: `${mockShareholders.length} shareholders holding ${formatShares(totalShares)} total shares. ${mockShareClasses.length} share classes with ${formatCurrency(totalInvestment)} total invested across ${mockRounds.length} funding rounds.`,
            confidence: 0.93
          }}
          tabs={[
            { id: 'overview', label: 'Ownership' },
            { id: 'classes', label: 'Share Classes' },
            { id: 'vesting', label: 'Vesting' },
            { id: 'history', label: 'Funding History' },
            { id: 'modeling', label: 'Scenarios' },
          ]}
          activeTab={selectedTab}
          onTabChange={(tabId) => setSelectedTab(tabId)}
          secondaryActions={[
            {
              label: 'Share',
              onClick: () => {
                // Handle share action
              },
            },
            {
              label: 'Export',
              onClick: () => {
                // Handle export action
              },
            },
          ]}
          primaryAction={{
            label: 'Add Shareholder',
            onClick: () => setShowAddShareholder(true),
          }}
        >
          {/* Fund Selector */}
          <div className="mt-4 w-full sm:w-64">
            <FundSelector />
          </div>
        </PageHeader>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--app-primary-bg)]">
                  <Users className="w-5 h-5 text-[var(--app-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockShareholders.length}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">Shareholders</p>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--app-success-bg)]">
                  <TrendingUp className="w-5 h-5 text-[var(--app-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatShares(totalShares)}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">Total Shares</p>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--app-warning-bg)]">
                  <DollarSign className="w-5 h-5 text-[var(--app-warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(100000000)}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">Post-Money Valuation</p>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--app-info-bg)]">
                  <Percent className="w-5 h-5 text-[var(--app-info)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {((mockShareClasses.reduce((sum, sc) => sum + sc.available, 0) /
                       mockShareClasses.reduce((sum, sc) => sum + sc.authorized, 0)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)]">Available Pool</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Ownership Tab Content */}
          {selectedTab === 'overview' && (
          <div className="space-y-4">
            {/* Ownership Breakdown */}
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Ownership Distribution</h3>

              <div className="space-y-3">
                {mockShareholders.map((shareholder) => (
                  <div key={shareholder.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] flex items-center justify-center text-white font-semibold text-sm">
                          {shareholder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{shareholder.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge size="sm" className={getShareholderTypeColor(shareholder.type)}>
                              {shareholder.type}
                            </Badge>
                            <span className="text-xs text-[var(--app-text-muted)]">
                              {shareholder.shareClass}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{shareholder.ownership.toFixed(2)}%</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          {formatShares(shareholder.shares)} shares
                        </p>
                      </div>
                    </div>
                    <Progress value={shareholder.ownership} maxValue={100} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Shareholder Details Table */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Detailed Breakdown</h3>
                <Button size="sm" variant="flat" startContent={<Download className="w-3 h-3" />}>
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--app-border)]">
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Name</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Type</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Shares</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Ownership</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Fully Diluted</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Investment</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-[var(--app-text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockShareholders.map((shareholder) => (
                      <tr key={shareholder.id} className="border-b border-[var(--app-border)] hover:bg-[var(--app-surface-hover)]">
                        <td className="py-3 px-2">
                          <p className="font-medium">{shareholder.name}</p>
                          <p className="text-xs text-[var(--app-text-muted)]">{shareholder.shareClass}</p>
                        </td>
                        <td className="py-3 px-2">
                          <Badge size="sm" className={getShareholderTypeColor(shareholder.type)}>
                            {shareholder.type}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-2 font-medium">
                          {formatShares(shareholder.shares)}
                        </td>
                        <td className="text-right py-3 px-2 font-semibold">
                          {shareholder.ownership.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-2 text-[var(--app-text-muted)]">
                          {shareholder.fullyDiluted.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-2">
                          {shareholder.investmentAmount ? formatCurrency(shareholder.investmentAmount) : '-'}
                        </td>
                        <td className="text-center py-3 px-2">
                          <Button size="sm" variant="flat" isIconOnly>
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          )}

          {/* Share Classes Tab Content */}
          {selectedTab === 'classes' && (
          <div className="space-y-4">
            {mockShareClasses.map((shareClass) => (
              <Card key={shareClass.id} padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{shareClass.name}</h3>
                    <Badge size="sm" variant="flat" className="mt-1 bg-[var(--app-surface-hover)]">
                      {shareClass.type}
                    </Badge>
                  </div>
                  <Button size="sm" variant="flat" startContent={<Edit3 className="w-3 h-3" />}>
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Authorized</p>
                    <p className="text-lg font-semibold">{formatShares(shareClass.authorized)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Issued</p>
                    <p className="text-lg font-semibold text-[var(--app-success)]">
                      {formatShares(shareClass.issued)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Available</p>
                    <p className="text-lg font-semibold text-[var(--app-info)]">
                      {formatShares(shareClass.available)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Price/Share</p>
                    <p className="text-lg font-semibold">${shareClass.pricePerShare.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-[var(--app-text-muted)] mb-2">Utilization</p>
                  <Progress
                    value={(shareClass.issued / shareClass.authorized) * 100}
                    maxValue={100}
                    className="h-2"
                  />
                  <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                    {((shareClass.issued / shareClass.authorized) * 100).toFixed(1)}% utilized
                  </p>
                </div>

                {shareClass.type === 'preferred' && (
                  <div className="pt-4 border-t border-[var(--app-border)]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Liquidation Preference</p>
                        <p className="text-sm font-medium">{shareClass.liquidationPreference}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Participation Rights</p>
                        <p className="text-sm font-medium capitalize">{shareClass.participationRights}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
          )}

          {/* Vesting Tab Content */}
          {selectedTab === 'vesting' && (
          <div className="space-y-4">
            {mockShareholders
              .filter(sh => sh.vestingSchedule)
              .map((shareholder) => (
                <Card key={shareholder.id} padding="lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{shareholder.name}</h3>
                      <p className="text-sm text-[var(--app-text-muted)]">{shareholder.shareClass}</p>
                    </div>
                    <Badge size="sm" className={getShareholderTypeColor(shareholder.type)}>
                      {shareholder.type}
                    </Badge>
                  </div>

                  {shareholder.vestingSchedule && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Shares</p>
                          <p className="text-lg font-semibold">
                            {formatShares(shareholder.vestingSchedule.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--app-text-muted)] mb-1">Vested</p>
                          <p className="text-lg font-semibold text-[var(--app-success)]">
                            {formatShares(shareholder.vestingSchedule.vested)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--app-text-muted)] mb-1">Cliff Period</p>
                          <p className="text-sm font-medium">{shareholder.vestingSchedule.cliff}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--app-text-muted)] mb-1">Vesting Period</p>
                          <p className="text-sm font-medium">{shareholder.vestingSchedule.vestingPeriod}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Vesting Progress</p>
                          <p className="text-sm text-[var(--app-text-muted)]">
                            {((shareholder.vestingSchedule.vested / shareholder.vestingSchedule.total) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Progress
                          value={(shareholder.vestingSchedule.vested / shareholder.vestingSchedule.total) * 100}
                          maxValue={100}
                          className="h-3"
                        />
                      </div>
                    </>
                  )}
                </Card>
              ))}
          </div>
          )}

          {/* Funding History Tab Content */}
          {selectedTab === 'history' && (
          <div className="space-y-4">
            {mockRounds.map((round) => (
              <Card key={round.id} padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{round.name}</h3>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      {new Date(round.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--app-success)]">
                      {formatCurrency(round.amount)}
                    </p>
                    <p className="text-xs text-[var(--app-text-muted)]">Raised</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Pre-Money</p>
                    <p className="text-sm font-semibold">{formatCurrency(round.preMoneyValuation)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Post-Money</p>
                    <p className="text-sm font-semibold">{formatCurrency(round.postMoneyValuation)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Price/Share</p>
                    <p className="text-sm font-semibold">${round.pricePerShare.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--app-border)]">
                  <p className="font-medium mb-3">Investors</p>
                  <div className="space-y-2">
                    {round.investors.map((investor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--app-surface-hover)]">
                        <span className="text-sm font-medium">{investor.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(investor.amount)}</p>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            {formatShares(investor.shares)} shares
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}

          {/* Scenario Modeling Tab Content */}
          {selectedTab === 'modeling' && (
          <div>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[var(--app-info)]" />
                <h3 className="font-semibold">Dilution Scenario Modeling</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">New Round Size</label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    startContent={<DollarSign className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pre-Money Valuation</label>
                  <Input
                    type="number"
                    placeholder="Enter valuation..."
                    startContent={<DollarSign className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                  />
                </div>

                <Button color="primary" className="w-full">
                  Calculate Dilution
                </Button>

                <div className="p-4 rounded-lg bg-[var(--app-info-bg)] border border-[var(--app-info)]/20">
                  <p className="text-sm text-[var(--app-info)] mb-2">
                    Scenario modeling allows you to project ownership changes based on future funding rounds.
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Enter round parameters above to see projected ownership percentages.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
