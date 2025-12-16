'use client'

import { Card, Button, Badge, Breadcrumb, PageHeader, PageContainer } from '@/ui';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Download, Calendar, Users, Building2, Scale, Bell } from 'lucide-react';
import { getRouteConfig } from '@/config/routes';
import { AMLKYCWorkflow } from '../compliance/aml-kyc-workflow';
import { useUIKey } from '@/store/ui';
import { getAuditSchedule, getComplianceItems, getRegulatoryFilings } from '@/services/backOffice/complianceService';

export function Compliance() {
  const { value: ui, patch: patchUI } = useUIKey('back-office-compliance', { selectedTab: 'overview' });
  const { selectedTab } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/compliance');

  const complianceItems = getComplianceItems();
  const regulatoryFilings = getRegulatoryFilings();
  const auditSchedule = getAuditSchedule();

  // Calculate AI insights
  const overdueItems = complianceItems.filter(item => item.status === 'overdue').length;
  const inProgressItems = complianceItems.filter(item => item.status === 'in-progress').length;
  const upcomingHighPriority = complianceItems.filter(
    item => item.status === 'upcoming' && item.priority === 'high'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'current':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'in-progress':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'upcoming':
      case 'due-soon':
      case 'scheduled':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface)]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-[var(--app-danger)]';
      case 'medium':
        return 'text-[var(--app-warning)]';
      case 'low':
        return 'text-[var(--app-info)]';
      default:
        return 'text-[var(--app-text-muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'current':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
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

        {/* Page Header with AI Summary and Tab Navigation */}
        <PageHeader
          title="Compliance & Regulatory"
          description="Track regulatory filings, audits, and compliance requirements"
          icon={Shield}
          aiSummary={{
            text: `${overdueItems} overdue items require immediate attention. ${inProgressItems} items in progress. ${upcomingHighPriority} high-priority deadlines approaching. AI recommends prioritizing Form ADV and annual certification.`,
            confidence: 0.94
          }}
          primaryAction={{
            label: 'Upload Document',
            onClick: () => console.log('Upload document'),
            aiSuggested: false
          }}
          secondaryActions={[
            {
              label: 'Export Report',
              onClick: () => console.log('Export report')
            }
          ]}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              count: overdueItems,
              priority: overdueItems > 0 ? 'high' : undefined
            },
            {
              id: 'filings',
              label: 'Regulatory Filings'
            },
            {
              id: 'audits',
              label: 'Audit Schedule',
              count: auditSchedule.filter(a => a.status === 'in-progress').length
            },
            {
              id: 'aml-kyc',
              label: 'AML/KYC'
            },
            {
              id: 'resources',
              label: 'Resources'
            }
          ]}
          activeTab={selectedTab}
          onTabChange={(tabId) => patchUI({ selectedTab: tabId })}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[var(--app-danger-bg)]">
                <AlertTriangle className="w-6 h-6 text-[var(--app-danger)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--app-text-muted)]">Overdue Items</p>
                <p className="text-2xl font-bold text-[var(--app-danger)]">
                  {complianceItems.filter(i => i.status === 'overdue').length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
                <Clock className="w-6 h-6 text-[var(--app-warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--app-text-muted)]">In Progress</p>
                <p className="text-2xl font-bold">
                  {complianceItems.filter(i => i.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
                <Calendar className="w-6 h-6 text-[var(--app-info)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--app-text-muted)]">Due This Month</p>
                <p className="text-2xl font-bold">
                  {complianceItems.filter(i => {
                    const dueDate = new Date(i.dueDate);
                    const today = new Date();
                    return dueDate.getMonth() === today.getMonth() &&
                           dueDate.getFullYear() === today.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
                <CheckCircle className="w-6 h-6 text-[var(--app-success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--app-text-muted)]">Completed</p>
                <p className="text-2xl font-bold">
                  {complianceItems.filter(i => i.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-3">
            {complianceItems
              .sort((a, b) => {
                // Sort by priority and status
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const statusOrder = { overdue: 0, 'in-progress': 1, upcoming: 2, completed: 3 };
                return (
                  statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder] ||
                  priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
                );
              })
              .map((item) => (
                <Card key={item.id} padding="lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        item.status === 'overdue' ? 'bg-[var(--app-danger-bg)]' :
                        item.status === 'in-progress' ? 'bg-[var(--app-warning-bg)]' :
                        item.status === 'completed' ? 'bg-[var(--app-success-bg)]' :
                        'bg-[var(--app-info-bg)]'
                      }`}>
                        {item.type === 'filing' && <FileText className={`w-6 h-6 ${
                          item.status === 'overdue' ? 'text-[var(--app-danger)]' :
                          item.status === 'in-progress' ? 'text-[var(--app-warning)]' :
                          item.status === 'completed' ? 'text-[var(--app-success)]' :
                          'text-[var(--app-info)]'
                        }`} />}
                        {item.type === 'report' && <FileText className={`w-6 h-6 ${
                          item.status === 'overdue' ? 'text-[var(--app-danger)]' :
                          item.status === 'in-progress' ? 'text-[var(--app-warning)]' :
                          item.status === 'completed' ? 'text-[var(--app-success)]' :
                          'text-[var(--app-info)]'
                        }`} />}
                        {item.type === 'certification' && <Shield className={`w-6 h-6 ${
                          item.status === 'overdue' ? 'text-[var(--app-danger)]' :
                          item.status === 'in-progress' ? 'text-[var(--app-warning)]' :
                          item.status === 'completed' ? 'text-[var(--app-success)]' :
                          'text-[var(--app-info)]'
                        }`} />}
                        {item.type === 'audit' && <Scale className={`w-6 h-6 ${
                          item.status === 'overdue' ? 'text-[var(--app-danger)]' :
                          item.status === 'in-progress' ? 'text-[var(--app-warning)]' :
                          item.status === 'completed' ? 'text-[var(--app-success)]' :
                          'text-[var(--app-info)]'
                        }`} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge size="sm" className={getStatusColor(item.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              <span className="capitalize">{item.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                          <Badge size="sm" className={`${getPriorityColor(item.priority)} bg-opacity-10`}>
                            {item.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-sm text-[var(--app-text-muted)] mb-3">{item.description}</p>

                        <div className="flex items-center gap-4 text-sm text-[var(--app-text-subtle)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{item.assignedTo}</span>
                          </div>
                          {item.relatedFund && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{item.relatedFund}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="flat" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Regulatory Filings Tab */}
        {selectedTab === 'filings' && (
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Required Filings</h3>
              <div className="space-y-3">
                {regulatoryFilings.map((filing) => (
                  <div key={filing.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{filing.filingType}</h4>
                          <Badge size="sm" className={getStatusColor(filing.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(filing.status)}
                              <span className="capitalize">{filing.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--app-text-muted)]">Regulator</p>
                            <p className="font-medium">{filing.regulator}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Frequency</p>
                            <p className="font-medium">{filing.frequency}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Last Filed</p>
                            <p className="font-medium">{new Date(filing.lastFiled).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Next Due</p>
                            <p className="font-medium">{filing.nextDue !== 'N/A' ? new Date(filing.nextDue).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[var(--app-text-muted)]">Fund</p>
                            <p className="font-medium">{filing.fundName}</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="flat" size="sm" startContent={<Download className="w-4 h-4" />}>
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Audit Schedule Tab */}
        {selectedTab === 'audits' && (
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Audit Schedule</h3>
              <div className="space-y-3">
                {auditSchedule.map((audit) => (
                  <div key={audit.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{audit.auditType} - {audit.year}</h4>
                          <Badge size="sm" className={getStatusColor(audit.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(audit.status)}
                              <span className="capitalize">{audit.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--app-text-muted)]">
                          Auditor: {audit.auditor} • Fund: {audit.fundName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--app-text-muted)]">Start Date</p>
                        <p className="font-medium">{new Date(audit.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[var(--app-text-muted)]">Completion Date</p>
                        <p className="font-medium">
                          {audit.completionDate ? new Date(audit.completionDate).toLocaleDateString() : 'In Progress'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--app-text-muted)]">Duration</p>
                        <p className="font-medium">
                          {audit.completionDate
                            ? `${Math.ceil((new Date(audit.completionDate).getTime() - new Date(audit.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : 'Ongoing'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* AML/KYC Tab */}
        {selectedTab === 'aml-kyc' && (
          <div>
            <AMLKYCWorkflow
              workflows={[]}
              onInitiateWorkflow={(entityId) => console.log('Initiate workflow:', entityId)}
              onUpdateStep={(workflowId, stepId) => console.log('Update step:', workflowId, stepId)}
              onUploadDocument={(workflowId, documentType) => console.log('Upload document:', workflowId, documentType)}
              onRunScreening={(workflowId, screeningType) => console.log('Run screening:', workflowId, screeningType)}
              onReviewMatch={(workflowId, matchId, decision) => console.log('Review match:', workflowId, matchId, decision)}
              onApproveWorkflow={(workflowId) => console.log('Approve workflow:', workflowId)}
              onRejectWorkflow={(workflowId, reason) => console.log('Reject workflow:', workflowId, reason)}
              onRequestEDD={(workflowId) => console.log('Request EDD:', workflowId)}
              onExportReport={(workflowId) => console.log('Export report:', workflowId)}
            />
          </div>
        )}

        {/* Resources Tab */}
        {selectedTab === 'resources' && (
          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Compliance Documents</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  Code of Ethics
                </Button>
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  Compliance Manual
                </Button>
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  Privacy Policy
                </Button>
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  AML/KYC Procedures
                </Button>
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  Cybersecurity Policy
                </Button>
                <Button variant="bordered" className="justify-start" startContent={<FileText className="w-4 h-4" />}>
                  Business Continuity Plan
                </Button>
              </div>
            </Card>

            <Card padding="md" className="bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[var(--app-info)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--app-info)] mb-1">Compliance Reminders</p>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Stay up-to-date with regulatory requirements. Set up automated reminders for recurring
                    filings and certifications. Contact the compliance team for any questions or concerns.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
