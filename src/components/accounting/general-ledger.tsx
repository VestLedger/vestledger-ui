'use client';

import { useState } from 'react';
import { Card, Button, Badge, Input } from '@/ui';
import { BookOpen, Plus, Calendar, Filter, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  lineItems: JournalLineItem[];
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: Date;
  postedAt?: Date;
  tags?: string[];
}

export interface JournalLineItem {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

interface GeneralLedgerProps {
  entries: JournalEntry[];
  accountId?: string;
  accountName?: string;
  onAddEntry?: () => void;
  onEditEntry?: (entryId: string) => void;
  onReverseEntry?: (entryId: string) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function GeneralLedger({
  entries,
  accountId,
  accountName,
  onAddEntry,
  onEditEntry,
  onReverseEntry,
  onExport,
}: GeneralLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: JournalEntry['status']) => {
    switch (status) {
      case 'draft':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
            Draft
          </Badge>
        );
      case 'posted':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
            Posted
          </Badge>
        );
      case 'reversed':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
            Reversed
          </Badge>
        );
    }
  };

  // Filter entries
  const filterByDateRange = (entry: JournalEntry) => {
    if (dateRange === 'all') return true;

    const now = new Date();
    const entryDate = new Date(entry.date);

    switch (dateRange) {
      case 'month':
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const entryQuarter = Math.floor(entryDate.getMonth() / 3);
        return currentQuarter === entryQuarter && entryDate.getFullYear() === now.getFullYear();
      case 'year':
        return entryDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch =
        entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reference?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
      const matchesDateRange = filterByDateRange(entry);
      const matchesAccount = !accountId || entry.lineItems.some(item => item.accountId === accountId);

      return matchesSearch && matchesStatus && matchesDateRange && matchesAccount;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate running balance for account view
  const calculateRunningBalance = () => {
    let runningBalance = 0;
    const entriesWithBalance = filteredEntries.map(entry => {
      const accountLineItems = entry.lineItems.filter(item => item.accountId === accountId);
      const entryBalance = accountLineItems.reduce((sum, item) => sum + item.debit - item.credit, 0);
      runningBalance += entryBalance;
      return { ...entry, runningBalance };
    });
    return entriesWithBalance;
  };

  const entriesWithBalance = accountId ? calculateRunningBalance() : filteredEntries;

  // Calculate totals
  const totals = filteredEntries.reduce(
    (acc, entry) => {
      entry.lineItems.forEach(item => {
        if (!accountId || item.accountId === accountId) {
          acc.debit += item.debit;
          acc.credit += item.credit;
        }
      });
      return acc;
    },
    { debit: 0, credit: 0 }
  );

  return (
    <Card padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--app-primary)]" />
            <div>
              <h3 className="text-lg font-semibold">
                General Ledger
                {accountName && ` - ${accountName}`}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                {filteredEntries.length} entries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Download className="w-3 h-3" />}
                  onPress={() => onExport('csv')}
                >
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<FileText className="w-3 h-3" />}
                  onPress={() => onExport('pdf')}
                >
                  PDF
                </Button>
              </>
            )}
            {onAddEntry && (
              <Button
                size="sm"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onAddEntry}
              >
                New Entry
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Debits</p>
            <p className="text-lg font-bold text-[var(--app-success)]">{formatCurrency(totals.debit)}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-danger-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Credits</p>
            <p className="text-lg font-bold text-[var(--app-danger)]">{formatCurrency(totals.credit)}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Net Change</p>
            <p className={`text-lg font-bold ${totals.debit - totals.credit >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
              {formatCurrency(totals.debit - totals.credit)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Filter className="w-4 h-4" />}
            size="sm"
            className="flex-1"
          />
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="reversed">Reversed</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Entries Table */}
        <div className="border border-[var(--app-border)] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--app-surface-hover)] border-b border-[var(--app-border)] p-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[var(--app-text-muted)]">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Entry #</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Account</div>
              <div className="col-span-1 text-right">Debit</div>
              <div className="col-span-1 text-right">Credit</div>
              {accountId && <div className="col-span-1 text-right">Balance</div>}
              <div className="col-span-1">Status</div>
              <div className={`${accountId ? 'col-span-1' : 'col-span-2'} text-right`}>Actions</div>
            </div>
          </div>

          {/* Rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {paginatedEntries.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No journal entries found</p>
              </div>
            ) : (
              paginatedEntries.map((entry) => {
                const relevantLineItems = accountId
                  ? entry.lineItems.filter(item => item.accountId === accountId)
                  : entry.lineItems;

                return (
                  <div
                    key={entry.id}
                    className="border-b border-[var(--app-border)] last:border-0"
                  >
                    {relevantLineItems.map((lineItem, idx) => (
                      <div
                        key={lineItem.id}
                        className="grid grid-cols-12 gap-2 p-3 hover:bg-[var(--app-surface-hover)] transition-colors text-sm"
                      >
                        {idx === 0 ? (
                          <>
                            <div className="col-span-1 text-[var(--app-text-muted)]">
                              {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="col-span-1 font-mono text-xs">{entry.entryNumber}</div>
                            <div className="col-span-3">
                              <div className="font-medium">{entry.description}</div>
                              {entry.reference && (
                                <div className="text-xs text-[var(--app-text-muted)]">Ref: {entry.reference}</div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="col-span-5"></div>
                        )}

                        <div className="col-span-2">
                          <div className="font-mono text-xs text-[var(--app-text-muted)]">{lineItem.accountCode}</div>
                          <div className="text-xs truncate">{lineItem.accountName}</div>
                        </div>

                        <div className="col-span-1 text-right font-medium text-[var(--app-success)]">
                          {lineItem.debit > 0 ? formatCurrency(lineItem.debit) : '-'}
                        </div>

                        <div className="col-span-1 text-right font-medium text-[var(--app-danger)]">
                          {lineItem.credit > 0 ? formatCurrency(lineItem.credit) : '-'}
                        </div>

                        {accountId && (
                          <div className="col-span-1 text-right font-medium">
                            {idx === relevantLineItems.length - 1 &&
                              formatCurrency((entry as any).runningBalance || 0)}
                          </div>
                        )}

                        {idx === 0 ? (
                          <>
                            <div className="col-span-1">{getStatusBadge(entry.status)}</div>
                            <div className={`${accountId ? 'col-span-1' : 'col-span-2'} flex items-center justify-end gap-1`}>
                              {onEditEntry && entry.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="light"
                                  onPress={() => onEditEntry(entry.id)}
                                >
                                  Edit
                                </Button>
                              )}
                              {onReverseEntry && entry.status === 'posted' && (
                                <Button
                                  size="sm"
                                  variant="light"
                                  onPress={() => onReverseEntry(entry.id)}
                                  className="text-[var(--app-danger)]"
                                >
                                  Reverse
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className={accountId ? 'col-span-2' : 'col-span-3'}></div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--app-text-muted)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                isDisabled={currentPage === 1}
                onPress={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? 'solid' : 'flat'}
                      onPress={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                isDisabled={currentPage === totalPages}
                onPress={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
