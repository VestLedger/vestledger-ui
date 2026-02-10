'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authSelectors } from '@/store/slices/authSlice';
import { fundUISelectors } from '@/store/slices/fundSlice';
import { useFund } from '@/contexts/fund-context';
import { Card, Button, Progress, Select, Modal, Input } from '@/ui';
import {
  DollarSign,
  Send,
  Download,
  Users,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from 'lucide-react';
import { FundSelector } from '../fund-selector';
import { getRouteConfig, ROUTE_PATHS } from '@/config/routes';
import { CarriedInterestTracker } from '../fund-admin/carried-interest-tracker';
import { ExpenseTracker } from '../fund-admin/expense-tracker';
import { NAVCalculator } from '../fund-admin/nav-calculator';
import { TransferSecondary } from '../fund-admin/transfer-secondary';
import { DistributionsList } from '../fund-admin/distributions/distributions-list';
import { FundSetupList } from '../fund-admin/fund-setup-list';
import {
  capitalCallCreateRequested,
  capitalCallReminderRequested,
  capitalCallSendRequested,
  fundAdminExportRequested,
  fundAdminRequested,
  fundAdminSelectors,
  lpReminderRequested,
  lpResponseUpdateRequested,
} from '@/store/slices/backOfficeSlice';
import { distributionsRequested, distributionsSelectors } from '@/store/slices/distributionSlice';
import {
  navCalculateRequested,
  navExportRequested,
  navOpsSelectors,
  navPublishRequested,
  navRequested,
  navReviewRequested,
} from '@/store/slices/navOpsSlice';
import {
  carryApproveRequested,
  carryCalculateRequested,
  carryDistributeRequested,
  carryExportRequested,
  carryOpsSelectors,
  carryRequested,
} from '@/store/slices/carryOpsSlice';
import {
  expenseAddRequested,
  expenseApproveRequested,
  expenseExportRequested,
  expenseMarkPaidRequested,
  expenseOpsSelectors,
  expenseRejectRequested,
  expensesRequested,
} from '@/store/slices/expenseOpsSlice';
import {
  secondaryTransferApproveRequested,
  secondaryTransferCompleteRequested,
  secondaryTransferExerciseROFRRequested,
  secondaryTransferInitiateRequested,
  secondaryTransferOpsSelectors,
  secondaryTransferRejectRequested,
  secondaryTransferReviewRequested,
  secondaryTransferUploadDocumentRequested,
  secondaryTransfersRequested,
} from '@/store/slices/secondaryTransferOpsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { formatCurrency } from '@/utils/formatting';
import { KeyValueRow, StatusBadge, MetricsGrid, PageScaffold, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { useAsyncData } from '@/hooks/useAsyncData';
import type { CreateCapitalCallParams } from '@/services/backOffice/fundAdminService';

type FundAdminUIState = {
  selectedTab: string;
  lpStatusFilter: 'all' | 'paid' | 'partial' | 'pending' | 'overdue';
};

const LP_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const FUND_ADMIN_TAB_IDS = new Set([
  'fund-setup',
  'capital-calls',
  'distributions',
  'lp-responses',
  'nav-calculator',
  'carried-interest',
  'expenses',
  'secondary-transfers',
]);

export function FundAdmin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedFund, viewMode } = useFund();

  const user = useAppSelector(authSelectors.selectUser);
  const visibleFunds = useAppSelector(fundUISelectors.selectVisibleFunds);

  const canMutate = user?.role === 'ops' || user?.role === 'gp';
  const targetFundId = viewMode === 'individual' ? selectedFund?.id : undefined;

  const { data, isLoading, error, refetch } = useAsyncData(
    fundAdminRequested,
    fundAdminSelectors.selectState,
    {
      params: { fundId: targetFundId },
      dependencies: [targetFundId, viewMode],
    }
  );

  const {
    data: distributionsData,
  } = useAsyncData(distributionsRequested, distributionsSelectors.selectState, {
    params: { fundId: targetFundId },
    dependencies: [targetFundId, viewMode],
  });

  const { value: ui, patch: patchUI } = useUIKey<FundAdminUIState>('back-office-fund-admin', {
    selectedTab: 'fund-setup',
    lpStatusFilter: 'all',
  });
  const { selectedTab, lpStatusFilter } = ui;

  useEffect(() => {
    if (!FUND_ADMIN_TAB_IDS.has(selectedTab)) {
      patchUI({ selectedTab: 'fund-setup' });
    }
  }, [selectedTab, patchUI]);

  const { data: navData } = useAsyncData(navRequested, navOpsSelectors.selectState, {
    params: { fundId: targetFundId },
    dependencies: [targetFundId],
    fetchOnMount: selectedTab === 'nav-calculator',
  });

  const { data: carryData } = useAsyncData(carryRequested, carryOpsSelectors.selectState, {
    params: { fundId: targetFundId },
    dependencies: [targetFundId],
    fetchOnMount: selectedTab === 'carried-interest',
  });

  const { data: expenseData } = useAsyncData(expensesRequested, expenseOpsSelectors.selectState, {
    params: { fundId: targetFundId },
    dependencies: [targetFundId],
    fetchOnMount: selectedTab === 'expenses',
  });

  const { data: transferData } = useAsyncData(
    secondaryTransfersRequested,
    secondaryTransferOpsSelectors.selectState,
    {
      params: { fundId: targetFundId },
      dependencies: [targetFundId],
      fetchOnMount: selectedTab === 'secondary-transfers',
    }
  );

  const [fundSetupCreateSignal, setFundSetupCreateSignal] = useState(0);
  const [isCreateCallOpen, setCreateCallOpen] = useState(false);
  const [newCall, setNewCall] = useState<Pick<CreateCapitalCallParams, 'fundId' | 'fundName' | 'purpose' | 'totalAmount' | 'dueDate'>>({
    fundId: selectedFund?.id ?? visibleFunds[0]?.id ?? '',
    fundName: selectedFund?.name ?? visibleFunds[0]?.name ?? '',
    purpose: '',
    totalAmount: 1_000_000,
    dueDate: new Date().toISOString().split('T')[0] || '',
  });

  const routeConfig = getRouteConfig(ROUTE_PATHS.fundAdmin);

  const capitalCalls = useMemo(() => data?.capitalCalls ?? [], [data?.capitalCalls]);
  const lpResponses = useMemo(() => data?.lpResponses ?? [], [data?.lpResponses]);
  const distributions = distributionsData?.distributions ?? [];

  const filteredLPResponses = useMemo(() => {
    if (lpStatusFilter === 'all') {
      return lpResponses;
    }
    return lpResponses.filter((response) => response.status === lpStatusFilter);
  }, [lpResponses, lpStatusFilter]);

  const activeCalls = capitalCalls.filter((call) => call.status === 'in-progress' || call.status === 'sent');
  const activeCallsCount = activeCalls.length;
  const totalOutstanding = activeCalls.reduce(
    (sum, call) => sum + Math.max(call.totalAmount - call.amountReceived, 0),
    0
  );
  const pendingLPs = lpResponses.filter((response) => response.status === 'pending' || response.status === 'partial').length;

  const completedDistributions = distributions.filter((distribution) => distribution.status === 'completed');

  const totalLPs = capitalCalls.length > 0
    ? Math.max(0, ...capitalCalls.map((call) => call.lpCount))
    : 0;

  const summaryCards: MetricsGridItem[] = [
    {
      type: 'stats',
      props: {
        title: 'Active Calls',
        value: activeCallsCount,
        icon: ArrowUpRight,
        variant: 'warning',
        subtitle: formatCurrency(activeCalls.reduce((sum, call) => sum + call.totalAmount, 0)),
      },
    },
    {
      type: 'stats',
      props: {
        title: 'YTD Distributions',
        value: completedDistributions.length,
        icon: ArrowDownRight,
        variant: 'success',
        subtitle: formatCurrency(completedDistributions.reduce((sum, dist) => sum + dist.totalDistributed, 0)),
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Outstanding',
        value: formatCurrency(totalOutstanding),
        icon: DollarSign,
        variant: 'primary',
      },
    },
    {
      type: 'stats',
      props: {
        title: 'Total LPs',
        value: totalLPs,
        icon: Users,
        variant: 'primary',
      },
    },
  ];

  const resolveActionFund = () => {
    if (selectedFund) return selectedFund;
    return visibleFunds[0] ?? null;
  };

  const openCreateCall = () => {
    const fund = resolveActionFund();
    setNewCall({
      fundId: fund?.id ?? '',
      fundName: fund?.name ?? '',
      purpose: '',
      totalAmount: 1_000_000,
      dueDate: new Date().toISOString().split('T')[0] || '',
    });
    setCreateCallOpen(true);
  };

  const submitCreateCall = () => {
    const fund = visibleFunds.find((item) => item.id === newCall.fundId);
    if (!fund || !canMutate) {
      return;
    }

    dispatch(capitalCallCreateRequested({
      fundId: fund.id,
      fundName: fund.name,
      purpose: newCall.purpose,
      totalAmount: newCall.totalAmount,
      dueDate: newCall.dueDate,
    }));
    setCreateCallOpen(false);
  };

  const triggerExpenseCreate = () => {
    const fund = resolveActionFund();
    if (!fund || !canMutate) return;

    dispatch(expenseAddRequested({
      expense: {
        fundId: fund.id,
        fundName: fund.name,
        type: 'other',
        category: 'General',
        description: 'New operating expense',
        amount: 1_000,
        date: new Date(),
        payee: 'Vendor',
        status: 'pending',
        isRecurring: false,
        allocatedToLPs: false,
      },
    }));
  };

  const triggerTransferCreate = () => {
    const fund = resolveActionFund();
    if (!fund || !canMutate) return;

    dispatch(secondaryTransferInitiateRequested({
      transfer: {
        fundId: fund.id,
        fundName: fund.name,
        type: 'direct',
        transferorId: 'lp-source',
        transferorName: 'Transferor LP',
        transferorEmail: 'transferor@example.com',
        transfereeId: 'lp-target',
        transfereeName: 'Transferee LP',
        transfereeEmail: 'transferee@example.com',
        commitmentAmount: 1_000_000,
        fundedAmount: 500_000,
        unfundedCommitment: 500_000,
        includesManagementRights: true,
        includesInformationRights: true,
        includesVotingRights: true,
        subjectToROFR: false,
        requiresGPConsent: true,
        requiresLPVote: false,
        accreditationVerified: false,
        kycCompleted: false,
        amlCleared: false,
        taxFormsReceived: false,
      },
    }));
  };

  let primaryAction:
    | {
        label: string;
        onClick: () => void;
        aiSuggested?: boolean;
      }
    | undefined;

  if (canMutate) {
    if (selectedTab === 'fund-setup') {
      primaryAction = {
        label: 'New Fund',
        onClick: () => setFundSetupCreateSignal((value) => value + 1),
        aiSuggested: false,
      };
    } else if (selectedTab === 'capital-calls') {
      primaryAction = {
        label: 'New Capital Call',
        onClick: openCreateCall,
        aiSuggested: false,
      };
    } else if (selectedTab === 'distributions') {
      primaryAction = {
        label: 'New Distribution',
        onClick: () => router.push(ROUTE_PATHS.fundAdminDistributionsNew),
        aiSuggested: false,
      };
    } else if (selectedTab === 'nav-calculator') {
      primaryAction = {
        label: 'Recalculate NAV',
        onClick: () => {
          const fund = resolveActionFund();
          if (!fund) return;
          dispatch(navCalculateRequested({ fundId: fund.id, fundName: fund.name }));
        },
        aiSuggested: false,
      };
    } else if (selectedTab === 'carried-interest') {
      primaryAction = {
        label: 'Recalculate Carry',
        onClick: () => {
          const fund = resolveActionFund();
          if (!fund) return;
          dispatch(carryCalculateRequested({ fundId: fund.id, fundName: fund.name }));
        },
        aiSuggested: false,
      };
    } else if (selectedTab === 'expenses') {
      primaryAction = {
        label: 'Add Expense',
        onClick: triggerExpenseCreate,
        aiSuggested: false,
      };
    } else if (selectedTab === 'secondary-transfers') {
      primaryAction = {
        label: 'Initiate Transfer',
        onClick: triggerTransferCreate,
        aiSuggested: false,
      };
    }
  }

  return (
    <>
      <AsyncStateRenderer
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingMessage="Loading fund administration…"
        errorTitle="Failed to load fund administration"
        isEmpty={() => false}
      >
        {() => (
          <PageScaffold
            breadcrumbs={routeConfig?.breadcrumbs}
            aiSuggestion={routeConfig?.aiSuggestion}
            containerProps={{ className: 'space-y-4' }}
            header={{
              title: 'Fund Administration',
              description: 'Operate fund setup, capital workflows, and back-office operations in one cockpit.',
              icon: Building2,
              aiSummary: {
                text: `${activeCallsCount} active capital calls with ${formatCurrency(totalOutstanding)} outstanding. ${pendingLPs} LPs require follow-up across active workflows.`,
                confidence: 0.91,
              },
              primaryAction,
              secondaryActions: [
                {
                  label: 'Export Activity',
                  onClick: () => dispatch(fundAdminExportRequested()),
                },
              ],
              tabs: [
                {
                  id: 'fund-setup',
                  label: 'Fund Setup',
                },
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
            <MetricsGrid
              items={summaryCards}
              columns={{ base: 1, md: 2, lg: 4 }}
            />

            <div>
              {selectedTab === 'fund-setup' && (
                <FundSetupList canMutate={canMutate} createSignal={fundSetupCreateSignal} />
              )}

              {selectedTab === 'capital-calls' && (
                <div className="space-y-3">
                  {capitalCalls.map((call) => {
                    const responseRate = call.lpCount > 0 ? (call.lpsResponded / call.lpCount) * 100 : 0;
                    const collectionRate = call.totalAmount > 0 ? (call.amountReceived / call.totalAmount) * 100 : 0;

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
                            {canMutate && (
                              <div className="flex items-center gap-2">
                                {call.status === 'draft' && (
                                  <Button
                                    size="sm"
                                    className="bg-[var(--app-primary)] text-white"
                                    startContent={<Send className="w-4 h-4" />}
                                    onPress={() => dispatch(capitalCallSendRequested({ capitalCallId: call.id }))}
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
                                      onPress={() => dispatch(capitalCallReminderRequested({ capitalCallId: call.id }))}
                                    >
                                      Send Reminder
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      startContent={<Download className="w-4 h-4" />}
                                      onPress={() => dispatch(fundAdminExportRequested())}
                                    >
                                      Export
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                <KeyValueRow
                                  label="Collection Progress"
                                  value={`${collectionRate.toFixed(0)}%`}
                                  className="mb-2"
                                  paddingYClassName=""
                                  valueClassName="font-semibold"
                                />
                                <Progress
                                  value={collectionRate}
                                  maxValue={100}
                                  className="h-2"
                                  aria-label={`Collection progress ${collectionRate.toFixed(0)}%`}
                                />
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
                <DistributionsList />
              )}

              {selectedTab === 'lp-responses' && (
                <Card padding="lg">
                  <SectionHeader
                    title="LP Responses"
                    titleClassName="font-semibold"
                    className="mb-4"
                    action={(
                      <Select
                        placeholder="Filter by status"
                        className="w-48"
                        size="sm"
                        selectedKeys={[lpStatusFilter]}
                        onChange={(event) =>
                          patchUI({
                            lpStatusFilter: event.target.value as FundAdminUIState['lpStatusFilter'],
                          })
                        }
                        options={LP_STATUS_OPTIONS}
                      />
                    )}
                  />

                  <div className="space-y-3">
                    {filteredLPResponses.map((response) => {
                      const paymentProgress = response.callAmount > 0
                        ? (response.amountPaid / response.callAmount) * 100
                        : 0;

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
                              <Progress
                                value={paymentProgress}
                                maxValue={100}
                                className="h-2"
                                aria-label={`${response.lpName} payment progress ${paymentProgress.toFixed(0)}%`}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--app-text-muted)]">
                              Payment Method: {response.paymentMethod}
                            </span>
                            {canMutate && (
                              <div className="flex items-center gap-2">
                                {response.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    startContent={<Mail className="w-4 h-4" />}
                                    onPress={() => dispatch(lpReminderRequested({ lpResponseId: response.id }))}
                                  >
                                    Send Reminder
                                  </Button>
                                )}
                                {response.status !== 'paid' && (
                                  <Button
                                    size="sm"
                                    variant="bordered"
                                    onPress={() =>
                                      dispatch(
                                        lpResponseUpdateRequested({
                                          lpResponseId: response.id,
                                          amountPaid: response.callAmount,
                                        })
                                      )
                                    }
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {selectedTab === 'nav-calculator' && (
                <NAVCalculator
                  calculations={navData?.calculations ?? []}
                  onCalculate={canMutate ? (() => {
                    const fund = resolveActionFund();
                    if (!fund) return;
                    dispatch(navCalculateRequested({ fundId: fund.id, fundName: fund.name }));
                  }) : undefined}
                  onReview={canMutate ? ((calculationId) =>
                    dispatch(
                      navReviewRequested({
                        calculationId,
                        reviewedBy: user?.email ?? 'ops@vestledger.ai',
                      })
                    )) : undefined}
                  onPublish={canMutate ? ((calculationId) =>
                    dispatch(
                      navPublishRequested({
                        calculationId,
                        publishedBy: user?.email ?? 'ops@vestledger.ai',
                      })
                    )) : undefined}
                  onExport={(calculationId, format) =>
                    dispatch(navExportRequested({ calculationId, format }))
                  }
                />
              )}

              {selectedTab === 'carried-interest' && (
                <CarriedInterestTracker
                  terms={carryData?.terms ?? []}
                  accruals={carryData?.accruals ?? []}
                  onCalculateAccrual={canMutate ? ((fundId) => {
                    const fund = visibleFunds.find((item) => item.id === fundId);
                    dispatch(carryCalculateRequested({ fundId, fundName: fund?.name ?? 'Fund' }));
                  }) : undefined}
                  onEditTerms={canMutate ? (() => setFundSetupCreateSignal((value) => value + 1)) : undefined}
                  onApproveAccrual={canMutate ? ((accrualId) =>
                    dispatch(carryApproveRequested({ accrualId }))
                  ) : undefined}
                  onDistribute={canMutate ? ((accrualId) =>
                    dispatch(carryDistributeRequested({ accrualId }))
                  ) : undefined}
                  onExport={(accrualId, format) =>
                    dispatch(carryExportRequested({ accrualId, format }))
                  }
                />
              )}

              {selectedTab === 'expenses' && (
                <ExpenseTracker
                  expenses={expenseData?.expenses ?? []}
                  onAddExpense={canMutate ? triggerExpenseCreate : undefined}
                  onApproveExpense={canMutate ? ((expenseId) =>
                    dispatch(expenseApproveRequested({ expenseId, approver: user?.email ?? 'ops@vestledger.ai' }))
                  ) : undefined}
                  onRejectExpense={canMutate ? ((expenseId) =>
                    dispatch(expenseRejectRequested({ expenseId }))
                  ) : undefined}
                  onMarkPaid={canMutate ? ((expenseId) =>
                    dispatch(expenseMarkPaidRequested({ expenseId }))
                  ) : undefined}
                  onExport={(format) => dispatch(expenseExportRequested({ format, fundId: targetFundId }))}
                />
              )}

              {selectedTab === 'secondary-transfers' && (
                <TransferSecondary
                  transfers={transferData?.transfers ?? []}
                  rofrExercises={transferData?.rofrExercises ?? []}
                  onInitiateTransfer={canMutate ? triggerTransferCreate : undefined}
                  onReviewTransfer={canMutate ? ((transferId) =>
                    dispatch(secondaryTransferReviewRequested({ transferId }))
                  ) : undefined}
                  onApproveTransfer={canMutate ? ((transferId) =>
                    dispatch(secondaryTransferApproveRequested({ transferId }))
                  ) : undefined}
                  onRejectTransfer={canMutate ? ((transferId, reason) =>
                    dispatch(secondaryTransferRejectRequested({ transferId, reason }))
                  ) : undefined}
                  onCompleteTransfer={canMutate ? ((transferId) =>
                    dispatch(secondaryTransferCompleteRequested({ transferId }))
                  ) : undefined}
                  onUploadDocument={canMutate ? ((transferId) =>
                    dispatch(
                      secondaryTransferUploadDocumentRequested({
                        transferId,
                        docName: `Supporting Document ${new Date().toISOString()}`,
                      })
                    )
                  ) : undefined}
                  onExerciseROFR={canMutate ? ((transferId) =>
                    dispatch(
                      secondaryTransferExerciseROFRRequested({
                        transferId,
                        exercisedByName: user?.name ?? 'Existing LP',
                      })
                    )
                  ) : undefined}
                />
              )}
            </div>
          </PageScaffold>
        )}
      </AsyncStateRenderer>

      <Modal
        title="Create Capital Call"
        isOpen={isCreateCallOpen}
        onOpenChange={(open) => {
          if (!open) setCreateCallOpen(false);
        }}
        size="lg"
        footer={(
          <>
            <Button variant="bordered" onPress={() => setCreateCallOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={submitCreateCall}>
              Create Capital Call
            </Button>
          </>
        )}
      >
        <div className="space-y-3">
          <Select
            label="Fund"
            selectedKeys={[newCall.fundId]}
            onChange={(event) => {
              const fund = visibleFunds.find((item) => item.id === event.target.value);
              setNewCall((current) => ({
                ...current,
                fundId: event.target.value,
                fundName: fund?.name ?? current.fundName,
              }));
            }}
            options={visibleFunds.map((fund) => ({ value: fund.id, label: fund.name }))}
          />
          <Input
            label="Purpose"
            value={newCall.purpose}
            onChange={(event) =>
              setNewCall((current) => ({
                ...current,
                purpose: event.target.value,
              }))
            }
          />
          <Input
            label="Total Amount"
            type="number"
            value={String(newCall.totalAmount)}
            onChange={(event) =>
              setNewCall((current) => ({
                ...current,
                totalAmount: Number(event.target.value) || 0,
              }))
            }
          />
          <Input
            label="Due Date"
            type="date"
            value={newCall.dueDate}
            onChange={(event) =>
              setNewCall((current) => ({
                ...current,
                dueDate: event.target.value,
              }))
            }
          />
        </div>
      </Modal>
    </>
  );
}
