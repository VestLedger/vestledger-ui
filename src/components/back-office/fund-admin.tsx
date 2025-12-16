'use client'

import { useUIKey } from '@/store/ui'
import { Card, Button, Badge, Progress, Input, Select, Breadcrumb, PageHeader, PageContainer } from '@/ui'
import { DollarSign, Send, Download, Clock, CheckCircle, AlertTriangle, Users, FileText, Mail, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { FundSelector } from '../fund-selector'
import { getRouteConfig } from '@/config/routes'
import { CarriedInterestTracker } from '../fund-admin/carried-interest-tracker'
import { ExpenseTracker } from '../fund-admin/expense-tracker'
import { NAVCalculator } from '../fund-admin/nav-calculator'
import { TransferSecondary } from '../fund-admin/transfer-secondary'
import { getCapitalCalls, getDistributions, getLPResponses } from '@/services/backOffice/fundAdminService'

export function FundAdmin() {
  const { value: ui, patch: patchUI } = useUIKey('back-office-fund-admin', { selectedTab: 'capital-calls' });
  const { selectedTab } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/fund-admin');

  const capitalCalls = getCapitalCalls();
  const distributions = getDistributions();
  const lpResponses = getLPResponses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'in-progress':
      case 'processing':
      case 'partial':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'draft':
      case 'pending':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
      case 'processing':
      case 'partial':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Calculate AI insights
  const activeCallsCount = capitalCalls.filter(c => c.status === 'in-progress').length;
  const totalOutstanding = capitalCalls
    .filter(c => c.status === 'in-progress')
    .reduce((sum, c) => sum + (c.totalAmount - c.amountReceived), 0);
  const pendingLPs = lpResponses.filter(r => r.status === 'pending' || r.status === 'partial').length;

  return (
    <PageContainer>
      <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {routeConfig && (
        <div>
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        </div>
      )}

      {/* Page Header with AI Summary */}
      <PageHeader
        title="Fund Administration"
        description="Manage capital calls, distributions, and LP communications"
        icon={DollarSign}
        aiSummary={{
          text: `${activeCallsCount} active capital calls with ${formatCurrency(totalOutstanding)} outstanding. ${pendingLPs} LPs require follow-up. AI recommends sending reminders to improve collection rate.`,
          confidence: 0.91
        }}
        primaryAction={{
          label: 'New Capital Call',
          onClick: () => console.log('New capital call'),
          aiSuggested: false
        }}
        secondaryActions={[
          {
            label: 'Export Activity',
            onClick: () => console.log('Export activity')
          }
        ]}
        tabs={[
          {
            id: 'capital-calls',
            label: 'Capital Calls',
            count: activeCallsCount,
            priority: totalOutstanding > 0 ? 'high' : undefined
          },
          {
            id: 'distributions',
            label: 'Distributions'
          },
          {
            id: 'lp-responses',
            label: 'LP Responses',
            count: pendingLPs,
            priority: pendingLPs > 2 ? 'medium' : undefined
          },
          {
            id: 'nav-calculator',
            label: 'NAV Calculator'
          },
          {
            id: 'carried-interest',
            label: 'Carried Interest'
          },
          {
            id: 'expenses',
            label: 'Expenses'
          },
          {
            id: 'secondary-transfers',
            label: 'Secondary Transfers'
          }
        ]}
        activeTab={selectedTab}
        onTabChange={(tabId) => patchUI({ selectedTab: tabId })}
      >
        {/* Fund Selector as child content */}
        <div className="w-full sm:w-64">
          <FundSelector />
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
              <ArrowUpRight className="w-6 h-6 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Active Calls</p>
              <p className="text-2xl font-bold">
                {capitalCalls.filter(c => c.status === 'in-progress').length}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(
                  capitalCalls
                    .filter(c => c.status === 'in-progress')
                    .reduce((sum, c) => sum + c.totalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
              <ArrowDownRight className="w-6 h-6 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">YTD Distributions</p>
              <p className="text-2xl font-bold">
                {distributions.filter(d => d.status === 'completed').length}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(
                  distributions
                    .filter(d => d.status === 'completed')
                    .reduce((sum, d) => sum + d.totalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
              <DollarSign className="w-6 h-6 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Outstanding</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  capitalCalls
                    .filter(c => c.status === 'in-progress')
                    .reduce((sum, c) => sum + (c.totalAmount - c.amountReceived), 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
              <Users className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Total LPs</p>
              <p className="text-2xl font-bold">
                {Math.max(...capitalCalls.map(c => c.lpCount))}
              </p>
            </div>
          </div>
        </Card>
      </div>

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
                            <Badge size="sm" className={getStatusColor(call.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(call.status)}
                                <span className="capitalize">{call.status.replace('-', ' ')}</span>
                              </div>
                            </Badge>
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
                          <Progress value={collectionRate} maxValue={100} className="h-2" />
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
                        <Badge size="sm" className={getStatusColor(dist.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(dist.status)}
                            <span className="capitalize">{dist.status}</span>
                          </div>
                        </Badge>
                        <Badge size="sm" className="bg-[var(--app-surface-hover)]">
                          {dist.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                            <Badge size="sm" className={getStatusColor(response.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(response.status)}
                                <span className="capitalize">{response.status}</span>
                              </div>
                            </Badge>
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
                          <Progress value={paymentProgress} maxValue={100} className="h-2" />
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
      </div>
    </PageContainer>
  );
}
