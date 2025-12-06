'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress, PageContainer, Breadcrumb, PageHeader } from '@/ui';
import { TrendingUp, DollarSign, Building2, Download, Eye, Lock, Unlock, Send, FileText, PieChart, BarChart3, Calendar, Users, ArrowUpRight, ArrowDownRight, Activity, UserCheck } from 'lucide-react';
import { getRouteConfig } from '@/config/routes';

interface LP {
  id: string;
  name: string;
  type: 'institution' | 'family-office' | 'individual' | 'corporate';
  commitmentAmount: number;
  calledCapital: number;
  distributedCapital: number;
  navValue: number;
  dpi: number;
  tvpi: number;
  irr: number;
  joinDate: string;
  contactPerson: string;
  email: string;
}

interface Report {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'monthly' | 'special';
  quarter?: string;
  year: number;
  publishedDate: string;
  status: 'published' | 'draft' | 'scheduled';
  downloadUrl?: string;
  viewCount: number;
}

interface CapitalCall {
  id: string;
  callNumber: number;
  amount: number;
  dueDate: string;
  purpose: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface Distribution {
  id: string;
  distributionNumber: number;
  amount: number;
  paymentDate: string;
  type: 'realized-gains' | 'dividends' | 'return-of-capital';
  status: 'paid' | 'pending' | 'processing';
}

const mockLPs: LP[] = [
  {
    id: '1',
    name: 'University Endowment Fund',
    type: 'institution',
    commitmentAmount: 50000000,
    calledCapital: 30000000,
    distributedCapital: 12000000,
    navValue: 42000000,
    dpi: 0.4,
    tvpi: 1.8,
    irr: 24.5,
    joinDate: '2021-03-15',
    contactPerson: 'Dr. James Wilson',
    email: 'jwilson@university-endowment.edu'
  },
  {
    id: '2',
    name: 'Smith Family Office',
    type: 'family-office',
    commitmentAmount: 25000000,
    calledCapital: 20000000,
    distributedCapital: 8000000,
    navValue: 28000000,
    dpi: 0.4,
    tvpi: 1.8,
    irr: 22.3,
    joinDate: '2021-06-20',
    contactPerson: 'Sarah Smith',
    email: 'sarah@smithfamilyoffice.com'
  },
  {
    id: '3',
    name: 'Global Pension Fund',
    type: 'institution',
    commitmentAmount: 100000000,
    calledCapital: 75000000,
    distributedCapital: 25000000,
    navValue: 105000000,
    dpi: 0.33,
    tvpi: 1.73,
    irr: 21.8,
    joinDate: '2021-01-10',
    contactPerson: 'Michael Chen',
    email: 'mchen@globalpension.com'
  }
];

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q3 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q3',
    year: 2024,
    publishedDate: '2024-10-15',
    status: 'published',
    viewCount: 45
  },
  {
    id: '2',
    title: '2023 Annual Report',
    type: 'annual',
    year: 2023,
    publishedDate: '2024-03-31',
    status: 'published',
    viewCount: 152
  },
  {
    id: '3',
    title: 'Q2 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q2',
    year: 2024,
    publishedDate: '2024-07-15',
    status: 'published',
    viewCount: 89
  },
  {
    id: '4',
    title: 'Q4 2024 Quarterly Report',
    type: 'quarterly',
    quarter: 'Q4',
    year: 2024,
    publishedDate: '2025-01-15',
    status: 'draft',
    viewCount: 0
  }
];

const mockCapitalCalls: CapitalCall[] = [
  {
    id: '1',
    callNumber: 8,
    amount: 15000000,
    dueDate: '2024-12-15',
    purpose: 'Series B investment in CloudScale and NeuroLink',
    status: 'pending'
  },
  {
    id: '2',
    callNumber: 7,
    amount: 12000000,
    dueDate: '2024-09-15',
    purpose: 'Series A follow-on in Quantum AI',
    status: 'paid'
  }
];

const mockDistributions: Distribution[] = [
  {
    id: '1',
    distributionNumber: 5,
    amount: 8500000,
    paymentDate: '2024-11-30',
    type: 'realized-gains',
    status: 'paid'
  },
  {
    id: '2',
    distributionNumber: 4,
    amount: 3200000,
    paymentDate: '2024-08-31',
    type: 'realized-gains',
    status: 'paid'
  }
];

