'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge } from '@/ui';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Flag,
  Eye,
  Download,
} from 'lucide-react';
import { SearchToolbar, StatusBadge } from '@/components/ui';

export type EntityType = 'individual' | 'corporation' | 'partnership' | 'trust' | 'llc' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'severe';
export type WorkflowStatus =
  | 'not-started'
  | 'information-gathering'
  | 'document-collection'
  | 'verification-in-progress'
  | 'review-required'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface KYCWorkflow {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  status: WorkflowStatus;
  riskLevel: RiskLevel;

  // Workflow Steps
  steps: WorkflowStep[];
  currentStepId?: string;

  // Identity Verification
  identityVerification: IdentityVerification;

  // Document Collection
  documents: ComplianceDocument[];

  // Screening Results
  screeningResults: ScreeningResult[];

  // PEP & Sanctions
  isPEP: boolean; // Politically Exposed Person
  isSanctioned: boolean;
  sanctionDetails?: string;

  // Enhanced Due Diligence
  requiresEDD: boolean;
  eddCompleted: boolean;
  eddNotes?: string;

  // Risk Assessment
  riskFactors: RiskFactor[];
  overallRiskScore: number; // 0-100

  // Dates
  initiatedDate: Date;
  lastUpdated: Date;
  completedDate?: Date;
  expirationDate?: Date;
  nextReviewDate?: Date;

  // Approval
  reviewedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;

  // Metadata
  assignedTo: string;
  fundId?: string;
  fundName?: string;
  notes?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  completedDate?: Date;
  completedBy?: string;
  isRequired: boolean;
  automationStatus?: 'automated' | 'manual' | 'partially-automated';
}

export interface IdentityVerification {
  method: 'id-document' | 'biometric' | 'knowledge-based' | 'database' | 'manual';
  status: 'pending' | 'verified' | 'failed';
  verifiedDate?: Date;
  verificationProvider?: string; // e.g., "Jumio", "Onfido"
  confidenceScore?: number; // 0-100

  // Individual
  fullName?: string;
  dateOfBirth?: Date;
  ssn?: string; // Last 4 digits
  nationality?: string;
  idNumber?: string;
  idType?: 'passport' | 'drivers-license' | 'national-id';

  // Entity
  ein?: string;
  registrationNumber?: string;
  registrationCountry?: string;
  businessAddress?: string;

  // Beneficial Owners
  beneficialOwners?: BeneficialOwner[];
}

export interface BeneficialOwner {
  id: string;
  name: string;
  ownershipPercentage: number;
  isPEP: boolean;
  isSanctioned: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  dateOfBirth?: Date;
  nationality?: string;
}

export interface ComplianceDocument {
  id: string;
  type:
    | 'passport'
    | 'drivers-license'
    | 'utility-bill'
    | 'bank-statement'
    | 'articles-of-incorporation'
    | 'operating-agreement'
    | 'beneficial-ownership-form'
    | 'tax-id-document'
    | 'financial-statements'
    | 'other';
  name: string;
  status: 'required' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: Date;
  verifiedDate?: Date;
  expirationDate?: Date;
  rejectionReason?: string;
  url?: string;
}

export interface ScreeningResult {
  id: string;
  screeningType: 'sanctions' | 'pep' | 'adverse-media' | 'watchlist' | 'criminal-records';
  provider: string; // e.g., "Dow Jones", "LexisNexis", "ComplyAdvantage"
  screeningDate: Date;
  status: 'clear' | 'match' | 'potential-match' | 'error';
  matchCount: number;
  matches: ScreeningMatch[];
  autoReviewed: boolean;
}

export interface ScreeningMatch {
  id: string;
  matchScore: number; // 0-100
  matchType: 'exact' | 'fuzzy' | 'alias';
  entityName: string;
  category: string;
  details: string;
  source: string;
  reviewStatus: 'pending' | 'false-positive' | 'confirmed' | 'escalated';
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface RiskFactor {
  id: string;
  category: 'geographic' | 'occupation' | 'transaction' | 'political' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  score: number; // Impact on overall risk score
  mitigated: boolean;
  mitigationNotes?: string;
}

interface AMLKYCWorkflowProps {
  workflows: KYCWorkflow[];
  onInitiateWorkflow?: (entityId: string) => void;
  onUpdateStep?: (workflowId: string, stepId: string) => void;
  onUploadDocument?: (workflowId: string, documentType: string) => void;
  onRunScreening?: (workflowId: string, screeningType: string) => void;
  onReviewMatch?: (workflowId: string, matchId: string, decision: string) => void;
  onApproveWorkflow?: (workflowId: string) => void;
  onRejectWorkflow?: (workflowId: string, reason: string) => void;
  onRequestEDD?: (workflowId: string) => void;
  onExportReport?: (workflowId: string) => void;
}

export function AMLKYCWorkflow({
  workflows,
  onInitiateWorkflow,
  onUpdateStep: _onUpdateStep,
  onUploadDocument: _onUploadDocument,
  onRunScreening: _onRunScreening,
  onReviewMatch: _onReviewMatch,
  onApproveWorkflow,
  onRejectWorkflow: _onRejectWorkflow,
  onRequestEDD,
  onExportReport,
}: AMLKYCWorkflowProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    filterStatus: WorkflowStatus | 'all';
    filterRisk: RiskLevel | 'all';
    selectedWorkflow: KYCWorkflow | null;
  }>('aml-kyc-workflow', {
    searchQuery: '',
    filterStatus: 'all',
    filterRisk: 'all',
    selectedWorkflow: null,
  });
  const { searchQuery, filterStatus, filterRisk } = ui;

