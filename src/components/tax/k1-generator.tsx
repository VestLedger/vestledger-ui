'use client';

import { Card, Button, Badge } from '@/ui';
import { FileText, Download, Settings, RefreshCw, Send, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { formatCurrency as formatCurrencyBase } from '@/utils/formatting';
import { SearchToolbar, StatusBadge } from '@/components/ui';

export type K1IncomeType =
  | 'ordinary-business-income'
  | 'net-rental-income'
  | 'interest-income'
  | 'dividend-income'
  | 'royalty-income'
  | 'capital-gains-short'
  | 'capital-gains-long'
  | 'section-1231-gain'
  | 'unrecaptured-section-1250'
  | 'section-179-deduction'
  | 'other-income';

export interface K1Configuration {
  id: string;
  fundId: string;
  fundName: string;
  taxYear: number;
  entityType: 'partnership' | 'llc-partnership' | 's-corp';
  ein: string;
  principalBusinessActivity: string;
  naicsCode: string;

  // Distribution Rules
  allocationMethod: 'pro-rata' | 'custom' | 'waterfall-based';
  useFiscalYear: boolean;
  fiscalYearEnd?: string; // MM-DD

  // Income Categories
  includeOrdinaryIncome: boolean;
  includeRentalIncome: boolean;
  includeInterestIncome: boolean;
  includeDividendIncome: boolean;
  includeCapitalGains: boolean;
  includeSection1231: boolean;

  // Customization
  customFields: K1CustomField[];
  footnotesTemplate?: string;
  preparerInfo: PreparerInfo;

  // State Filing
  stateFilings: StateFilingConfig[];

  status: 'active' | 'inactive' | 'draft';
  lastModified: Date;
}

export interface K1CustomField {
  id: string;
  box: string; // e.g., "Box 20 - Code Z"
  label: string;
  description: string;
  calculationLogic?: 'manual' | 'formula' | 'imported';
  formula?: string;
  isRequired: boolean;
}

export interface PreparerInfo {
  firmName: string;
  address: string;
  phone: string;
  ein: string;
  preparerName: string;
  preparerPTIN: string;
  isSelfPrepared: boolean;
}

export interface StateFilingConfig {
  state: string;
  stateEIN?: string;
  requiresSeparateK1: boolean;
  hasStateModifications: boolean;
  modificationRules?: string;
}

export interface K1Document {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerSSN: string; // Last 4 digits shown
  fundId: string;
  fundName: string;
  taxYear: number;
  generatedDate: Date;
  status: 'draft' | 'review' | 'approved' | 'sent' | 'amended';

  // Partner Info
  partnerType: 'individual' | 'entity';
  isGeneralPartner: boolean;
  isDomestic: boolean;

  // Ownership
  beginningCapital: number;
  endingCapital: number;
  beginningProfitShare: number;
  endingProfitShare: number;
  beginningLossShare: number;
  endingLossShare: number;

  // Income/Loss Items
  incomeItems: K1IncomeItem[];
  deductions: K1Deduction[];
  credits: K1Credit[];

  // Alternative Minimum Tax
  amtItems: AMTItem[];

  // Self-Employment
  selfEmploymentEarnings?: number;

  // Foreign Transactions
  foreignTaxesPaid?: number;
  foreignSourceIncome?: number;

  // Capital Account
  capitalAccountAnalysis: CapitalAccountAnalysis;

  // State K-1s
  stateK1s: StateK1[];

  // Metadata
  footnotes?: string;
  amendments?: K1Amendment[];
  distributionDate?: Date;
  deliveryMethod?: 'email' | 'mail' | 'portal';
  deliveryStatus?: 'pending' | 'sent' | 'bounced' | 'downloaded';
}

export interface K1IncomeItem {
  id: string;
  type: K1IncomeType;
  box: string;
  amount: number;
  description?: string;
}

export interface K1Deduction {
  id: string;
  type: 'section-179' | 'charitable' | 'investment-interest' | 'other';
  box: string;
  amount: number;
  description?: string;
}

export interface K1Credit {
  id: string;
  type: 'low-income-housing' | 'renewable-energy' | 'foreign-tax' | 'other';
  box: string;
  amount: number;
  description?: string;
}

export interface AMTItem {
  id: string;
  description: string;
  box: string;
  amount: number;
  isAdjustment: boolean;
}

export interface CapitalAccountAnalysis {
  beginningBalance: number;
  capitalContributed: number;
  currentYearIncrease: number;
  currentYearDecrease: number;
  withdrawalsDistributions: number;
  endingBalance: number;
  method: 'tax-basis' | 'gaap' | 'section-704b' | 'other';
}

export interface StateK1 {
  state: string;
  stateIncome: number;
  stateWithholding?: number;
  stateCredits?: number;
  hasModifications: boolean;
}

export interface K1Amendment {
  amendmentNumber: number;
  amendedDate: Date;
  reason: string;
  changedBoxes: string[];
}

interface K1GeneratorProps {
  configurations: K1Configuration[];
  documents: K1Document[];
  fundId?: string;
  taxYear?: number;
  onConfigureK1?: (fundId: string) => void;
  onGenerateK1s?: (fundId: string, taxYear: number) => void;
  onPreviewK1?: (documentId: string) => void;
  onApproveK1?: (documentId: string) => void;
  onSendK1?: (documentId: string) => void;
  onAmendK1?: (documentId: string) => void;
  onExportAll?: (fundId: string, taxYear: number, format: 'pdf' | 'csv') => void;
}

export function K1Generator({
  configurations,
  documents,
  fundId,
  taxYear = new Date().getFullYear() - 1,
  onConfigureK1,
  onGenerateK1s,
  onPreviewK1,
  onApproveK1,
  onSendK1,
  onAmendK1,
  onExportAll,
}: K1GeneratorProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedTaxYear: number;
    filterStatus: K1Document['status'] | 'all';
    searchQuery: string;
  }>(`k1-generator:${fundId ?? 'all'}`, {
    selectedTaxYear: taxYear,
    filterStatus: 'all',
    searchQuery: '',
  });
  const { selectedTaxYear, filterStatus, searchQuery } = ui;

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = formatCurrencyBase(Math.abs(amount), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNegative ? `(${formatted})` : formatted;
  };

  const activeConfig = configurations.find(
    c => (!fundId || c.fundId === fundId) && c.taxYear === selectedTaxYear && c.status === 'active'
  );

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.partnerSSN.includes(searchQuery) ||
      doc.fundName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesFund = !fundId || doc.fundId === fundId;
    const matchesTaxYear = doc.taxYear === selectedTaxYear;

    return matchesSearch && matchesStatus && matchesFund && matchesTaxYear;
  });

  // Calculate totals
  const totalIncome = filteredDocuments.reduce(
    (sum, doc) => sum + doc.incomeItems.reduce((s, i) => s + i.amount, 0),
    0
  );

  const statusCounts = {
    draft: filteredDocuments.filter(d => d.status === 'draft').length,
    review: filteredDocuments.filter(d => d.status === 'review').length,
    approved: filteredDocuments.filter(d => d.status === 'approved').length,
    sent: filteredDocuments.filter(d => d.status === 'sent').length,
    amended: filteredDocuments.filter(d => d.status === 'amended').length,
  };

  return (
    <div className="space-y-4">
      {/* Header & Configuration */}
      <Card padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
              <h3 className="text-lg font-semibold">K-1 Generation</h3>
            </div>
            {activeConfig && (
              <div className="space-y-1 text-sm">
                <p className="text-app-text-muted dark:text-app-dark-text-muted">
                  {activeConfig.fundName} • Tax Year {activeConfig.taxYear}
                </p>
                <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
                  EIN: {activeConfig.ein} • {activeConfig.entityType.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-sm rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text"
              value={selectedTaxYear}
              onChange={(e) => patchUI({ selectedTaxYear: Number(e.target.value) })}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {onConfigureK1 && activeConfig && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Settings className="w-3 h-3" />}
                onPress={() => onConfigureK1(activeConfig.fundId)}
              >
                Configure
              </Button>
            )}
            {onGenerateK1s && activeConfig && (
              <Button
                size="sm"
                color="primary"
                startContent={<RefreshCw className="w-3 h-3" />}
                onPress={() => onGenerateK1s(activeConfig.fundId, selectedTaxYear)}
              >
                Generate K-1s
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Summary */}
        {activeConfig && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
              <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Allocation Method</p>
              <p className="text-sm font-medium capitalize">
                {activeConfig.allocationMethod.replace(/-/g, ' ')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
              <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Custom Fields</p>
              <p className="text-sm font-medium">
                {activeConfig.customFields.length} Configured
              </p>
            </div>
            <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
              <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">State Filings</p>
              <p className="text-sm font-medium">
                {activeConfig.stateFilings.length} States
              </p>
            </div>
            <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover">
              <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Preparer</p>
              <p className="text-sm font-medium">
                {activeConfig.preparerInfo.isSelfPrepared ? 'Self-Prepared' : activeConfig.preparerInfo.firmName}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card padding="sm" className="bg-app-text-muted/10 dark:bg-app-dark-text-muted/10">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Total K-1s</p>
          <p className="text-2xl font-bold">{filteredDocuments.length}</p>
        </Card>
        <Card padding="sm" className="bg-app-warning-bg dark:bg-app-dark-warning-bg">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Draft</p>
          <p className="text-2xl font-bold text-app-warning dark:text-app-dark-warning">{statusCounts.draft}</p>
        </Card>
        <Card padding="sm" className="bg-app-warning-bg dark:bg-app-dark-warning-bg">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Review</p>
          <p className="text-2xl font-bold text-app-warning dark:text-app-dark-warning">{statusCounts.review}</p>
        </Card>
        <Card padding="sm" className="bg-app-info-bg dark:bg-app-dark-info-bg">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Approved</p>
          <p className="text-2xl font-bold text-app-info dark:text-app-dark-info">{statusCounts.approved}</p>
        </Card>
        <Card padding="sm" className="bg-app-success-bg dark:bg-app-dark-success-bg">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Sent</p>
          <p className="text-2xl font-bold text-app-success dark:text-app-dark-success">{statusCounts.sent}</p>
        </Card>
        <Card padding="sm" className="bg-app-surface-hover dark:bg-app-dark-surface-hover border border-app-border dark:border-app-dark-border">
          <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Total Income</p>
          <p className="text-lg font-bold">{formatCurrency(totalIncome)}</p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card padding="md">
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search by partner name or SSN..."
          rightActions={(
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 text-sm rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text"
                value={filterStatus}
                onChange={(e) => patchUI({ filterStatus: e.target.value as K1Document['status'] | 'all' })}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
                <option value="amended">Amended</option>
              </select>
              {onExportAll && activeConfig && (
                <>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Download className="w-3 h-3" />}
                    onPress={() => onExportAll(activeConfig.fundId, selectedTaxYear, 'pdf')}
                  >
                    Export PDFs
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Download className="w-3 h-3" />}
                    onPress={() => onExportAll(activeConfig.fundId, selectedTaxYear, 'csv')}
                  >
                    Export CSV
                  </Button>
                </>
              )}
            </div>
          )}
        />
      </Card>

      {/* K-1 Documents List */}
      <Card padding="md">
        <div className="space-y-2">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No K-1 documents found</p>
            </div>
          ) : (
            filteredDocuments.map(doc => {
              const totalIncomeAmount = doc.incomeItems.reduce((sum, item) => sum + item.amount, 0);
              const totalDeductions = doc.deductions.reduce((sum, item) => sum + item.amount, 0);

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover hover:bg-app-surface dark:hover:bg-app-dark-surface border border-app-border dark:border-app-dark-border transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{doc.partnerName}</span>
                        <StatusBadge status={doc.status} domain="tax" size="sm" showIcon />
                        {doc.isGeneralPartner && (
                          <Badge size="sm" variant="flat" className="bg-app-primary-bg dark:bg-app-dark-primary-bg text-app-primary dark:text-app-dark-primary">
                            GP
                          </Badge>
                        )}
                        {doc.amendments && doc.amendments.length > 0 && (
                          <Badge size="sm" variant="flat" className="bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger">
                            {doc.amendments.length} Amendment{doc.amendments.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-app-text-muted dark:text-app-dark-text-muted">
                        <span>SSN: ***-**-{doc.partnerSSN}</span>
                        <span>•</span>
                        <span>{doc.partnerType === 'individual' ? 'Individual' : 'Entity'}</span>
                        <span>•</span>
                        <span>Generated {doc.generatedDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {doc.deliveryMethod && (
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">
                          Delivery: {doc.deliveryMethod}
                        </p>
                      )}
                      {doc.deliveryStatus && (
                        <Badge
                          size="sm"
                          variant="flat"
                          className={
                            doc.deliveryStatus === 'sent' || doc.deliveryStatus === 'downloaded'
                              ? 'bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success'
                              : doc.deliveryStatus === 'bounced'
                              ? 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger'
                              : 'bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning'
                          }
                        >
                          {doc.deliveryStatus}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-4 gap-3 mb-3 p-3 rounded-lg bg-app-surface dark:bg-app-dark-surface">
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Beginning Capital</p>
                      <p className="text-sm font-bold">{formatCurrency(doc.beginningCapital)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Total Income</p>
                      <p className="text-sm font-bold text-app-success dark:text-app-dark-success">
                        {formatCurrency(totalIncomeAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Deductions</p>
                      <p className="text-sm font-bold text-app-danger dark:text-app-dark-danger">
                        {formatCurrency(totalDeductions)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Ending Capital</p>
                      <p className="text-sm font-bold">{formatCurrency(doc.endingCapital)}</p>
                    </div>
                  </div>

                  {/* Income Items Summary */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-2">
                      Income Items ({doc.incomeItems.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doc.incomeItems.slice(0, 5).map(item => (
                        <Badge
                          key={item.id}
                          size="sm"
                          variant="flat"
                          className="bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success"
                        >
                          {item.box}: {formatCurrency(item.amount)}
                        </Badge>
                      ))}
                      {doc.incomeItems.length > 5 && (
                        <Badge size="sm" variant="flat" className="bg-app-text-muted/10 dark:bg-app-dark-text-muted/10">
                          +{doc.incomeItems.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* State K-1s */}
                  {doc.stateK1s.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-2">
                        State K-1s ({doc.stateK1s.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {doc.stateK1s.map((state, idx) => (
                          <Badge
                            key={idx}
                            size="sm"
                            variant="flat"
                            className="bg-app-info-bg dark:bg-app-dark-info-bg text-app-info dark:text-app-dark-info"
                          >
                            {state.state}: {formatCurrency(state.stateIncome)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-app-border dark:border-app-dark-border">
                    {onPreviewK1 && (
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Eye className="w-3 h-3" />}
                        onPress={() => onPreviewK1(doc.id)}
                      >
                        Preview
                      </Button>
                    )}
                    {doc.status === 'review' && onApproveK1 && (
                      <Button
                        size="sm"
                        color="primary"
                        startContent={<CheckCircle className="w-3 h-3" />}
                        onPress={() => onApproveK1(doc.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {(doc.status === 'approved' || doc.status === 'sent') && onSendK1 && (
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Send className="w-3 h-3" />}
                        onPress={() => onSendK1(doc.id)}
                      >
                        {doc.status === 'sent' ? 'Resend' : 'Send'}
                      </Button>
                    )}
                    {doc.status === 'sent' && onAmendK1 && (
                      <Button
                        size="sm"
                        variant="light"
                        className="text-app-danger dark:text-app-dark-danger"
                        startContent={<AlertCircle className="w-3 h-3" />}
                        onPress={() => onAmendK1(doc.id)}
                      >
                        Amend
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