export function LPManagement() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [selectedLP, setSelectedLP] = useState<LP | null>(null);

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/lp-management');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': case 'paid':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'pending': case 'draft':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  // Calculate LP metrics for AI summary
  const totalLPs = mockLPs.length;
  const totalCommitments = mockLPs.reduce((sum, lp) => sum + lp.commitmentAmount, 0);
  const averageIRR = (mockLPs.reduce((sum, lp) => sum + lp.irr, 0) / mockLPs.length).toFixed(1);
  const pendingCapitalCalls = mockCapitalCalls.filter(c => c.status === 'pending').length;
  const publishedReports = mockReports.filter(r => r.status === 'published').length;

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      {routeConfig && (
        <div className="mb-4">
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        </div>
      )}

      {/* Page Header with AI Summary and Tabs */}
      <PageHeader
        title="LP Management"
        description="Manage Limited Partners, generate reports, and track capital activities"
        icon={UserCheck}
        aiSummary={{
          text: `${totalLPs} Limited Partners with ${formatCurrency(totalCommitments)} in commitments. Average IRR: ${averageIRR}%. ${pendingCapitalCalls} pending capital call(s), ${publishedReports} published report(s).`,
          confidence: 0.88
        }}
        primaryAction={{
          label: 'Generate Report',
          onClick: () => console.log('Generate report clicked'),
          aiSuggested: true,
          confidence: 0.82
        }}
        secondaryActions={[
          {
            label: 'Send Update',
            onClick: () => console.log('Send update clicked')
          }
        ]}
        tabs={[
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
            priority: pendingCapitalCalls > 0 ? 'high' : undefined
          },
          {
            id: 'performance',
            label: 'Performance',
          }
        ]}
        activeTab={selectedTab}
        onTabChange={(tabId) => setSelectedTab(tabId)}
      />

      {/* Fund Overview Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-primary-bg)]">
              <Users className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockLPs.length}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(mockLPs.reduce((sum, lp) => sum + lp.commitmentAmount, 0))}</p>
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
                {formatPercent(mockLPs.reduce((sum, lp) => sum + lp.irr, 0) / mockLPs.length)}
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
                {(mockLPs.reduce((sum, lp) => sum + lp.tvpi, 0) / mockLPs.length).toFixed(2)}x
              </p>
              <p className="text-xs text-[var(--app-text-muted)]">Average TVPI</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* LP Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            {mockLPs.map((lp) => (
              <Card key={lp.id} padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{lp.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge size="sm" className={getStatusColor(lp.type)}>
                        {lp.type.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm text-[var(--app-text-muted)]">
                        Since {new Date(lp.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setSelectedLP(lp)}
                  >
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Commitment</p>
                    <p className="text-lg font-semibold">{formatCurrency(lp.commitmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Called Capital</p>
                    <p className="text-lg font-semibold">{formatCurrency(lp.calledCapital)}</p>
                    <p className="text-xs text-[var(--app-text-subtle)]">
                      {((lp.calledCapital / lp.commitmentAmount) * 100).toFixed(0)}% deployed
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">NAV</p>
                    <p className="text-lg font-semibold">{formatCurrency(lp.navValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Distributions</p>
                    <p className="text-lg font-semibold">{formatCurrency(lp.distributedCapital)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--app-border)]">
                  <div className="text-center">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">TVPI</p>
                    <p className="text-xl font-bold text-[var(--app-success)]">{lp.tvpi.toFixed(2)}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">DPI</p>
                    <p className="text-xl font-bold text-[var(--app-info)]">{lp.dpi.toFixed(2)}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">IRR</p>
                    <p className="text-xl font-bold text-[var(--app-primary)]">{formatPercent(lp.irr)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockReports.map((report) => (
                <Card key={report.id} padding="lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--app-primary)]" />
                      <Badge size="sm" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
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
                {mockCapitalCalls.map((call) => (
                  <Card key={call.id} padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">Call #{call.callNumber}</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          Due: {new Date(call.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge size="sm" className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
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
                {mockDistributions.map((dist) => (
                  <Card key={dist.id} padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">Distribution #{dist.distributionNumber}</p>
                        <p className="text-xs text-[var(--app-text-muted)]">
                          {new Date(dist.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge size="sm" className={getStatusColor(dist.status)}>
                        {dist.status}
                      </Badge>
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
                    {(mockLPs.reduce((sum, lp) => sum + lp.tvpi, 0) / mockLPs.length).toFixed(2)}x
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Average across all LPs</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-info-bg)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-1">Distributions to Paid-In (DPI)</p>
                  <p className="text-3xl font-bold text-[var(--app-info)]">
                    {(mockLPs.reduce((sum, lp) => sum + lp.dpi, 0) / mockLPs.length).toFixed(2)}x
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Realized returns</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--app-primary-bg)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-1">Internal Rate of Return (IRR)</p>
                  <p className="text-3xl font-bold text-[var(--app-primary)]">
                    {formatPercent(mockLPs.reduce((sum, lp) => sum + lp.irr, 0) / mockLPs.length)}
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">Net to LPs</p>
                </div>
              </div>

              <div className="border-t border-[var(--app-border)] pt-6">
                <h4 className="font-medium mb-4">Capital Deployment</h4>
                <div className="space-y-4">
                  {mockLPs.map((lp) => (
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
    </PageContainer>
  );
}
