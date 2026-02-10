'use client'

import { Card, Button, Badge, Progress } from '@/ui';
import { Tabs, Tab } from '@/ui';
import {
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Users,
} from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { lpPortalRequested, lpPortalSelectors } from '@/store/slices/miscSlice';
import { AsyncStateRenderer, EmptyState } from '@/ui/async-states';
import { PageScaffold, SectionHeader } from '@/ui/composites';
import { formatCurrency, formatDate, formatPercent } from '@/utils/formatting';
import { useAsyncData } from '@/hooks/useAsyncData';
import { DistributionUpcoming } from './distribution-upcoming';
import { DistributionStatements } from './distribution-statements';
import { DistributionConfirmation } from './distribution-confirmation';
import { DistributionElections } from './distribution-elections';
import { DistributionPreferences } from './distribution-preferences';
import { BankDetailsForm } from './bank-details-form';
import { DistributionEmailPreview } from './distribution-email-preview';
import { DistributionFAQ } from './distribution-faq';
import { ROUTE_PATHS } from '@/config/routes';

export function LPInvestorPortal() {
  const { data, isLoading, error, refetch } = useAsyncData(lpPortalRequested, lpPortalSelectors.selectState);
  const { value: ui, patch: patchUI } = useUIKey('lp-investor-portal', { selectedTab: 'distributions' });
  const { selectedTab } = ui;

  const investor = data?.investor;

  const reports = data?.reports || [];
  const transactions = data?.transactions || [];
  const distributionStatements = data?.distributionStatements || [];
  const upcomingDistributions = data?.upcomingDistributions || [];
  const distributionConfirmations = data?.distributionConfirmations || [];
  const distributionElections = data?.distributionElections || [];
  const bankDetails = data?.bankDetails;
  const notificationPreferences = data?.notificationPreferences;
  const emailPreview = data?.emailPreview;
  const faqItems = data?.faqItems || [];

  return (
    <AsyncStateRenderer
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      loadingMessage="Loading LP portal…"
      errorTitle="Failed to load LP portal"
      isEmpty={() => false}
    >
      {() => {
        if (!investor) {
          return <EmptyState icon={PieChart} title="No investor data available" message="Try again in a moment." />;
        }

        const deploymentPercent = investor.commitmentAmount > 0
          ? (investor.calledCapital / investor.commitmentAmount) * 100
          : 0;
        const navChangePercent = investor.calledCapital > 0
          ? (investor.navValue / investor.calledCapital - 1) * 100
          : 0;

        const aiSummaryText = `${investor.name} committed ${formatCurrency(investor.commitmentAmount)} with ${formatCurrency(investor.calledCapital)} called. DPI ${investor.dpi.toFixed(2)}x and TVPI ${investor.tvpi.toFixed(2)}x.`;
        const headerBadges = [
          {
            label: `Last updated ${formatDate(investor.lastUpdate)}`,
            size: "sm" as const,
            variant: "flat" as const,
            className: "bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]",
          },
        ];

        return (
          <PageScaffold
            routePath={ROUTE_PATHS.lpPortal}
            containerProps={{ className: "space-y-4" }}
            header={{
              title: investor.fundName,
              description: investor.name,
              icon: Users,
              badges: headerBadges,
              aiSummary: {
                text: aiSummaryText,
                confidence: 0.84,
              },
            }}
          >
      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Total Commitment</p>
            <p className="text-2xl font-bold">{formatCurrency(investor.commitmentAmount)}</p>
            <Progress
              value={deploymentPercent}
              maxValue={100}
              className="h-2 mt-3"
              aria-label={`Capital deployment ${formatPercent(deploymentPercent, 0)}`}
            />
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {formatPercent(deploymentPercent, 0)} deployed
            </p>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Net Asset Value</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">{formatCurrency(investor.navValue)}</p>
            <div className="flex items-center gap-1 mt-3 text-[var(--app-success)]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {formatPercent(navChangePercent, 1)}
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
          <SectionHeader title="Performance Overview" className="mb-4" />
          <div className="grid grid-cols-3 gap-4">
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
                          Published: {formatDate(report.publishedDate)}
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
                          {formatDate(transaction.date)}
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

          {/* Distributions Tab */}
          <Tab
            key="distributions"
            title={
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>Distributions</span>
              </div>
            }
          >
            <div className="mt-4 space-y-4">
              <DistributionUpcoming distributions={upcomingDistributions} />
              <DistributionStatements statements={distributionStatements} />
              <DistributionElections elections={distributionElections} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <DistributionConfirmation confirmations={distributionConfirmations} />
                {notificationPreferences && (
                  <DistributionPreferences preferences={notificationPreferences} />
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {bankDetails && <BankDetailsForm details={bankDetails} />}
                {emailPreview && <DistributionEmailPreview preview={emailPreview} />}
              </div>
              <DistributionFAQ items={faqItems} />
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
                <SectionHeader
                  title="Portfolio Composition"
                  description="Detailed portfolio company information is available in the quarterly reports. Contact your fund manager for specific portfolio insights."
                  className="mb-4"
                />

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
                <SectionHeader title="Investment Details" className="mb-4" />
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="font-medium">{formatDate(investor.joinDate)}</p>
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
          </PageScaffold>
        );
      }}
    </AsyncStateRenderer>
  );
}
