'use client';

import { useState } from 'react';
import { Card, Button, Badge, Input } from '@/ui';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight, ChevronDown, Search, Filter, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountCategory =
  | 'current-asset' | 'fixed-asset' | 'current-liability' | 'long-term-liability'
  | 'capital' | 'retained-earnings' | 'operating-revenue' | 'investment-income'
  | 'operating-expense' | 'administrative-expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  description?: string;
  balance: number;
  isActive: boolean;
  isSystem: boolean; // Cannot be deleted/modified
  lastActivity?: Date;
  subAccounts?: Account[];
}

interface ChartOfAccountsProps {
  accounts: Account[];
  onAddAccount?: (parentId?: string) => void;
  onEditAccount?: (accountId: string) => void;
  onDeleteAccount?: (accountId: string) => void;
  onViewLedger?: (accountId: string) => void;
}

export function ChartOfAccounts({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onViewLedger,
}: ChartOfAccountsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const getAccountTypeConfig = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return { color: 'text-[var(--app-success)]', bgColor: 'bg-[var(--app-success-bg)]', label: 'Asset', icon: TrendingUp };
      case 'liability':
        return { color: 'text-[var(--app-danger)]', bgColor: 'bg-[var(--app-danger-bg)]', label: 'Liability', icon: TrendingDown };
      case 'equity':
        return { color: 'text-[var(--app-primary)]', bgColor: 'bg-[var(--app-primary-bg)]', label: 'Equity', icon: DollarSign };
      case 'revenue':
        return { color: 'text-[var(--app-success)]', bgColor: 'bg-[var(--app-success-bg)]', label: 'Revenue', icon: TrendingUp };
      case 'expense':
        return { color: 'text-[var(--app-danger)]', bgColor: 'bg-[var(--app-danger-bg)]', label: 'Expense', icon: TrendingDown };
    }
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
    return isNegative ? `(${formatted})` : formatted;
  };

  const toggleExpand = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Build account hierarchy
  const buildHierarchy = (accounts: Account[]): Account[] => {
    type AccountWithChildren = Account & { subAccounts: AccountWithChildren[] };
    const accountMap = new Map<string, AccountWithChildren>(
      accounts.map((acc) => [acc.id, { ...acc, subAccounts: [] }])
    );
    const rootAccounts: AccountWithChildren[] = [];

    accounts.forEach(account => {
      const acc = accountMap.get(account.id)!;
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.subAccounts.push(acc);
        }
      } else {
        rootAccounts.push(acc);
      }
    });

    return rootAccounts;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const hierarchicalAccounts = buildHierarchy(filteredAccounts);

  const renderAccountRow = (account: Account, level: number = 0) => {
    const hasChildren = account.subAccounts && account.subAccounts.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const typeConfig = getAccountTypeConfig(account.type);
    const Icon = typeConfig.icon;

    return (
      <div key={account.id}>
        <div
          className={`flex items-center justify-between p-3 hover:bg-[var(--app-surface-hover)] transition-colors border-b border-[var(--app-border)] ${
            !account.isActive ? 'opacity-50' : ''
          }`}
          style={{ paddingLeft: `${(level * 24) + 12}px` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(account.id)}
                className="flex-shrink-0 hover:text-[var(--app-primary)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Account Icon & Info */}
            <div className={`p-2 rounded-lg ${typeConfig.bgColor} flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${typeConfig.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-[var(--app-text-muted)]">{account.code}</span>
                <span className="font-medium truncate">{account.name}</span>
                {account.isSystem && (
                  <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                    System
                  </Badge>
                )}
                {!account.isActive && (
                  <Badge size="sm" variant="flat" className="bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]">
                    Inactive
                  </Badge>
                )}
              </div>
              {account.description && (
                <p className="text-xs text-[var(--app-text-muted)] truncate">{account.description}</p>
              )}
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-3">
            <div className="text-right min-w-[120px]">
              <div className={`font-medium ${account.balance < 0 ? 'text-[var(--app-danger)]' : ''}`}>
                {formatCurrency(account.balance)}
              </div>
              {account.lastActivity && (
                <div className="text-xs text-[var(--app-text-subtle)]">
                  {account.lastActivity.toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {onViewLedger && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={() => onViewLedger(account.id)}
                  title="View Ledger"
                >
                  <BookOpen className="w-3 h-3" />
                </Button>
              )}
              {onEditAccount && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={() => onEditAccount(account.id)}
                  title="Edit Account"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
              {onDeleteAccount && !account.isSystem && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={() => onDeleteAccount(account.id)}
                  title="Delete Account"
                >
                  <Trash2 className="w-3 h-3 text-[var(--app-danger)]" />
                </Button>
              )}
              {onAddAccount && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={() => onAddAccount(account.id)}
                  title="Add Sub-Account"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Render sub-accounts */}
        {hasChildren && isExpanded && (
          <div>
            {account.subAccounts!.map(subAccount => renderAccountRow(subAccount, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate totals by type
  const totals = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = 0;
    acc[account.type] += account.balance;
    return acc;
  }, {} as Record<AccountType, number>);

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Chart of Accounts</h3>
          </div>
          {onAddAccount && (
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => onAddAccount()}
            >
              Add Account
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { type: 'asset' as const, label: 'Assets' },
            { type: 'liability' as const, label: 'Liabilities' },
            { type: 'equity' as const, label: 'Equity' },
            { type: 'revenue' as const, label: 'Revenue' },
            { type: 'expense' as const, label: 'Expenses' },
          ].map(({ type, label }) => {
            const config = getAccountTypeConfig(type);
            const Icon = config.icon;
            return (
              <div
                key={type}
                className={`p-3 rounded-lg ${config.bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-xs font-medium text-[var(--app-text-muted)]">{label}</span>
                </div>
                <p className={`text-lg font-bold ${config.color}`}>
                  {formatCurrency(totals[type] || 0)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Accounting Equation */}
        <Card padding="sm" className="bg-[var(--app-surface-hover)]">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">Assets:</span>
              <span className="ml-2 text-[var(--app-success)]">{formatCurrency(totals.asset || 0)}</span>
            </div>
            <span className="text-[var(--app-text-muted)]">=</span>
            <div>
              <span className="font-medium">Liabilities:</span>
              <span className="ml-2 text-[var(--app-danger)]">{formatCurrency(totals.liability || 0)}</span>
            </div>
            <span className="text-[var(--app-text-muted)]">+</span>
            <div>
              <span className="font-medium">Equity:</span>
              <span className="ml-2 text-[var(--app-primary)]">{formatCurrency(totals.equity || 0)}</span>
            </div>
          </div>
        </Card>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4" />}
            size="sm"
            className="flex-1"
          />
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AccountType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        {/* Account List */}
        <div className="border border-[var(--app-border)] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-[var(--app-surface-hover)] border-b border-[var(--app-border)] text-sm font-medium text-[var(--app-text-muted)]">
            <div className="flex-1">Account</div>
            <div className="flex items-center gap-3">
              <div className="min-w-[120px] text-right">Balance</div>
              <div className="w-[140px]">Actions</div>
            </div>
          </div>

          {/* Account Rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {hierarchicalAccounts.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No accounts found</p>
                {onAddAccount && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="mt-3"
                    startContent={<Plus className="w-3 h-3" />}
                    onPress={() => onAddAccount()}
                  >
                    Create First Account
                  </Button>
                )}
              </div>
            ) : (
              hierarchicalAccounts.map(account => renderAccountRow(account))
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm text-[var(--app-text-muted)]">
          <span>{filteredAccounts.length} accounts</span>
          <span>
            {filteredAccounts.filter(a => !a.isActive).length} inactive
          </span>
        </div>
      </div>
    </Card>
  );
}
