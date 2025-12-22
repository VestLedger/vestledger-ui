'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge } from '@/ui';
import { DollarSign, Plus, PieChart, Download } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { SearchToolbar, StatusBadge } from '@/components/ui';

export type ExpenseType =
  | 'management-fee'
  | 'monitoring-fee'
  | 'transaction-fee'
  | 'legal'
  | 'audit'
  | 'administrative'
  | 'marketing'
  | 'other';

export interface FundExpense {
  id: string;
  fundId: string;
  fundName: string;
  type: ExpenseType;
  category: string;
  description: string;
  amount: number;
  date: Date;
  payee: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: string;
  paidDate?: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annually';
  allocatedToLPs: boolean;
  invoiceNumber?: string;
  tags?: string[];
}

interface ExpenseTrackerProps {
  expenses: FundExpense[];
  fundId?: string;
  onAddExpense?: () => void;
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string) => void;
  onMarkPaid?: (expenseId: string) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function ExpenseTracker({
  expenses,
  fundId,
  onAddExpense,
  onApproveExpense,
  onRejectExpense,
  onMarkPaid,
  onExport,
}: ExpenseTrackerProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    filterType: ExpenseType | 'all';
    filterStatus: string;
    dateRange: 'month' | 'quarter' | 'year';
  }>(`expense-tracker:${fundId ?? 'all'}`, {
    searchQuery: '',
    filterType: 'all',
    filterStatus: 'all',
    dateRange: 'month',
  });
  const { searchQuery, filterType, filterStatus, dateRange } = ui;

  const getExpenseTypeConfig = (type: ExpenseType) => {
    switch (type) {
      case 'management-fee':
        return { label: 'Management Fee', color: 'text-[var(--app-primary)]', bgColor: 'bg-[var(--app-primary-bg)]' };
      case 'monitoring-fee':
        return { label: 'Monitoring Fee', color: 'text-[var(--app-info)]', bgColor: 'bg-[var(--app-info-bg)]' };
      case 'transaction-fee':
        return { label: 'Transaction Fee', color: 'text-[var(--app-success)]', bgColor: 'bg-[var(--app-success-bg)]' };
      case 'legal':
        return { label: 'Legal', color: 'text-[var(--app-warning)]', bgColor: 'bg-[var(--app-warning-bg)]' };
      case 'audit':
        return { label: 'Audit', color: 'text-[var(--app-danger)]', bgColor: 'bg-[var(--app-danger-bg)]' };
      case 'administrative':
        return { label: 'Administrative', color: 'text-[var(--app-text-muted)]', bgColor: 'bg-[var(--app-surface-hover)]' };
      case 'marketing':
        return { label: 'Marketing', color: 'text-[var(--app-secondary)]', bgColor: 'bg-[var(--app-secondary)]/10' };
      case 'other':
        return { label: 'Other', color: 'text-[var(--app-text-subtle)]', bgColor: 'bg-[var(--app-surface-hover)]' };
    }
  };

  const filterByDateRange = (expense: FundExpense) => {
    const now = new Date();
    const expenseDate = new Date(expense.date);

    switch (dateRange) {
      case 'month':
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
        return currentQuarter === expenseQuarter && expenseDate.getFullYear() === now.getFullYear();
      case 'year':
        return expenseDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.fundName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || expense.type === filterType;
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
      const matchesDateRange = filterByDateRange(expense);
      const matchesFund = !fundId || expense.fundId === fundId;

      return matchesSearch && matchesType && matchesStatus && matchesDateRange && matchesFund;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate totals
  const totals = filteredExpenses.reduce(
    (acc, expense) => {
      acc.total += expense.amount;
      acc.byStatus[expense.status] = (acc.byStatus[expense.status] || 0) + expense.amount;
      acc.byType[expense.type] = (acc.byType[expense.type] || 0) + expense.amount;
      return acc;
    },
    { total: 0, byStatus: {} as Record<string, number>, byType: {} as Record<string, number> }
  );

  const expenseTypes: ExpenseType[] = [
    'management-fee',
    'monitoring-fee',
    'transaction-fee',
    'legal',
    'audit',
    'administrative',
    'marketing',
    'other',
  ];

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[var(--app-primary)]" />
            <div>
              <h3 className="text-lg font-semibold">Fund Expense Tracking</h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                {filteredExpenses.length} expenses • {formatCurrency(totals.total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Download className="w-3 h-3" />}
                onPress={() => onExport('csv')}
              >
                Export
              </Button>
            )}
            {onAddExpense && (
              <Button
                size="sm"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onAddExpense}
              >
                Add Expense
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Expenses</p>
            <p className="text-lg font-bold">{formatCurrency(totals.total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {filteredExpenses.length} transactions
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Pending</p>
            <p className="text-lg font-bold text-[var(--app-warning)]">
              {formatCurrency(totals.byStatus['pending'] || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {filteredExpenses.filter(e => e.status === 'pending').length} items
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Approved</p>
            <p className="text-lg font-bold text-[var(--app-info)]">
              {formatCurrency(totals.byStatus['approved'] || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {filteredExpenses.filter(e => e.status === 'approved').length} items
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Paid</p>
            <p className="text-lg font-bold text-[var(--app-success)]">
              {formatCurrency(totals.byStatus['paid'] || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {filteredExpenses.filter(e => e.status === 'paid').length} items
            </p>
          </div>
        </div>

        {/* Expense Breakdown by Type */}
        <Card padding="sm" className="bg-[var(--app-surface-hover)]">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-[var(--app-primary)]" />
            <h4 className="text-sm font-semibold">Expense Breakdown</h4>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {expenseTypes.map(type => {
              const config = getExpenseTypeConfig(type);
              const amount = totals.byType[type] || 0;
              const percentage = totals.total > 0 ? (amount / totals.total) * 100 : 0;

              return (
                <div key={type} className={`p-2 rounded-lg ${config.bgColor}`}>
                  <p className="text-xs text-[var(--app-text-muted)]">{config.label}</p>
                  <p className={`text-sm font-bold ${config.color}`}>{formatCurrency(amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  {percentage > 0 && (
                    <p className="text-xs text-[var(--app-text-subtle)]">{percentage.toFixed(1)}%</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Filters */}
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search expenses..."
          rightActions={(
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={filterType}
                onChange={(e) => patchUI({ filterType: e.target.value as ExpenseType | 'all' })}
              >
                <option value="all">All Types</option>
                {expenseTypes.map(type => (
                  <option key={type} value={type}>
                    {getExpenseTypeConfig(type).label}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={filterStatus}
                onChange={(e) => patchUI({ filterStatus: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={dateRange}
                onChange={(e) => patchUI({ dateRange: e.target.value as typeof dateRange })}
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          )}
        />

        {/* Expense List */}
        <div className="border border-[var(--app-border)] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--app-surface-hover)] border-b border-[var(--app-border)] p-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[var(--app-text-muted)]">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>

          {/* Rows */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No expenses found</p>
              </div>
            ) : (
              filteredExpenses.map(expense => {
                const typeConfig = getExpenseTypeConfig(expense.type);

                return (
                  <div
                    key={expense.id}
                    className="grid grid-cols-12 gap-2 p-3 border-b border-[var(--app-border)] last:border-0 hover:bg-[var(--app-surface-hover)] transition-colors text-sm"
                  >
                    <div className="col-span-2">
                      <div className="text-[var(--app-text-muted)]">
                        {expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {expense.isRecurring && (
                        <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)] mt-1">
                          Recurring
                        </Badge>
                      )}
                    </div>

                    <div className="col-span-3">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-xs text-[var(--app-text-muted)]">{expense.payee}</div>
                      {expense.invoiceNumber && (
                        <div className="text-xs text-[var(--app-text-subtle)] mt-1">
                          Invoice: {expense.invoiceNumber}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Badge size="sm" variant="flat" className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                        {typeConfig.label}
                      </Badge>
                      {expense.allocatedToLPs && (
                        <div className="text-xs text-[var(--app-text-subtle)] mt-1">LP Allocated</div>
                      )}
                    </div>

                    <div className="col-span-1 text-right font-medium">
                      {formatCurrency(expense.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="col-span-1">
                      <StatusBadge status={expense.status} domain="fund-admin" size="sm" />
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-1">
                      {expense.status === 'pending' && onApproveExpense && (
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => onApproveExpense(expense.id)}
                          className="text-[var(--app-success)]"
                        >
                          Approve
                        </Button>
                      )}
                      {expense.status === 'pending' && onRejectExpense && (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => onRejectExpense(expense.id)}
                          className="text-[var(--app-danger)]"
                        >
                          Reject
                        </Button>
                      )}
                      {expense.status === 'approved' && onMarkPaid && (
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => onMarkPaid(expense.id)}
                          className="text-[var(--app-primary)]"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
