'use client'

import { useEffect } from 'react';
import { Card, Button, Badge, Progress, PageContainer, Breadcrumb, PageHeader, Tabs, Tab } from '@/ui';
import { Receipt, Download, Send, Calendar, DollarSign, Building2, Users, CheckCircle, Clock, AlertTriangle, Mail, Upload, FileText , Scale} from 'lucide-react';
import { getRouteConfig } from '@/config/routes';
import { K1Generator } from '../tax/k1-generator';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { taxCenterRequested } from '@/store/slices/backOfficeSlice';

export function TaxCenter() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.backOffice.taxCenter);

  // Load tax center data on mount
  useEffect(() => {
    dispatch(taxCenterRequested());
  }, [dispatch]);

  const { value: ui, patch: patchUI } = useUIKey('back-office-tax-center', { selectedTab: 'overview' });
  const { selectedTab } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/tax-center');

  const taxDocuments = data?.taxDocuments || [];
  const taxSummaries = data?.taxSummaries || [];
  const portfolioTax = data?.portfolioTax || [];
  const filingDeadline = data?.filingDeadline || new Date();

  // Calculate AI insights
  const k1sIssued = taxSummaries.reduce((sum, s) => sum + s.k1sIssued, 0);
  const k1sTotal = taxSummaries.reduce((sum, s) => sum + s.k1sTotal, 0);
  const form1099Issued = taxSummaries.reduce((sum, s) => sum + s.form1099Issued, 0);
  const readyDocuments = taxDocuments.filter(d => d.status === 'ready').length;

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
      case 'sent':
      case 'filed':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'ready':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'draft':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      default:
        return 'bg-[var(--app-surface)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'filed':
        return <CheckCircle className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

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
        title="Tax Center"
        description="Manage tax documents, K-1s, and reporting for LPs and portfolio companies"
        icon={Receipt}
        aiSummary={{
          text: `${k1sIssued} K-1s issued out of ${k1sTotal}. ${form1099Issued} 1099s issued. ${readyDocuments} documents ready to send. Filing deadline: ${filingDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. AI recommends prioritizing the ${readyDocuments} ready documents for immediate distribution.`,
          confidence: 0.92
        }}
        primaryAction={{
          label: 'Generate K-1s',
          onClick: () => console.log('Generate K-1s'),
          aiSuggested: readyDocuments > 0
        }}
        secondaryActions={[
          {
            label: 'Upload Documents',
            onClick: () => console.log('Upload documents')
          }
        ]}
        tabs={[
          {
            id: 'overview',
            label: 'Tax Documents',
            count: taxDocuments.length
          },
          {
            id: 'k1-generator',
            label: 'K-1 Generator'
          },
          {
            id: 'fund-summary',
            label: 'Fund Summary',
            count: taxSummaries.length
          },
          {
            id: 'portfolio',
            label: 'Portfolio Companies',
            count: portfolioTax.filter(c => c.k1Required && !c.k1Received).length,
            priority: portfolioTax.filter(c => c.k1Required && !c.k1Received).length > 0 ? 'high' : undefined
          },
          {
            id: 'communications',
            label: 'LP Communications'
          }
        ]}
        activeTab={selectedTab}
        onTabChange={(tabId) => patchUI({ selectedTab: tabId })}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
              <FileText className="w-6 h-6 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">K-1s Issued</p>
              <p className="text-2xl font-bold">
                {taxSummaries.reduce((sum, s) => sum + s.k1sIssued, 0)}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                of {taxSummaries.reduce((sum, s) => sum + s.k1sTotal, 0)} total
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
              <FileText className="w-6 h-6 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">1099s Issued</p>
              <p className="text-2xl font-bold">
                {taxSummaries.reduce((sum, s) => sum + s.form1099Issued, 0)}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                of {taxSummaries.reduce((sum, s) => sum + s.form1099Total, 0)} total
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
              <DollarSign className="w-6 h-6 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Est. Taxes Paid</p>
              <p className="text-2xl font-bold">
                {formatCurrency(taxSummaries.reduce((sum, s) => sum + s.estimatedTaxesPaid, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
              <Calendar className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Filing Deadline</p>
              <p className="text-lg font-bold">{filingDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {Math.ceil((filingDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Overview Tab - Tax Documents */}
      {selectedTab === 'overview' && (
          <div className="mt-4 space-y-3">
            {taxDocuments.map((doc) => (
              <Card key={doc.id} padding="lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--app-surface-hover)]">
                      <FileText className="w-6 h-6 text-[var(--app-primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.documentType}</h3>
                        <Badge size="sm" className={getStatusColor(doc.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            <span className="capitalize">{doc.status}</span>
                          </div>
                        </Badge>
                        <Badge size="sm" className="bg-[var(--app-surface-hover)]">
                          Tax Year {doc.taxYear}
                        </Badge>
                      </div>

                      <p className="text-sm text-[var(--app-text-muted)] mb-2">
                        {doc.recipientType}: {doc.recipientName}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-[var(--app-text-subtle)]">
                        {doc.amount && (
                          <>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatCurrency(doc.amount)}</span>
                            </div>
                            <span>•</span>
                          </>
                        )}
                        {doc.generatedDate && (
                          <>
                            <span>Generated: {new Date(doc.generatedDate).toLocaleDateString()}</span>
                            <span>•</span>
                          </>
                        )}
                        {doc.sentDate && (
                          <span>Sent: {new Date(doc.sentDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="bordered"
                        startContent={<FileText className="w-4 h-4" />}
                      >
                        Generate
                      </Button>
                    )}
                    {doc.status === 'ready' && (
                      <Button
                        size="sm"
                        className="bg-[var(--app-primary)] text-white"
                        startContent={<Send className="w-4 h-4" />}
                      >
                        Send
                      </Button>
                    )}
                    {doc.status === 'sent' && (
                      <>
                        <Button
                          size="sm"
                          variant="bordered"
                          startContent={<Mail className="w-4 h-4" />}
                        >
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Download className="w-4 h-4" />}
                        >
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
      )}

      {/* K-1 Generator Tab */}
      {selectedTab === 'k1-generator' && (
        <div className="mt-4">
          <K1Generator
            configurations={[]}
            documents={[]}
            onConfigureK1={(fundId) => console.log('Configure K1:', fundId)}
            onGenerateK1s={(fundId, taxYear) => console.log('Generate K1s:', fundId, taxYear)}
            onPreviewK1={(documentId) => console.log('Preview K1:', documentId)}
            onApproveK1={(documentId) => console.log('Approve K1:', documentId)}
            onSendK1={(documentId) => console.log('Send K1:', documentId)}
            onAmendK1={(documentId) => console.log('Amend K1:', documentId)}
            onExportAll={(fundId, taxYear, format) => console.log('Export all:', fundId, taxYear, format)}
          />
        </div>
      )}

      {/* Fund Summary Tab */}
      {selectedTab === 'fund-summary' && (
          <div className="mt-4 space-y-3">
            {taxSummaries.map((summary) => {
              const k1Progress = (summary.k1sIssued / summary.k1sTotal) * 100;
              const form1099Progress = (summary.form1099Issued / summary.form1099Total) * 100;

              return (
                <Card key={summary.id} padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{summary.fundName}</h3>
                        <p className="text-sm text-[var(--app-text-muted)]">Tax Year {summary.taxYear}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--app-text-muted)]">Filing Deadline</p>
                        <p className="font-semibold">{new Date(summary.filingDeadline).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Distributions</p>
                        <p className="text-lg font-bold text-[var(--app-success)]">
                          {formatCurrency(summary.totalDistributions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Estimated Taxes Paid</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(summary.estimatedTaxesPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Effective Tax Rate</p>
                        <p className="text-lg font-bold">
                          {((summary.estimatedTaxesPaid / summary.totalDistributions) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-[var(--app-text-muted)]">Schedule K-1s</span>
                          <span className="font-semibold">
                            {summary.k1sIssued} of {summary.k1sTotal} ({k1Progress.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={k1Progress} maxValue={100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-[var(--app-text-muted)]">Form 1099s</span>
                          <span className="font-semibold">
                            {summary.form1099Issued} of {summary.form1099Total} ({form1099Progress.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={form1099Progress} maxValue={100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
      )}

      {/* Portfolio Companies Tab */}
      {selectedTab === 'portfolio' && (
          <div className="mt-4">
            <Card padding="lg">
              <h3 className="font-semibold mb-4">K-1 Collection Status</h3>
              <div className="space-y-3">
                {portfolioTax.map((company) => (
                  <div key={company.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{company.companyName}</h4>
                          {company.k1Required && (
                            <Badge size="sm" className={company.k1Received ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]' : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'}>
                              <div className="flex items-center gap-1">
                                {company.k1Received ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                <span>{company.k1Received ? 'K-1 Received' : 'K-1 Pending'}</span>
                              </div>
                            </Badge>
                          )}
                          {!company.k1Required && (
                            <Badge size="sm" className="bg-[var(--app-surface)]">
                              No K-1 Required
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--app-text-muted)]">Ownership</p>
                            <p className="font-medium">{company.ownership}%</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Tax Classification</p>
                            <p className="font-medium">{company.taxClassification}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Contact</p>
                            <p className="font-medium text-xs">{company.contactEmail}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">K-1 Received</p>
                            <p className="font-medium">
                              {company.k1ReceivedDate ? new Date(company.k1ReceivedDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {company.k1Required && !company.k1Received && (
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Mail className="w-4 h-4" />}
                        >
                          Request K-1
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
      )}

      {/* LP Communications Tab */}
      {selectedTab === 'communications' && (
          <div className="mt-4">
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Tax Document Distribution</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[var(--app-info-bg)] border border-[var(--app-info)]/20">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[var(--app-info)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--app-info)] mb-2">
                        Ready to Send Tax Documents
                      </p>
                      <p className="text-xs text-[var(--app-text-muted)] mb-3">
                        8 K-1s are ready to be sent to Limited Partners. Documents will be securely delivered
                        via email with access to a password-protected portal.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[var(--app-primary)] text-white"
                          startContent={<Send className="w-4 h-4" />}
                        >
                          Send All K-1s
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          startContent={<FileText className="w-4 h-4" />}
                        >
                          Preview Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <h4 className="font-semibold mb-3">Email Templates</h4>
                    <div className="space-y-2">
                      <Button variant="bordered" className="w-full justify-start" size="sm">
                        K-1 Distribution Notice
                      </Button>
                      <Button variant="bordered" className="w-full justify-start" size="sm">
                        1099 Distribution Notice
                      </Button>
                      <Button variant="bordered" className="w-full justify-start" size="sm">
                        Estimated Tax Payment Reminder
                      </Button>
                      <Button variant="bordered" className="w-full justify-start" size="sm">
                        Tax Document Follow-up
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <h4 className="font-semibold mb-3">Distribution History</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--app-text-muted)]">2024 K-1s Sent</span>
                        <span className="font-semibold">Dec 5, 2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--app-text-muted)]">2024 Q4 Estimates</span>
                        <span className="font-semibold">Jan 10, 2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--app-text-muted)]">2023 K-1s Sent</span>
                        <span className="font-semibold">Mar 1, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
      )}

      {/* Info Card */}
      <Card padding="md" className="bg-[var(--app-warning-bg)] border-[var(--app-warning)]/20">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[var(--app-warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--app-warning)] mb-1">Important Tax Deadlines</p>
            <p className="text-xs text-[var(--app-text-muted)]">
              • January 31: Form 1099 distribution deadline
              • March 15: Partnership K-1 distribution deadline (with extension to September 15)
              • Quarterly estimated tax payments due April 15, June 15, September 15, and January 15
            </p>
          </div>
        </div>
      </Card>
      </div>
    </PageContainer>
  );
}
