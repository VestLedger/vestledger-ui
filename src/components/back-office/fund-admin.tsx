'use client'

import { useUIKey } from '@/store/ui'
import { Card, Button, Badge, Progress, Select } from '@/ui'
import { DollarSign, Send, Download, Users, FileText, Mail, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { FundSelector } from '../fund-selector'
import { getRouteConfig } from '@/config/routes'
import { CarriedInterestTracker } from '../fund-admin/carried-interest-tracker'
import { ExpenseTracker } from '../fund-admin/expense-tracker'
import { NAVCalculator } from '../fund-admin/nav-calculator'
import { TransferSecondary } from '../fund-admin/transfer-secondary'
import { fundAdminRequested, fundAdminSelectors } from '@/store/slices/backOfficeSlice'
import { ErrorState, LoadingState } from '@/components/ui/async-states'
import { formatCurrency } from '@/utils/formatting'
import { StatusBadge, MetricsGrid, PageScaffold } from '@/components/ui'
import type { MetricsGridItem } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'

export function FundAdmin() {
  const { data, isLoading, error, refetch } = useAsyncData(fundAdminRequested, fundAdminSelectors.selectState);

  const { value: ui, patch: patchUI } = useUIKey('back-office-fund-admin', { selectedTab: 'capital-calls' });
  const { selectedTab } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/fund-admin');

  const capitalCalls = data?.capitalCalls || [];
  const distributions = data?.distributions || [];
  const lpResponses = data?.lpResponses || [];

  if (isLoading) return <LoadingState message="Loading fund administration…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load fund administration"
        onRetry={refetch}
      />
    );
  }

  // Calculate AI insights
  const activeCallsCount = capitalCalls.filter(c => c.status === 'in-progress').length;
  const totalOutstanding = capitalCalls
    .filter(c => c.status === 'in-progress')
    .reduce((sum, c) => sum + (c.totalAmount - c.amountReceived), 0);
  const pendingLPs = lpResponses.filter(r => r.status === 'pending' || r.status === 'partial').length;

  const summaryCards: MetricsGridItem[] = [
    {
      type: 'stats',
      props: {
        title: 'Active Calls',
        value: capitalCalls.filter(c => c.status === 'in-progress').length,
        icon: ArrowUpRight,
        variant: 'warning',
        subtitle: formatCurrency(
          capitalCalls
            .filter(c => c.status === 'in-progress')
            .reduce((sum, c) => sum + c.totalAmount, 0)
        ),
      },
    },
    {
      type: 'stats',
      props: {
        title: 'YTD Distributions',
        value: distributions.filter(d => d.status === 'completed').length,
        icon: ArrowDownRight,
        variant: 'success',
        subtitle: formatCurrency(
          distributions
            .filter(d => d.status === 'completed')
            .reduce((sum, d) => sum + d.totalAmount, 0)
        ),
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Outstanding',
        value: formatCurrency(
          capitalCalls
            .filter(c => c.status === 'in-progress')
            .reduce((sum, c) => sum + (c.totalAmount - c.amountReceived), 0)
        ),
        icon: DollarSign,
        variant: 'primary',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Total LPs',
        value: Math.max(...capitalCalls.map(c => c.lpCount)),
        icon: Users,
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
        title: 'Fund Administration',
        description: 'Manage capital calls, distributions, and LP communications',
        icon: DollarSign,
        aiSummary: {
          text: `${activeCallsCount} active capital calls with ${formatCurrency(totalOutstanding)} outstanding. ${pendingLPs} LPs require follow-up. AI recommends sending reminders to improve collection rate.`,
          confidence: 0.91,
        },
        primaryAction: {
          label: 'New Capital Call',
          onClick: () => console.log('New capital call'),
          aiSuggested: false,
        },
        secondaryActions: [
          {
            label: 'Export Activity',
            onClick: () => console.log('Export activity'),
          },
        ],
        tabs: [
          {
            id: 'capital-calls',
            label: 'Capital Calls',
            count: activeCallsCount,
            priority: totalOutstanding > 0 ? 'high' : undefined,
          },
          {
            id: 'distributions',
            label: 'Distributions',
          },
          {
            id: 'lp-responses',
            label: 'LP Responses',
            count: pendingLPs,
            priority: pendingLPs > 2 ? 'medium' : undefined,
          },
          {
            id: 'nav-calculator',
            label: 'NAV Calculator',
          },
          {
            id: 'carried-interest',
            label: 'Carried Interest',
          },
          {
            id: 'expenses',
            label: 'Expenses',
          },
          {
            id: 'secondary-transfers',
            label: 'Secondary Transfers',
          },
        ],
        activeTab: selectedTab,
        onTabChange: (tabId) => patchUI({ selectedTab: tabId }),
        children: (
          <div className="w-full sm:w-64">
            <FundSelector />
          </div>
        ),
      }}
    >

      {/* Summary Cards */}
      <MetricsGrid
        items={summaryCards}
        columns={{ base: 1, md: 2, lg: 4 }}
      />

      {/* Tab Content */}
      <div>
        {selectedTab === 'capital-calls' && (
          <div className="space-y-3">
            {capitalCalls.map((call) => {
              const responseRate = (call.lpsResponded / call.lpCount) * 100;
              const collectionRate = (call.amountReceived / call.totalAmount) * 100;

              return (
                <Card key={call.id} padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
                          <ArrowUpRight className="w-6 h-6 text-[var(--app-warning)]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">Capital Call #{call.callNumber}</h3>
                            <StatusBadge status={call.status} domain="fund-admin" showIcon size="sm" />
                          </div>
                          <p className="text-sm text-[var(--app-text-muted)] mb-1">{call.fundName}</p>
                          <p className="text-sm text-[var(--app-text-subtle)]">{call.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.status === 'draft' && (
                          <Button
                            size="sm"
                            className="bg-[var(--app-primary)] text-white"
                            startContent={<Send className="w-4 h-4" />}
                          >
                            Send to LPs
                          </Button>
                        )}
                        {call.status !== 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="bordered"
                              startContent={<Mail className="w-4 h-4" />}
                            >
                              Send Reminder
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<Download className="w-4 h-4" />}
                            >
                              Export
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Amount</p>
                        <p className="text-lg font-bold">{formatCurrency(call.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Received</p>
                        <p className="text-lg font-bold text-[var(--app-success)]">
                          {formatCurrency(call.amountReceived)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Call Date</p>
                        <p className="font-semibold">{new Date(call.callDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Due Date</p>
                        <p className="font-semibold">{new Date(call.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {call.status !== 'draft' && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-[var(--app-text-muted)]">Collection Progress</span>
                            <span className="font-semibold">{collectionRate.toFixed(0)}%</span>
                          </div>
                          <Progress value={collectionRate} maxValue={100} className="h-2" aria-label={`Collection progress ${collectionRate.toFixed(0)}%`} />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--app-text-muted)]" />
                            <span className="text-[var(--app-text-muted)]">LP Responses</span>
                          </div>
                          <span className="font-semibold">
                            {call.lpsResponded} of {call.lpCount} ({responseRate.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {selectedTab === 'distributions' && (
          <div className="space-y-3">
            {distributions.map((dist) => (
              <Card key={dist.id} padding="lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
                      <ArrowDownRight className="w-6 h-6 text-[var(--app-success)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Distribution #{dist.distributionNumber}</h3>
                        <StatusBadge status={dist.status} domain="fund-admin" showIcon size="sm" />
                        <Badge size="sm" className="bg-[var(--app-surface-hover)]">
                          {dist.type.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--app-text-muted)] mb-1">{dist.fundName}</p>
                      <p className="text-sm text-[var(--app-text-subtle)]">Source: {dist.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<FileText className="w-4 h-4" />}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Download className="w-4 h-4" />}
                    >
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-[var(--app-success)]">
                      {formatCurrency(dist.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">LPs</p>
                    <p className="font-semibold">{dist.lpCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Distribution Date</p>
                    <p className="font-semibold">{new Date(dist.distributionDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Per LP Avg</p>
                    <p className="font-semibold">{formatCurrency(dist.totalAmount / dist.lpCount)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'lp-responses' && (
          <div>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Capital Call #8 - LP Responses</h3>
                <Select
                  placeholder="Filter by status"
                  className="w-48"
                  size="sm"
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'partial', label: 'Partial' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                />
              </div>

              <div className="space-y-3">
                {lpResponses.map((response) => {
                  const paymentProgress = (response.amountPaid / response.callAmount) * 100;

                  return (
                    <div key={response.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{response.lpName}</p>
                            <StatusBadge status={response.status} domain="fund-admin" showIcon size="sm" />
                          </div>
                          <p className="text-sm text-[var(--app-text-muted)]">
                            Commitment: {formatCurrency(response.commitment)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {formatCurrency(response.amountPaid)} / {formatCurrency(response.callAmount)}
                          </p>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            Due: {new Date(response.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {response.status !== 'paid' && (
                        <div className="mb-3">
                          <Progress value={paymentProgress} maxValue={100} className="h-2" aria-label={`${response.lpName} payment progress ${paymentProgress.toFixed(0)}%`} />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--app-text-muted)]">
                          Payment Method: {response.paymentMethod}
                        </span>
                        {response.status === 'pending' && (
                          <Button size="sm" variant="flat" startContent={<Mail className="w-4 h-4" />}>
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'nav-calculator' && (
          <div>
            <NAVCalculator
              calculations={[]}
              onCalculate={() => console.log('Calculate NAV')}
              onReview={(calculationId) => console.log('Review calculation:', calculationId)}
              onPublish={(calculationId) => console.log('Publish calculation:', calculationId)}
              onExport={(calculationId, format) => console.log('Export calculation:', calculationId, format)}
            />
          </div>
        )}

        {selectedTab === 'carried-interest' && (
          <div>
            <CarriedInterestTracker
              accruals={[]}
              onCalculateAccrual={(fundId) => console.log('Calculate accrual:', fundId)}
              onEditTerms={(fundId) => console.log('Edit terms:', fundId)}
              onApproveAccrual={(accrualId) => console.log('Approve accrual:', accrualId)}
              onDistribute={(accrualId) => console.log('Distribute:', accrualId)}
              onExport={(accrualId, format) => console.log('Export:', accrualId, format)}
            />
          </div>
        )}

        {selectedTab === 'expenses' && (
          <div>
            <ExpenseTracker
              expenses={[]}
              onAddExpense={() => console.log('Add expense')}
              onApproveExpense={(expenseId) => console.log('Approve expense:', expenseId)}
              onRejectExpense={(expenseId) => console.log('Reject expense:', expenseId)}
              onMarkPaid={(expenseId) => console.log('Mark paid:', expenseId)}
              onExport={(format) => console.log('Export:', format)}
            />
          </div>
        )}

        {selectedTab === 'secondary-transfers' && (
          <div>
            <TransferSecondary
              transfers={[]}
              onInitiateTransfer={() => console.log('Initiate transfer')}
              onReviewTransfer={(transferId) => console.log('Review transfer:', transferId)}
              onApproveTransfer={(transferId) => console.log('Approve transfer:', transferId)}
              onRejectTransfer={(transferId, reason) => console.log('Reject transfer:', transferId, reason)}
              onCompleteTransfer={(transferId) => console.log('Complete transfer:', transferId)}
              onUploadDocument={(transferId) => console.log('Upload document:', transferId)}
              onExerciseROFR={(transferId) => console.log('Exercise ROFR:', transferId)}
            />
          </div>
        )}
      </div>
    </PageScaffold>
  );
}
