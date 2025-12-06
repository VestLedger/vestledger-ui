'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { TrendingUp, DollarSign, Download, FileText, Calendar, Activity, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InvestorData {
  name: string;
  fundName: string;
  commitmentAmount: number;
  calledCapital: number;
  distributedCapital: number;
  navValue: number;
  dpi: number;
  tvpi: number;
  rvpi: number;
  irr: number;
  moic: number;
  joinDate: string;
  lastUpdate: string;
}

interface QuarterlyReport {
  id: string;
  quarter: string;
  year: number;
  publishedDate: string;
  downloadUrl: string;
}

interface Transaction {
  id: string;
  type: 'capital-call' | 'distribution';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending';
}

const mockInvestorData: InvestorData = {
  name: 'University Endowment Fund',
  fundName: 'Acme Ventures Fund II',
  commitmentAmount: 50000000,
  calledCapital: 30000000,
  distributedCapital: 12000000,
  navValue: 42000000,
  dpi: 0.4,
  tvpi: 1.8,
  rvpi: 1.4,
  irr: 24.5,
  moic: 1.8,
  joinDate: '2021-03-15',
  lastUpdate: '2024-11-28'
};

const mockReports: QuarterlyReport[] = [
  {
    id: '1',
    quarter: 'Q3',
    year: 2024,
    publishedDate: '2024-10-15',
    downloadUrl: '#'
  },
  {
    id: '2',
    quarter: 'Q2',
    year: 2024,
    publishedDate: '2024-07-15',
    downloadUrl: '#'
  },
  {
    id: '3',
    quarter: 'Q1',
    year: 2024,
    publishedDate: '2024-04-15',
    downloadUrl: '#'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'distribution',
    amount: 2500000,
    date: '2024-11-30',
    description: 'Q3 2024 Distribution - CloudScale exit proceeds',
    status: 'completed'
  },
  {
    id: '2',
    type: 'capital-call',
    amount: 3000000,
    date: '2024-12-15',
    description: 'Capital Call #8 - Series B investments',
    status: 'pending'
  },
  {
    id: '3',
    type: 'distribution',
    amount: 1800000,
    date: '2024-08-31',
    description: 'Q2 2024 Distribution - Portfolio returns',
    status: 'completed'
  },
  {
    id: '4',
    type: 'capital-call',
    amount: 2500000,
    date: '2024-09-15',
    description: 'Capital Call #7 - Follow-on investments',
    status: 'completed'
  }
];

