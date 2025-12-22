'use client'

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge, Progress } from '@/ui';
import { TrendingUp, DollarSign, Download, Eye, Send, FileText, BarChart3, Users, ArrowUpRight, ArrowDownRight, UserCheck, Mail } from 'lucide-react';
import { LPInvestorPortal } from './lp-investor-portal';
import { AdvancedTable, ColumnDef } from '@/components/data-table/advanced-table';
import { BulkActionsToolbar, useBulkSelection, BulkAction } from '@/components/bulk-actions-toolbar';
import {
  type LP,
  getLPCapitalCalls,
  getLPDistributions,
  getLPReports,
  getLPs,
} from '@/services/lpPortal/lpManagementService';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import { PageScaffold, SearchToolbar, StatusBadge } from '@/components/ui';

export function LPManagement() {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedTab: string;
    selectedLP: LP | null;
  }>('lp-management', {
    selectedTab: 'overview',
    selectedLP: null,
  });
  const { selectedTab } = ui;

  const lps = getLPs();
  const reports = getLPReports();
  const capitalCalls = getLPCapitalCalls();
  const distributions = getLPDistributions();

  // Bulk selection for LPs
  const {
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  } = useBulkSelection(lps, 'lp-management:lps');

  // Calculate LP metrics for AI summary
  const totalLPs = lps.length;
  const totalCommitments = lps.reduce((sum, lp) => sum + lp.commitmentAmount, 0);
  const averageIRR = (lps.reduce((sum, lp) => sum + lp.irr, 0) / lps.length).toFixed(1);
  const pendingCapitalCalls = capitalCalls.filter(c => c.status === 'pending').length;
  const publishedReports = reports.filter(r => r.status === 'published').length;

  // LP Type badge colors
  const getLPTypeBadge = (type: LP['type']) => {
    switch (type) {
      case 'institution': return 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]';
      case 'family-office': return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'individual': return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'corporate': return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      default: return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  // Bulk actions for LPs
  const bulkActions: BulkAction[] = [
    {
      id: 'send-report',
      label: 'Send Report',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => console.log('Send report to selected LPs'),
    },
    {
      id: 'send-capital-call',
      label: 'Send Capital Call',
      icon: <Send className="w-4 h-4" />,
      onClick: () => console.log('Send capital call to selected LPs'),
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log('Export selected LPs'),
    },
  ];

  // LP Table columns with checkbox
  const lpColumns: ColumnDef<LP>[] = [
    {
      key: 'select',
      label: '',
      width: '40px',
      render: (lp) => (
        <input
          type="checkbox"
          checked={isSelected(lp.id)}
          onChange={() => toggleSelection(lp.id)}
          className="rounded border-[var(--app-border)]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'name',
      label: 'LP Name',
      sortable: true,
      render: (lp) => (
        <div>
          <p className="font-medium">{lp.name}</p>
          <p className="text-xs text-[var(--app-text-muted)]">{lp.contactPerson}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (lp) => (
        <Badge size="sm" className={getLPTypeBadge(lp.type)}>
          {lp.type.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      key: 'commitmentAmount',
      label: 'Commitment',
      sortable: true,
      align: 'right',
      render: (lp) => <span className="font-medium">{formatCurrency(lp.commitmentAmount)}</span>,
    },
    {
      key: 'calledCapital',
      label: 'Called',
      sortable: true,
      align: 'right',
      render: (lp) => formatCurrency(lp.calledCapital),
    },
    {
      key: 'distributedCapital',
      label: 'Distributed',
      sortable: true,
      align: 'right',
      render: (lp) => formatCurrency(lp.distributedCapital),
    },
    {
      key: 'tvpi',
      label: 'TVPI',
      sortable: true,
      align: 'right',
      render: (lp) => <span className="font-semibold">{lp.tvpi.toFixed(2)}x</span>,
    },
    {
      key: 'irr',
      label: 'IRR',
      sortable: true,
      align: 'right',
      render: (lp) => (
        <span className={lp.irr > 20 ? 'text-[var(--app-success)] font-semibold' : 'font-semibold'}>
          {formatPercent(lp.irr)}
        </span>
      ),
    },
  ];

  const lpTableStateKey = 'lp-management:overview';
  const lpTableVisibleColumns = lpColumns.filter((col) => !col.hidden).map((col) => col.key);
  const { value: lpTableUI, patch: patchLPTableUI } = useUIKey<{
    searchQuery: string;
    sortKey: string | null;
    sortDirection: 'asc' | 'desc' | null;
    currentPage: number;
    pageSize: number;
    visibleColumns: string[];
  }>(`advanced-table:${lpTableStateKey}`, {
    searchQuery: '',
    sortKey: null,
    sortDirection: null,
    currentPage: 1,
    pageSize: 10,
    visibleColumns: lpTableVisibleColumns,
  });

  return (
    <PageScaffold
      routePath="/lp-management"
      header={{
        title: 'LP Management',
        description: 'Manage Limited Partners, generate reports, and track capital activities',
        icon: UserCheck,
        aiSummary: {
          text: `${totalLPs} Limited Partners with ${formatCurrency(totalCommitments)} in commitments. Average IRR: ${averageIRR}%. ${pendingCapitalCalls} pending capital call(s), ${publishedReports} published report(s).`,
          confidence: 0.88,
        },
        primaryAction: {
          label: 'Generate Report',
          onClick: () => console.log('Generate report clicked'),
          aiSuggested: true,
          confidence: 0.82,
        },
        secondaryActions: [
          {
            label: 'Send Update',
            onClick: () => console.log('Send update clicked'),
          },
        ],
        tabs: [
          {
            id: 'overview',
            label: 'LP Overview',
            count: totalLPs,
          },
          {
            id: 'reports',
            label: 'Reports',
            count: publishedReports,
          },
          {
            id: 'capital',
            label: 'Capital Activity',
            count: pendingCapitalCalls,
            priority: pendingCapitalCalls > 0 ? 'high' : undefined,
          },
          {
            id: 'performance',
            label: 'Performance',
          },
        ],
        activeTab: selectedTab,
        onTabChange: (tabId) => patchUI({ selectedTab: tabId }),
      }}
    >

      {/* Fund Overview Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-primary-bg)]">
              <Users className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lps.length}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Limited Partners</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-warning-bg)]">
              <DollarSign className="w-5 h-5 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(lps.reduce((sum, lp) => sum + lp.commitmentAmount, 0))}</p>
              <p className="text-xs text-[var(--app-text-muted)]">Total Commitments</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-success-bg)]">
              <TrendingUp className="w-5 h-5 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatPercent(lps.reduce((sum, lp) => sum + lp.irr, 0) / lps.length)}
              </p>
              <p className="text-xs text-[var(--app-text-muted)]">Average IRR</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-info-bg)]">
              <BarChart3 className="w-5 h-5 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(lps.reduce((sum, lp) => sum + lp.tvpi, 0) / lps.length).toFixed(2)}x
              </p>
              <p className="text-xs text-[var(--app-text-muted)]">Average TVPI</p>
            </div>
          </div>
        </Card>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold">LP Portal Preview</h3>
            <p className="text-sm text-[var(--app-text-muted)]">See the investor-facing experience your LPs will use.</p>
          </div>
          <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)] w-fit">
            Preview
          </Badge>
        </div>
        <LPInvestorPortal />
      </Card>

      {/* Tab Content */}
      <div className="mt-6">
        {/* LP Overview Tab - with AdvancedTable and Bulk Actions */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            <SearchToolbar
              searchValue={lpTableUI.searchQuery}
              onSearchChange={(value) => patchLPTableUI({ searchQuery: value, currentPage: 1 })}
              searchPlaceholder="Search LPs by name, contact, or email..."
            />

            <BulkActionsToolbar
              selectedCount={selectedCount}
              totalCount={lps.length}
              onClear={clearSelection}
              onSelectAll={selectAll}
              actions={bulkActions}
            />

            <AdvancedTable
              stateKey={lpTableStateKey}
              data={lps}
              columns={lpColumns}
              searchable={false}
              searchKeys={['name', 'contactPerson', 'email', 'type']}
              exportable={true}
              exportFilename="lp-management-data.csv"
              pageSize={10}
              showColumnToggle={true}
              onRowClick={(lp) => patchUI({ selectedLP: lp })}
            />
          </div>
        )}

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.map((report) => (
                <Card key={report.id} padding="lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--app-primary)]" />
                      <StatusBadge status={report.status} domain="fund-admin" size="sm" />
                    </div>
                    {report.status === 'published' && (
                      <span className="text-xs text-[var(--app-text-subtle)] flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {report.viewCount}
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold mb-2">{report.title}</h4>
                  <p className="text-sm text-[var(--app-text-muted)] mb-4">
                    Published: {new Date(report.publishedDate).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-2">
                    {report.status === 'published' ? (
                      <>
                        <Button size="sm" variant="flat" startContent={<Eye className="w-3 h-3" />}>
                          View
                        </Button>
                        <Button size="sm" variant="flat" startContent={<Download className="w-3 h-3" />}>
                          Download
                        </Button>
                        <Button size="sm" variant="flat" startContent={<Send className="w-3 h-3" />}>
                          Share
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="flat">
                        Edit Draft
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Capital Activity Tab */}
        {selectedTab === 'capital' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Capital Calls */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[var(--app-danger)]" />
                Capital Calls
              </h3>
              <div className="space-y-3">
                {capitalCalls.map((call) => (
                  <Card key={call.id} padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">Call #{call.callNumber}</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          Due: {new Date(call.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={call.status} domain="fund-admin" size="sm" />
                    </div>
                    <p className="text-2xl font-bold mb-2">{formatCurrency(call.amount)}</p>
                    <p className="text-sm text-[var(--app-text-muted)]">{call.purpose}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Distributions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-[var(--app-success)]" />
                Distributions
              </h3>
              <div className="space-y-3">
                {distributions.map((dist) => (
                  <Card key={dist.id} padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">Distribution #{dist.distributionNumber}</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          {new Date(dist.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={dist.status} domain="fund-admin" size="sm" />
                    </div>
                    <p className="text-2xl font-bold mb-2 text-[var(--app-success)]">
                      {formatCurrency(dist.amount)}
                    </p>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      {dist.type.replace(/-/g, ' ')}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {selectedTab === 'performance' && (
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4">Fund Performance Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-lg bg-[var(--app-success-bg)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-1">Total Value to Paid-In (TVPI)</p>
                  <p className="text-3xl font-bold text-[var(--app-success)]">
                    {(lps.reduce((sum, lp) => sum + lp.tvpi, 0) / lps.length).toFixed(2)}x
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Average across all LPs</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-info-bg)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-1">Distributions to Paid-In (DPI)</p>
                  <p className="text-3xl font-bold text-[var(--app-info)]">
                    {(lps.reduce((sum, lp) => sum + lp.dpi, 0) / lps.length).toFixed(2)}x
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Realized returns</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-primary-bg)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-1">Internal Rate of Return (IRR)</p>
                  <p className="text-3xl font-bold text-[var(--app-primary)]">
                    {formatPercent(lps.reduce((sum, lp) => sum + lp.irr, 0) / lps.length)}
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Net to LPs</p>
                </div>
              </div>

              <div className="border-t border-[var(--app-border)] pt-6">
                <h4 className="font-medium mb-4">Capital Deployment</h4>
                <div className="space-y-4">
                  {lps.map((lp) => (
                    <div key={lp.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{lp.name}</span>
                        <span className="text-sm text-[var(--app-text-muted)]">
                          {formatCurrency(lp.calledCapital)} / {formatCurrency(lp.commitmentAmount)}
                        </span>
                      </div>
                      <Progress
                        value={(lp.calledCapital / lp.commitmentAmount) * 100}
                        maxValue={100}
                        className="h-2"
                        aria-label={`${lp.name} capital deployment ${((lp.calledCapital / lp.commitmentAmount) * 100).toFixed(1)}%`}
                      />
                      <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                        {((lp.calledCapital / lp.commitmentAmount) * 100).toFixed(1)}% deployed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageScaffold>
  );
}
