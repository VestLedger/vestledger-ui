'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge } from '@/ui';
import { ArrowRightLeft, Users, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import { SearchToolbar, StatusBadge } from '@/components/ui';

export type TransferType = 'direct' | 'secondary-sale' | 'inheritance' | 'gift' | 'court-order';
export type TransferStatus =
  | 'draft'
  | 'pending-gp-approval'
  | 'pending-legal-review'
  | 'pending-buyer-funding'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface LPTransfer {
  id: string;
  transferNumber: string;
  fundId: string;
  fundName: string;
  type: TransferType;
  status: TransferStatus;

  // Parties
  transferorId: string;
  transferorName: string;
  transferorEmail: string;
  transfereeId?: string;
  transfereeName?: string;
  transfereeEmail?: string;

  // Transfer Details
  commitmentAmount: number;
  fundedAmount: number;
  unfundedCommitment: number;
  transferPrice?: number; // For secondary sales
  discount?: number; // Discount to NAV (e.g., 15%)

  // Rights & Restrictions
  includesManagementRights: boolean;
  includesInformationRights: boolean;
  includesVotingRights: boolean;
  subjectToROFR: boolean; // Right of First Refusal
  rofrDeadline?: Date;
  requiresGPConsent: boolean;
  requiresLPVote: boolean;

  // Dates
  requestedDate: Date;
  gpApprovalDate?: Date;
  legalReviewDate?: Date;
  closingDate?: Date;
  effectiveDate?: Date;

  // Approvals
  gpApprover?: string;
  legalReviewer?: string;
  rejectionReason?: string;

  // Documents
  documents: TransferDocument[];

  // Compliance
  accreditationVerified: boolean;
  kycCompleted: boolean;
  amlCleared: boolean;
  taxFormsReceived: boolean;

  notes?: string;
}

export interface TransferDocument {
  id: string;
  name: string;
  type: 'assignment-agreement' | 'consent-form' | 'accreditation' | 'kyc' | 'tax-form' | 'other';
  uploadedDate: Date;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
}

export interface ROFRExercise {
  id: string;
  transferId: string;
  exercisedBy: string;
  exercisedByName: string;
  exerciseDate: Date;
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
}

interface TransferSecondaryProps {
  transfers: LPTransfer[];
  rofrExercises?: ROFRExercise[];
  fundId?: string;
  onInitiateTransfer?: () => void;
  onReviewTransfer?: (transferId: string) => void;
  onApproveTransfer?: (transferId: string) => void;
  onRejectTransfer?: (transferId: string, reason: string) => void;
  onCompleteTransfer?: (transferId: string) => void;
  onUploadDocument?: (transferId: string) => void;
  onExerciseROFR?: (transferId: string) => void;
}

export function TransferSecondary({
  transfers,
  rofrExercises = [],
  fundId,
  onInitiateTransfer,
  onReviewTransfer,
  onApproveTransfer,
  onRejectTransfer: _onRejectTransfer,
  onCompleteTransfer,
  onUploadDocument,
  onExerciseROFR,
}: TransferSecondaryProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    filterStatus: TransferStatus | 'all';
    filterType: TransferType | 'all';
    selectedTransfer: LPTransfer | null;
  }>(`transfer-secondary:${fundId ?? 'all'}`, {
    searchQuery: '',
    filterStatus: 'all',
    filterType: 'all',
    selectedTransfer: null,
  });
  const { searchQuery, filterStatus, filterType } = ui;

  const getTypeBadge = (type: TransferType) => {
    const colors = {
      'direct': 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
      'secondary-sale': 'bg-[var(--app-success-bg)] text-[var(--app-success)]',
      'inheritance': 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
      'gift': 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]',
      'court-order': 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
    };

    return (
      <Badge size="sm" variant="flat" className={colors[type]}>
        {type.replace(/-/g, ' ')}
      </Badge>
    );
  };

  const getComplianceStatus = (transfer: LPTransfer) => {
    const total = 4;
    const completed = [
      transfer.accreditationVerified,
      transfer.kycCompleted,
      transfer.amlCleared,
      transfer.taxFormsReceived,
    ].filter(Boolean).length;

    return { completed, total, percentage: (completed / total) * 100 };
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch =
      transfer.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.transferorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.transfereeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.fundName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
    const matchesType = filterType === 'all' || transfer.type === filterType;
    const matchesFund = !fundId || transfer.fundId === fundId;

    return matchesSearch && matchesStatus && matchesType && matchesFund;
  });

  return (
    <div className="space-y-4">
      {/* Header & Stats */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Transfers & Secondary Market</h3>
          </div>
          {onInitiateTransfer && (
            <Button
              size="sm"
              color="primary"
              startContent={<ArrowRightLeft className="w-4 h-4" />}
              onPress={onInitiateTransfer}
            >
              Initiate Transfer
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-[var(--app-warning)]">
              {transfers.filter(t =>
                t.status === 'pending-gp-approval' ||
                t.status === 'pending-legal-review'
              ).length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Approved</p>
            <p className="text-2xl font-bold text-[var(--app-info)]">
              {transfers.filter(t => t.status === 'approved').length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Completed</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">
              {transfers.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Volume</p>
            <p className="text-lg font-bold">
              {formatCurrency(
                transfers
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + (t.transferPrice || t.commitmentAmount), 0)
              )}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Avg Discount</p>
            <p className="text-lg font-bold">
              {formatPercent(
                transfers
                  .filter(t => t.discount && t.status === 'completed')
                  .reduce((sum, t, idx, arr) => sum + (t.discount || 0) / arr.length, 0)
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="md">
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search transfers..."
          rightActions={(
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={filterStatus}
                onChange={(e) => patchUI({ filterStatus: e.target.value as TransferStatus | 'all' })}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending-gp-approval">Pending GP Approval</option>
                <option value="pending-legal-review">Pending Legal Review</option>
                <option value="pending-buyer-funding">Pending Funding</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                value={filterType}
                onChange={(e) => patchUI({ filterType: e.target.value as TransferType | 'all' })}
              >
                <option value="all">All Types</option>
                <option value="direct">Direct Transfer</option>
                <option value="secondary-sale">Secondary Sale</option>
                <option value="inheritance">Inheritance</option>
                <option value="gift">Gift</option>
                <option value="court-order">Court Order</option>
              </select>
            </div>
          )}
        />
      </Card>

      {/* Transfers List */}
      <Card padding="md">
        <div className="space-y-3">
          {filteredTransfers.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No transfers found</p>
            </div>
          ) : (
            filteredTransfers.map(transfer => {
              const compliance = getComplianceStatus(transfer);
              const rofrPending = rofrExercises.filter(
                r => r.transferId === transfer.id && r.status === 'pending'
              );

              return (
                <div
                  key={transfer.id}
                  className="p-4 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] border border-[var(--app-border)] transition-colors cursor-pointer"
                  onClick={() => patchUI({ selectedTransfer: transfer })}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">{transfer.transferNumber}</span>
                        <StatusBadge status={transfer.status} domain="fund-admin" size="sm" showIcon />
                        {getTypeBadge(transfer.type)}
                        {transfer.subjectToROFR && rofrPending.length > 0 && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            ROFR Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--app-text-muted)]">{transfer.fundName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--app-text-muted)]">Requested</p>
                      <p className="text-sm font-medium">
                        {transfer.requestedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[var(--app-text-muted)]" />
                        <span className="text-xs font-medium text-[var(--app-text-muted)]">Transferor</span>
                      </div>
                      <p className="text-sm font-medium">{transfer.transferorName}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">{transfer.transferorEmail}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[var(--app-text-muted)]" />
                        <span className="text-xs font-medium text-[var(--app-text-muted)]">Transferee</span>
                      </div>
                      {transfer.transfereeName ? (
                        <>
                          <p className="text-sm font-medium">{transfer.transfereeName}</p>
                          <p className="text-xs text-[var(--app-text-muted)]">{transfer.transfereeEmail}</p>
                        </>
                      ) : (
                        <p className="text-sm text-[var(--app-text-muted)] italic">Not yet assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-4 gap-3 mb-3 p-3 rounded-lg bg-[var(--app-surface)]">
                    <div>
                      <p className="text-xs text-[var(--app-text-muted)] mb-1">Commitment</p>
                      <p className="text-sm font-bold">{formatCurrency(transfer.commitmentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--app-text-muted)] mb-1">Funded</p>
                      <p className="text-sm font-bold">{formatCurrency(transfer.fundedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--app-text-muted)] mb-1">Unfunded</p>
                      <p className="text-sm font-bold">{formatCurrency(transfer.unfundedCommitment)}</p>
                    </div>
                    {transfer.transferPrice && (
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Transfer Price</p>
                        <p className="text-sm font-bold text-[var(--app-success)]">
                          {formatCurrency(transfer.transferPrice)}
                        </p>
                        {transfer.discount && (
                          <p className="text-xs text-[var(--app-text-muted)]">
                            {formatPercent(-transfer.discount)} to NAV
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Compliance Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--app-text-muted)]">Compliance Status</span>
                      <span className="text-xs font-medium">
                        {compliance.completed}/{compliance.total} Complete
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--app-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--app-success)] transition-all"
                        style={{ width: `${compliance.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={transfer.accreditationVerified ? 'text-[var(--app-success)]' : 'text-[var(--app-text-muted)]'}>
                        {transfer.accreditationVerified ? '✓' : '○'} Accreditation
                      </span>
                      <span className={transfer.kycCompleted ? 'text-[var(--app-success)]' : 'text-[var(--app-text-muted)]'}>
                        {transfer.kycCompleted ? '✓' : '○'} KYC
                      </span>
                      <span className={transfer.amlCleared ? 'text-[var(--app-success)]' : 'text-[var(--app-text-muted)]'}>
                        {transfer.amlCleared ? '✓' : '○'} AML
                      </span>
                      <span className={transfer.taxFormsReceived ? 'text-[var(--app-success)]' : 'text-[var(--app-text-muted)]'}>
                        {transfer.taxFormsReceived ? '✓' : '○'} Tax Forms
                      </span>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--app-text-muted)]" />
                      <span className="text-xs font-medium text-[var(--app-text-muted)]">
                        {transfer.documents.length} Documents
                      </span>
                    </div>
                    {onUploadDocument && (
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => onUploadDocument(transfer.id)}
                      >
                        Upload
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--app-border)]">
                    {onReviewTransfer && (
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => onReviewTransfer(transfer.id)}
                      >
                        Review
                      </Button>
                    )}
                    {transfer.status === 'pending-gp-approval' && onApproveTransfer && (
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => onApproveTransfer(transfer.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {transfer.status === 'approved' && onCompleteTransfer && (
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => onCompleteTransfer(transfer.id)}
                      >
                        Complete Transfer
                      </Button>
                    )}
                    {transfer.subjectToROFR && transfer.status === 'pending-gp-approval' && onExerciseROFR && (
                      <Button
                        size="sm"
                        variant="flat"
                        className="text-[var(--app-warning)]"
                        onPress={() => onExerciseROFR(transfer.id)}
                      >
                        Exercise ROFR
                      </Button>
                    )}
                    {transfer.rejectionReason && (
                      <div className="flex-1 text-xs text-[var(--app-danger)]">
                        Rejected: {transfer.rejectionReason}
                      </div>
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