export function LPInvestorPortal() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');

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

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-accent)] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{mockInvestorData.fundName}</h1>
          <p className="text-lg opacity-90">{mockInvestorData.name}</p>
          <p className="text-sm opacity-75 mt-1">Last updated: {new Date(mockInvestorData.lastUpdate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Total Commitment</p>
            <p className="text-2xl font-bold">{formatCurrency(mockInvestorData.commitmentAmount)}</p>
            <Progress
              value={(mockInvestorData.calledCapital / mockInvestorData.commitmentAmount) * 100}
              maxValue={100}
              className="h-2 mt-3"
            />
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              {((mockInvestorData.calledCapital / mockInvestorData.commitmentAmount) * 100).toFixed(0)}% deployed
            </p>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Net Asset Value</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">{formatCurrency(mockInvestorData.navValue)}</p>
            <div className="flex items-center gap-1 mt-3 text-[var(--app-success)]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {((mockInvestorData.navValue / mockInvestorData.calledCapital - 1) * 100).toFixed(1)}%
              </span>
            </div>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">Distributions</p>
            <p className="text-2xl font-bold text-[var(--app-info)]">{formatCurrency(mockInvestorData.distributedCapital)}</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-3">
              DPI: {mockInvestorData.dpi.toFixed(2)}x
            </p>
          </Card>

          <Card padding="lg">
            <p className="text-sm text-[var(--app-text-muted)] mb-1">IRR</p>
            <p className="text-2xl font-bold text-[var(--app-primary)]">{formatPercent(mockInvestorData.irr)}</p>
            <p className="text-xs text-[var(--app-text-subtle)] mt-3">
              TVPI: {mockInvestorData.tvpi.toFixed(2)}x
            </p>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">Performance Overview</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Total Value to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-success)]">{mockInvestorData.tvpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(mockInvestorData.navValue + mockInvestorData.distributedCapital)} total value
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Distributions to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-info)]">{mockInvestorData.dpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">Realized returns</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Residual Value to Paid-In</p>
              <p className="text-3xl font-bold text-[var(--app-primary)]">{mockInvestorData.rvpi.toFixed(2)}x</p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">Unrealized value</p>
            </div>
          </div>
        </Card>

        <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
          {/* Reports Tab */}
          <Tab
            key="reports"
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </div>
            }
          >
            <div className="mt-4 space-y-3">
              {mockReports.map((report) => (
                <Card key={report.id} padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
                        <FileText className="w-5 h-5 text-[var(--app-primary)]" />
                      </div>
                      <div>
                        <p className="font-semibold">{report.quarter} {report.year} Quarterly Report</p>
                        <p className="text-sm text-[var(--app-text-muted)]">
                          Published: {new Date(report.publishedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="flat"
                      startContent={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>

          {/* Transactions Tab */}
          <Tab
            key="transactions"
            title={
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Transactions</span>
              </div>
            }
          >
            <div className="mt-4 space-y-3">
              {mockTransactions.map((transaction) => (
                <Card key={transaction.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${
                        transaction.type === 'distribution'
                          ? 'bg-[var(--app-success-bg)]'
                          : 'bg-[var(--app-warning-bg)]'
                      }`}>
                        {transaction.type === 'distribution' ? (
                          <ArrowDownRight className="w-5 h-5 text-[var(--app-success)]" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-[var(--app-warning)]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {transaction.type === 'distribution' ? 'Distribution' : 'Capital Call'}
                          </p>
                          <Badge
                            size="sm"
                            className={
                              transaction.status === 'completed'
                                ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                                : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--app-text-muted)] mb-1">{transaction.description}</p>
                        <p className="text-xs text-[var(--app-text-subtle)]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xl font-bold ${
                      transaction.type === 'distribution'
                        ? 'text-[var(--app-success)]'
                        : 'text-[var(--app-text)]'
                    }`}>
                      {transaction.type === 'distribution' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>

          {/* Portfolio Tab */}
          <Tab
            key="portfolio"
            title={
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                <span>Portfolio</span>
              </div>
            }
          >
            <div className="mt-4">
              <Card padding="lg">
                <h3 className="font-semibold mb-4">Portfolio Composition</h3>
                <p className="text-sm text-[var(--app-text-muted)] mb-6">
                  Detailed portfolio company information is available in the quarterly reports.
                  Contact your fund manager for specific portfolio insights.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Early Stage (Seed/Series A)</span>
                      <span className="text-sm text-[var(--app-text-muted)]">45%</span>
                    </div>
                    <Progress value={45} maxValue={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Growth Stage (Series B+)</span>
                      <span className="text-sm text-[var(--app-text-muted)]">35%</span>
                    </div>
                    <Progress value={35} maxValue={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Realized/Exits</span>
                      <span className="text-sm text-[var(--app-text-muted)]">20%</span>
                    </div>
                    <Progress value={20} maxValue={100} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>
          </Tab>

          {/* Account Tab */}
          <Tab
            key="account"
            title={
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Account</span>
              </div>
            }
          >
            <div className="mt-4">
              <Card padding="lg">
                <h3 className="font-semibold mb-4">Investment Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Investor</p>
                    <p className="font-medium">{mockInvestorData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Fund</p>
                    <p className="font-medium">{mockInvestorData.fundName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Investment Date</p>
                    <p className="font-medium">{new Date(mockInvestorData.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Commitment</p>
                    <p className="font-medium">{formatCurrency(mockInvestorData.commitmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Called to Date</p>
                    <p className="font-medium">{formatCurrency(mockInvestorData.calledCapital)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--app-text-muted)] mb-1">Remaining Commitment</p>
                    <p className="font-medium">
                      {formatCurrency(mockInvestorData.commitmentAmount - mockInvestorData.calledCapital)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="mt-4 bg-[var(--app-info-bg)] border-[var(--app-info)]/20">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--app-info)] mb-1">Need Help?</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      Contact your fund administrator for questions about your investment,
                      tax documents, or upcoming capital calls.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
