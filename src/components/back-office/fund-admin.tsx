'use client'

import { useState } from 'react';
import { Card, Button, Badge, Progress, Input, Select, SelectItem } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { DollarSign, Send, Download, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Calendar, FileText, Mail, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CapitalCall {
  id: string;
  callNumber: number;
  fundName: string;
  callDate: string;
  dueDate: string;
  totalAmount: number;
  amountReceived: number;
  lpCount: number;
  lpsResponded: number;
  status: 'draft' | 'sent' | 'in-progress' | 'completed';
  purpose: string;
}

interface Distribution {
  id: string;
  distributionNumber: number;
  fundName: string;
  distributionDate: string;
  totalAmount: number;
  lpCount: number;
  status: 'draft' | 'processing' | 'completed';
  source: string;
  type: 'return-of-capital' | 'capital-gain' | 'dividend';
}

interface LPResponse {
  id: string;
  lpName: string;
  commitment: number;
  callAmount: number;
  amountPaid: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paymentMethod: string;
}

const mockCapitalCalls: CapitalCall[] = [
  {
    id: '1',
    callNumber: 8,
    fundName: 'Acme Ventures Fund II',
    callDate: '2024-12-01',
    dueDate: '2024-12-15',
    totalAmount: 15000000,
    amountReceived: 12000000,
    lpCount: 12,
    lpsResponded: 9,
    status: 'in-progress',
    purpose: 'Series B investments - CloudScale, DataFlow'
  },
  {
    id: '2',
    callNumber: 7,
    fundName: 'Acme Ventures Fund II',
    callDate: '2024-09-15',
    dueDate: '2024-09-30',
    totalAmount: 12500000,
    amountReceived: 12500000,
    lpCount: 12,
    lpsResponded: 12,
    status: 'completed',
    purpose: 'Follow-on investments and operating reserves'
  },
  {
    id: '3',
    callNumber: 9,
    fundName: 'Acme Ventures Fund III',
    callDate: '2024-12-10',
    dueDate: '2024-12-25',
    totalAmount: 20000000,
    amountReceived: 0,
    lpCount: 15,
    lpsResponded: 0,
    status: 'draft',
    purpose: 'Initial deployment - Seed and Series A investments'
  }
];

const mockDistributions: Distribution[] = [
  {
    id: '1',
    distributionNumber: 5,
    fundName: 'Acme Ventures Fund II',
    distributionDate: '2024-11-30',
    totalAmount: 8500000,
    lpCount: 12,
    status: 'completed',
    source: 'CloudScale exit proceeds',
    type: 'capital-gain'
  },
  {
    id: '2',
    distributionNumber: 4,
    fundName: 'Acme Ventures Fund II',
    distributionDate: '2024-08-31',
    totalAmount: 5200000,
    lpCount: 12,
    status: 'completed',
    source: 'Portfolio company dividends',
    type: 'dividend'
  },
  {
    id: '3',
    distributionNumber: 6,
    fundName: 'Acme Ventures Fund I',
    distributionDate: '2024-12-20',
    totalAmount: 12000000,
    lpCount: 10,
    status: 'processing',
    source: 'FinTech Solutions IPO proceeds',
    type: 'capital-gain'
  }
];

const mockLPResponses: LPResponse[] = [
  {
    id: '1',
    lpName: 'University Endowment Fund',
    commitment: 50000000,
    callAmount: 5000000,
    amountPaid: 5000000,
    dueDate: '2024-12-15',
    status: 'paid',
    paymentMethod: 'Wire Transfer'
  },
  {
    id: '2',
    lpName: 'Tech Pension Fund',
    commitment: 30000000,
    callAmount: 3000000,
    amountPaid: 3000000,
    dueDate: '2024-12-15',
    status: 'paid',
    paymentMethod: 'ACH'
  },
  {
    id: '3',
    lpName: 'Family Office Partners',
    commitment: 25000000,
    callAmount: 2500000,
    amountPaid: 1500000,
    dueDate: '2024-12-15',
    status: 'partial',
    paymentMethod: 'Wire Transfer'
  },
  {
    id: '4',
    lpName: 'Sovereign Wealth Fund',
    commitment: 75000000,
    callAmount: 7500000,
    amountPaid: 0,
    dueDate: '2024-12-15',
    status: 'pending',
    paymentMethod: 'Wire Transfer'
  }
];

export function FundAdmin() {
  const [selectedTab, setSelectedTab] = useState<string>('capital-calls');

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
      case 'completed':
      case 'paid':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'in-progress':
      case 'processing':
      case 'partial':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'draft':
      case 'pending':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
      case 'processing':
      case 'partial':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--app-text)]">Fund Administration</h1>
          <p className="text-[var(--app-text-muted)] mt-1">
            Manage capital calls, distributions, and LP communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="bordered"
            startContent={<Download className="w-4 h-4" />}
          >
            Export Activity
          </Button>
          <Button
            className="bg-[var(--app-primary)] text-white"
            startContent={<Send className="w-4 h-4" />}
          >
            New Capital Call
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
              <ArrowUpRight className="w-6 h-6 text-[var(--app-warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Active Calls</p>
              <p className="text-2xl font-bold">
                {mockCapitalCalls.filter(c => c.status === 'in-progress').length}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(
                  mockCapitalCalls
                    .filter(c => c.status === 'in-progress')
                    .reduce((sum, c) => sum + c.totalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
              <ArrowDownRight className="w-6 h-6 text-[var(--app-success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">YTD Distributions</p>
              <p className="text-2xl font-bold">
                {mockDistributions.filter(d => d.status === 'completed').length}
              </p>
              <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                {formatCurrency(
                  mockDistributions
                    .filter(d => d.status === 'completed')
                    .reduce((sum, d) => sum + d.totalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
              <DollarSign className="w-6 h-6 text-[var(--app-info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Outstanding</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  mockCapitalCalls
                    .filter(c => c.status === 'in-progress')
                    .reduce((sum, c) => sum + (c.totalAmount - c.amountReceived), 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
              <Users className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Total LPs</p>
              <p className="text-2xl font-bold">
                {Math.max(...mockCapitalCalls.map(c => c.lpCount))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
        {/* Capital Calls Tab */}
        <Tab
          key="capital-calls"
          title={
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>Capital Calls</span>
            </div>
          }
        >
          <div className="mt-4 space-y-3">
            {mockCapitalCalls.map((call) => {
              const responseRate = (call.lpsResponded / call.lpCount) * 100;
              const collectionRate = (call.amountReceived / call.totalAmount) * 100;

              return (
                <Card key={call.id} padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
                          <ArrowUpRight className="w-6 h-6 text-[var(--app-warning)]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">Capital Call #{call.callNumber}</h3>
                            <Badge size="sm" className={getStatusColor(call.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(call.status)}
                                <span className="capitalize">{call.status.replace('-', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--app-text-muted)] mb-1">{call.fundName}</p>
                          <p className="text-sm text-[var(--app-text-subtle)]">{call.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.status === 'draft' && (
                          <Button
                            size="sm"
                            className="bg-[var(--app-primary)] text-white"
                            startContent={<Send className="w-4 h-4" />}
                          >
                            Send to LPs
                          </Button>
                        )}
                        {call.status !== 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="bordered"
                              startContent={<Mail className="w-4 h-4" />}
                            >
                              Send Reminder
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<Download className="w-4 h-4" />}
                            >
                              Export
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Amount</p>
                        <p className="text-lg font-bold">{formatCurrency(call.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Received</p>
                        <p className="text-lg font-bold text-[var(--app-success)]">
                          {formatCurrency(call.amountReceived)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Call Date</p>
                        <p className="font-semibold">{new Date(call.callDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">Due Date</p>
                        <p className="font-semibold">{new Date(call.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {call.status !== 'draft' && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-[var(--app-text-muted)]">Collection Progress</span>
                            <span className="font-semibold">{collectionRate.toFixed(0)}%</span>
                          </div>
                          <Progress value={collectionRate} maxValue={100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--app-text-muted)]" />
                            <span className="text-[var(--app-text-muted)]">LP Responses</span>
                          </div>
                          <span className="font-semibold">
                            {call.lpsResponded} of {call.lpCount} ({responseRate.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Tab>

        {/* Distributions Tab */}
        <Tab
          key="distributions"
          title={
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              <span>Distributions</span>
            </div>
          }
        >
          <div className="mt-4 space-y-3">
            {mockDistributions.map((dist) => (
              <Card key={dist.id} padding="lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
                      <ArrowDownRight className="w-6 h-6 text-[var(--app-success)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Distribution #{dist.distributionNumber}</h3>
                        <Badge size="sm" className={getStatusColor(dist.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(dist.status)}
                            <span className="capitalize">{dist.status}</span>
                          </div>
                        </Badge>
                        <Badge size="sm" className="bg-[var(--app-surface-hover)]">
                          {dist.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--app-text-muted)] mb-1">{dist.fundName}</p>
                      <p className="text-sm text-[var(--app-text-subtle)]">Source: {dist.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<FileText className="w-4 h-4" />}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Download className="w-4 h-4" />}
                    >
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-[var(--app-success)]">
                      {formatCurrency(dist.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">LPs</p>
                    <p className="font-semibold">{dist.lpCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Distribution Date</p>
                    <p className="font-semibold">{new Date(dist.distributionDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-text-muted)] mb-1">Per LP Avg</p>
                    <p className="font-semibold">{formatCurrency(dist.totalAmount / dist.lpCount)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Tab>

        {/* LP Responses Tab */}
        <Tab
          key="lp-responses"
          title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>LP Responses</span>
            </div>
          }
        >
          <div className="mt-4">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Capital Call #8 - LP Responses</h3>
                <Select
                  placeholder="Filter by status"
                  className="w-48"
                  size="sm"
                >
                  <SelectItem key="all">All Statuses</SelectItem>
                  <SelectItem key="paid">Paid</SelectItem>
                  <SelectItem key="partial">Partial</SelectItem>
                  <SelectItem key="pending">Pending</SelectItem>
                  <SelectItem key="overdue">Overdue</SelectItem>
                </Select>
              </div>

              <div className="space-y-3">
                {mockLPResponses.map((response) => {
                  const paymentProgress = (response.amountPaid / response.callAmount) * 100;

                  return (
                    <div key={response.id} className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{response.lpName}</p>
                            <Badge size="sm" className={getStatusColor(response.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(response.status)}
                                <span className="capitalize">{response.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--app-text-muted)]">
                            Commitment: {formatCurrency(response.commitment)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {formatCurrency(response.amountPaid)} / {formatCurrency(response.callAmount)}
                          </p>
                          <p className="text-xs text-[var(--app-text-muted)]">
                            Due: {new Date(response.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {response.status !== 'paid' && (
                        <div className="mb-3">
                          <Progress value={paymentProgress} maxValue={100} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--app-text-muted)]">
                          Payment Method: {response.paymentMethod}
                        </span>
                        {response.status === 'pending' && (
                          <Button size="sm" variant="flat" startContent={<Mail className="w-4 h-4" />}>
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
