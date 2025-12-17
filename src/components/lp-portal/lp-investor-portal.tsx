'use client'

import { useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { TrendingUp, DollarSign, Download, FileText, Calendar, Activity, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { lpPortalRequested, lpPortalSelectors } from '@/store/slices/miscSlice';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';

export function LPInvestorPortal() {
  const dispatch = useAppDispatch();
  const { value: ui, patch: patchUI } = useUIKey('lp-investor-portal', { selectedTab: 'overview' });
  const { selectedTab } = ui;
  const data = useAppSelector(lpPortalSelectors.selectData);
  const status = useAppSelector(lpPortalSelectors.selectStatus);
  const error = useAppSelector(lpPortalSelectors.selectError);

  // Load LP portal data on mount
  useEffect(() => {
    dispatch(lpPortalRequested());
  }, [dispatch]);

  if (status === 'loading') return <LoadingState message="Loading LP portal…" />;
  if (status === 'failed' && error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load LP portal"
        onRetry={() => dispatch(lpPortalRequested())}
      />
    );
  }
  if (status === 'idle') return <LoadingState message="Loading LP portal…" />;

  const investor = data?.investor;
  if (status === 'succeeded' && !investor) {
    return <EmptyState icon={PieChart} title="No investor data available" message="Try again in a moment." />;
  }

  const reports = data?.reports || [];
  const transactions = data?.transactions || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-accent)] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{investor.fundName}</h1>
          <p className="text-lg opacity-90">{investor.name}</p>
          <p className="text-sm opacity-75 mt-1">Last updated: {new Date(investor.lastUpdate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Total Commitment</p>
            <p className="text-2xl font-bold">{formatCurrency(investor.commitmentAmount)}</p>
            <Progress
              value={(investor.calledCapital / investor.commitmentAmount) * 100}
              maxValue={100}
              className="h-2 mt-3"
              aria-label={`Capital deployment ${((investor.calledCapital / investor.commitmentAmount) * 100).toFixed(0)}%`}
            />
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {((investor.calledCapital / investor.commitmentAmount) * 100).toFixed(0)}% deployed
            </p>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Net Asset Value</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">{formatCurrency(investor.navValue)}</p>
            <div className="flex items-center gap-1 mt-3 text-[var(--app-success)]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {((investor.navValue / investor.calledCapital - 1) * 100).toFixed(1)}%
              </span>
            </div>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Distributions</p>
            <p className="text-2xl font-bold text-[var(--app-info)]">{formatCurrency(investor.distributedCapital)}</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-3">
              DPI: {investor.dpi.toFixed(2)}x
            </p>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">IRR</p>
            <p className="text-2xl font-bold text-[var(--app-primary)]">{formatPercent(investor.irr)}</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-3">
              TVPI: {investor.tvpi.toFixed(2)}x
            </p>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">Performance Overview</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Total Value to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-success)]">{investor.tvpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(investor.navValue + investor.distributedCapital)} total value
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Distributions to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-info)]">{investor.dpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">Realized returns</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Residual Value to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-primary)]">{investor.rvpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">Unrealized value</p>
            </div>
          </div>
        </Card>

        <Tabs selectedKey={selectedTab} onSelectionChange={(key) => patchUI({ selectedTab: key as string })}>
          {/* Reports Tab */}
          <Tab
            key="reports"
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </div>
            }
          >
            <div className="mt-4 space-y-3">
              {reports.map((report) => (
                <Card key={report.id} padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
                        <FileText className="w-5 h-5 text-[var(--app-primary)]" />
                      </div>
                      <div>
                        <p className="font-semibold">{report.quarter} {report.year} Quarterly Report</p>
                        <p className="text-sm text-[var(--app-text-muted)]">
                          Published: {new Date(report.publishedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="flat"
                      startContent={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>

          {/* Transactions Tab */}
          <Tab
            key="transactions"
            title={
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Transactions</span>
              </div>
            }
          >
            <div className="mt-4 space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${
                        transaction.type === 'distribution'
                          ? 'bg-[var(--app-success-bg)]'
                          : 'bg-[var(--app-warning-bg)]'
                      }`}>
                        {transaction.type === 'distribution' ? (
                          <ArrowDownRight className="w-5 h-5 text-[var(--app-success)]" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-[var(--app-warning)]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {transaction.type === 'distribution' ? 'Distribution' : 'Capital Call'}
                          </p>
                          <Badge
                            size="sm"
                            className={
                              transaction.status === 'completed'
                                ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                                : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--app-text-muted)] mb-1">{transaction.description}</p>
                        <p className="text-xs text-[var(--app-text-subtle)]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xl font-bold ${
                      transaction.type === 'distribution'
                        ? 'text-[var(--app-success)]'
                        : 'text-[var(--app-text)]'
                    }`}>
                      {transaction.type === 'distribution' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>

          {/* Portfolio Tab */}
          <Tab
            key="portfolio"
            title={
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                <span>Portfolio</span>
              </div>
            }
          >
            <div className="mt-4">
              <Card padding="lg">
                <h3 className="font-semibold mb-4">Portfolio Composition</h3>
                <p className="text-sm text-[var(--app-text-muted)] mb-6">
                  Detailed portfolio company information is available in the quarterly reports.
                  Contact your fund manager for specific portfolio insights.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Early Stage (Seed/Series A)</span>
                      <span className="text-sm text-[var(--app-text-muted)]">45%</span>
                    </div>
                    <Progress value={45} maxValue={100} className="h-2" aria-label="Early Stage portfolio 45%" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Growth Stage (Series B+)</span>
                      <span className="text-sm text-[var(--app-text-muted)]">35%</span>
                    </div>
                    <Progress value={35} maxValue={100} className="h-2" aria-label="Growth Stage portfolio 35%" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Realized/Exits</span>
                      <span className="text-sm text-[var(--app-text-muted)]">20%</span>
                    </div>
                    <Progress value={20} maxValue={100} className="h-2" aria-label="Realized Exits portfolio 20%" />
                  </div>
                </div>
              </Card>
            </div>
          </Tab>

          {/* Account Tab */}
          <Tab
            key="account"
            title={
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Account</span>
              </div>
            }
          >
            <div className="mt-4">
              <Card padding="lg">
                <h3 className="font-semibold mb-4">Investment Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Investor</p>
                    <p className="font-medium">{investor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Fund</p>
                    <p className="font-medium">{investor.fundName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Investment Date</p>
                    <p className="font-medium">{new Date(investor.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Commitment</p>
                    <p className="font-medium">{formatCurrency(investor.commitmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Called to Date</p>
                    <p className="font-medium">{formatCurrency(investor.calledCapital)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Remaining Commitment</p>
                    <p className="font-medium">
                      {formatCurrency(investor.commitmentAmount - investor.calledCapital)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="mt-4 bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--app-info)] mb-1">Need Help?</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      Contact your fund administrator for questions about your investment,
                      tax documents, or upcoming capital calls.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