  const getRiskBadge = (level: RiskLevel) => {
    const colors = {
      'low': 'bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success',
      'medium': 'bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning',
      'high': 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger',
      'severe': 'bg-app-danger dark:bg-app-dark-danger text-white',
    };

    return (
      <Badge size="sm" variant="flat" className={colors[level]}>
        {level.toUpperCase()} Risk
      </Badge>
    );
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch =
      workflow.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || workflow.riskLevel === filterRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate stats
  const statusCounts = {
    total: workflows.length,
    pending: workflows.filter(w => w.status === 'review-required').length,
    approved: workflows.filter(w => w.status === 'approved').length,
    highRisk: workflows.filter(w => w.riskLevel === 'high' || w.riskLevel === 'severe').length,
    expiring: workflows.filter(w => {
      if (!w.expirationDate) return false;
      const daysUntilExpiry = Math.ceil((w.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
  };

  return (
    <div className="space-y-4">
      {/* Header & Stats */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
            <h3 className="text-lg font-semibold">AML/KYC Compliance</h3>
          </div>
          {onInitiateWorkflow && (
            <Button
              size="sm"
              color="primary"
              startContent={<Shield className="w-4 h-4" />}
              onPress={() => onInitiateWorkflow('')}
            >
              New Workflow
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-app-primary-bg dark:bg-app-dark-primary-bg">
            <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Total Workflows</p>
            <p className="text-2xl font-bold text-app-primary dark:text-app-dark-primary">{statusCounts.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-app-warning-bg dark:bg-app-dark-warning-bg">
            <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-app-warning dark:text-app-dark-warning">{statusCounts.pending}</p>
          </div>
          <div className="p-3 rounded-lg bg-app-success-bg dark:bg-app-dark-success-bg">
            <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Approved</p>
            <p className="text-2xl font-bold text-app-success dark:text-app-dark-success">{statusCounts.approved}</p>
          </div>
          <div className="p-3 rounded-lg bg-app-danger-bg dark:bg-app-dark-danger-bg">
            <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">High Risk</p>
            <p className="text-2xl font-bold text-app-danger dark:text-app-dark-danger">{statusCounts.highRisk}</p>
          </div>
          <div className="p-3 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover border border-app-border dark:border-app-dark-border">
            <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold">{statusCounts.expiring}</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="md">
        <SearchToolbar
          searchValue={searchQuery}
          onSearchChange={(value) => patchUI({ searchQuery: value })}
          searchPlaceholder="Search by entity name or ID..."
          rightActions={(
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 text-sm rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text"
                value={filterStatus}
                onChange={(e) => patchUI({ filterStatus: e.target.value as WorkflowStatus | 'all' })}
              >
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="information-gathering">Information Gathering</option>
                <option value="document-collection">Document Collection</option>
                <option value="verification-in-progress">Verification In Progress</option>
                <option value="review-required">Review Required</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              <select
                className="px-3 py-2 text-sm rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text"
                value={filterRisk}
                onChange={(e) => patchUI({ filterRisk: e.target.value as RiskLevel | 'all' })}
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="severe">Severe Risk</option>
              </select>
            </div>
          )}
        />
      </Card>

      {/* Workflows List */}
      <Card padding="md">
        <div className="space-y-3">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 text-sm text-app-text-muted dark:text-app-dark-text-muted">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No workflows found</p>
            </div>
          ) : (
            filteredWorkflows.map(workflow => {
              const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
              const totalSteps = workflow.steps.length;
              const progress = (completedSteps / totalSteps) * 100;
              const pendingMatches = workflow.screeningResults.reduce(
                (sum, result) => sum + result.matches.filter(m => m.reviewStatus === 'pending').length,
                0
              );

              return (
                <div
                  key={workflow.id}
                  className="p-4 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover hover:bg-app-surface dark:hover:bg-app-dark-surface border border-app-border dark:border-app-dark-border transition-colors cursor-pointer"
                  onClick={() => patchUI({ selectedWorkflow: workflow })}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {workflow.entityType === 'individual' ? (
                          <User className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
                        ) : (
                          <Building className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
                        )}
                        <span className="font-medium">{workflow.entityName}</span>
                        <StatusBadge status={workflow.status} domain="aml-kyc" size="sm" showIcon />
                        {getRiskBadge(workflow.riskLevel)}
                        {workflow.isPEP && (
                          <Badge size="sm" variant="flat" className="bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning">
                            <Flag className="w-3 h-3 mr-1" />
                            PEP
                          </Badge>
                        )}
                        {workflow.isSanctioned && (
                          <Badge size="sm" variant="flat" className="bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Sanctioned
                          </Badge>
                        )}
                        {workflow.requiresEDD && !workflow.eddCompleted && (
                          <Badge size="sm" variant="flat" className="bg-app-info-bg dark:bg-app-dark-info-bg text-app-info dark:text-app-dark-info">
                            EDD Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-app-text-muted dark:text-app-dark-text-muted">
                        <span>Assigned to: {workflow.assignedTo}</span>
                        <span>•</span>
                        <span>Initiated {workflow.initiatedDate.toLocaleDateString()}</span>
                        {workflow.fundName && (
                          <>
                            <span>•</span>
                            <span>{workflow.fundName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium mb-1">Risk Score: {workflow.overallRiskScore}/100</p>
                      {workflow.nextReviewDate && (
                        <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                          Next review: {workflow.nextReviewDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted">
                        Workflow Progress
                      </span>
                      <span className="text-xs font-medium">
                        {completedSteps}/{totalSteps} Steps
                      </span>
                    </div>
                    <div className="h-2 bg-app-surface dark:bg-app-dark-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-app-success dark:bg-app-dark-success transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Identity Verification */}
                  <div className="grid grid-cols-3 gap-3 mb-3 p-3 rounded-lg bg-app-surface dark:bg-app-dark-surface">
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Identity</p>
                      <Badge
                        size="sm"
                        variant="flat"
                        className={
                          workflow.identityVerification.status === 'verified'
                            ? 'bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success'
                            : workflow.identityVerification.status === 'failed'
                            ? 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger'
                            : 'bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning'
                        }
                      >
                        {workflow.identityVerification.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Documents</p>
                      <p className="text-sm font-medium">
                        {workflow.documents.filter(d => d.status === 'verified').length}/{workflow.documents.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-1">Screening</p>
                      {pendingMatches > 0 ? (
                        <Badge size="sm" variant="flat" className="bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning">
                          {pendingMatches} Pending
                        </Badge>
                      ) : (
                        <Badge size="sm" variant="flat" className="bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success">
                          Clear
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {workflow.riskFactors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-2">
                        Risk Factors ({workflow.riskFactors.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.riskFactors.slice(0, 3).map(factor => (
                          <Badge
                            key={factor.id}
                            size="sm"
                            variant="flat"
                            className={
                              factor.severity === 'high'
                                ? 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger'
                                : factor.severity === 'medium'
                                ? 'bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning'
                                : 'bg-app-info-bg dark:bg-app-dark-info-bg text-app-info dark:text-app-dark-info'
                            }
                          >
                            {factor.description}
                          </Badge>
                        ))}
                        {workflow.riskFactors.length > 3 && (
                          <Badge size="sm" variant="flat" className="bg-app-text-muted/10 dark:bg-app-dark-text-muted/10">
                            +{workflow.riskFactors.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-app-border dark:border-app-dark-border">
                    {onExportReport && (
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Download className="w-3 h-3" />}
                        onPress={() => onExportReport(workflow.id)}
                      >
                        Export
                      </Button>
                    )}
                    {workflow.status === 'review-required' && onApproveWorkflow && (
                      <Button
                        size="sm"
                        color="primary"
                        startContent={<CheckCircle className="w-3 h-3" />}
                        onPress={() => onApproveWorkflow(workflow.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {workflow.requiresEDD && !workflow.eddCompleted && onRequestEDD && (
                      <Button
                        size="sm"
                        variant="flat"
                        className="text-app-warning dark:text-app-dark-warning"
                        onPress={() => onRequestEDD(workflow.id)}
                      >
                        Request EDD
                      </Button>
                    )}
                    {pendingMatches > 0 && (
                      <Badge size="sm" variant="flat" className="bg-app-warning-bg dark:bg-app-dark-warning-bg text-app-warning dark:text-app-dark-warning">
                        <Eye className="w-3 h-3 mr-1" />
                        {pendingMatches} Matches to Review
                      </Badge>
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
