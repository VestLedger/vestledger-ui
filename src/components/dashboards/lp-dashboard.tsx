'use client';

import { FileText, DollarSign, Download, Calendar, CheckCircle2, AlertCircle, Clock, CreditCard, Pen, Shield, ChevronRight, Wallet } from 'lucide-react';
import { Card, Button, Badge, Progress, PageContainer } from '@/ui';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { lpDashboardRequested, lpDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { ErrorState, LoadingState } from '@/components/ui/async-states';
import { formatCurrencyCompact } from '@/utils/formatting';
import { useAsyncData } from '@/hooks/useAsyncData';

export function LPDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(lpDashboardRequested, lpDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const documents = data?.documents || [];
  const capitalActivity = data?.capitalActivity || [];
  const pendingCalls = data?.pendingCalls || [];
  const pendingSignatures = data?.pendingSignatures || [];
  const commitment = data?.commitment || { totalCommitment: 0, calledAmount: 0 };

  if (isLoading) return <LoadingState message="Loading LP dashboard…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load LP dashboard"
        onRetry={refetch}
      />
    );
  }

  const getDaysUntilDue = (date: Date) => {
    const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    return `${diff} days left`;
  };

  // Commitment tracking
  const totalCommitment = commitment.totalCommitment;
  const calledAmount = commitment.calledAmount;
  const unfundedCommitment = totalCommitment - calledAmount;

  const metricItems: MetricsGridItem[] = metrics.map((metric) => ({
    type: 'metric',
    props: metric,
  }));

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">LP Portal</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Your investment overview and documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="bordered" startContent={<Calendar className="w-4 h-4" />}>
            Schedule Meeting
          </Button>
          <Button color="primary" startContent={<Download className="w-4 h-4" />}>
            Download Statements
          </Button>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {(pendingCalls.length > 0 || pendingSignatures.length > 0) && (
        <Card padding="md" className="border-[var(--app-warning)] bg-[var(--app-warning-bg)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--app-warning)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-[var(--app-warning)]">Action Required</h3>
              <p className="text-sm text-[var(--app-text-muted)] mt-1">
                You have {pendingCalls.length} pending capital call{pendingCalls.length !== 1 ? 's' : ''} and{' '}
                {pendingSignatures.length} document{pendingSignatures.length !== 1 ? 's' : ''} awaiting signature.
              </p>
            </div>
          </div>
        </Card>
      )}

      <MetricsGrid
        items={metricItems}
        columns={{ base: 1, sm: 2, lg: 4 }}
      />

      {/* Commitment Tracking */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--app-primary)]" />
            Commitment Status
          </h3>
          <Badge variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
            Fund III
          </Badge>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">Total Commitment</div>
            <div className="text-xl font-bold">{formatCurrencyCompact(totalCommitment)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">Called to Date</div>
            <div className="text-xl font-bold text-[var(--app-success)]">{formatCurrencyCompact(calledAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--app-text-muted)] mb-1">Unfunded Commitment</div>
            <div className="text-xl font-bold text-[var(--app-warning)]">{formatCurrencyCompact(unfundedCommitment)}</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Capital Called</span>
            <span className="font-medium">{((calledAmount / totalCommitment) * 100).toFixed(0)}%</span>
          </div>
          <Progress value={(calledAmount / totalCommitment) * 100} maxValue={100} className="h-3" aria-label={`Capital called ${((calledAmount / totalCommitment) * 100).toFixed(0)}%`} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Capital Calls - Self Service */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--app-warning)]" />
              Pending Capital Calls
            </h3>
            {pendingCalls.length > 0 && (
              <Badge color="warning">{pendingCalls.length}</Badge>
            )}
          </div>
          {pendingCalls.length > 0 ? (
            <div className="space-y-3">
              {pendingCalls.map((call) => (
                <div key={call.id} className="p-4 rounded-lg border border-[var(--app-warning)] bg-[var(--app-warning-bg)]/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium">{call.fundName}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">Capital Call #{call.callNumber}</div>
                    </div>
                    <Badge
                      size="sm"
                      className={call.status === 'overdue' ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]' : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {getDaysUntilDue(call.dueDate)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{formatCurrencyCompact(call.amount)}</div>
                      <div className="text-xs text-[var(--app-text-muted)]">Due: {call.dueDate.toLocaleDateString()}</div>
                    </div>
                    <Button color="primary" startContent={<CreditCard className="w-4 h-4" />}>
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--app-text-muted)]">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pending capital calls</p>
            </div>
          )}
        </Card>

        {/* Pending Signatures - E-Signature */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Pen className="w-5 h-5 text-[var(--app-primary)]" />
              Documents Awaiting Signature
            </h3>
            {pendingSignatures.length > 0 && (
              <Badge color="primary">{pendingSignatures.length}</Badge>
            )}
          </div>
          {pendingSignatures.length > 0 ? (
            <div className="space-y-3">
              {pendingSignatures.map((sig) => (
                <div key={sig.id} className="p-4 rounded-lg border border-[var(--app-border)] hover:border-[var(--app-primary)] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--app-primary-bg)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--app-primary)]" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{sig.documentName}</div>
                        <div className="text-xs text-[var(--app-text-muted)]">{sig.documentType}</div>
                      </div>
                    </div>
                    <Badge
                      size="sm"
                      className={sig.urgency === 'high' ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]' : 'bg-[var(--app-info-bg)] text-[var(--app-info)]'}
                    >
                      {sig.urgency} priority
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[var(--app-text-muted)]">
                      Requested: {sig.requestedDate.toLocaleDateString()}
                    </div>
                    <Button size="sm" color="primary" startContent={<Pen className="w-3 h-3" />}>
                      Sign Document
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--app-text-muted)]">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No documents awaiting signature</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card padding="md">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-medium">Recent Documents</h3>
             <Button size="sm" variant="light">View All</Button>
           </div>
           <div className="space-y-3">
             {documents.map((doc, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)] transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)]">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-medium text-sm">{doc.name}</div>
                     <div className="text-xs text-[var(--app-text-muted)]">{doc.type} • {doc.date}</div>
                   </div>
                 </div>
                 <Button size="sm" variant="light" isIconOnly>
                   <Download className="w-4 h-4" />
                 </Button>
               </div>
             ))}
           </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Capital Activity
          </h3>
          <div className="space-y-3">
            {capitalActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)]">
                 <div>
                   <div className="text-sm font-medium">{item.type}</div>
                   <div className="text-xs text-[var(--app-text-muted)]">{item.date}</div>
                 </div>
                 <div className="text-right">
                   <div className={`font-medium ${item.type === 'Distribution' ? 'text-green-500' : ''}`}>{item.amount}</div>
                   <Badge size="sm" variant="flat" color={item.status === 'Paid' || item.status === 'Received' ? 'success' : 'warning'}>
                     {item.status}
                   </Badge>
                 </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Blockchain Verification Badge */}
      <Card padding="md" className="bg-gradient-to-r from-[var(--app-primary-bg)] to-[var(--app-surface)]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[var(--app-primary)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Blockchain-Verified Records</h3>
            <p className="text-sm text-[var(--app-text-muted)]">
              All your capital activity and ownership records are cryptographically secured on VestLedger&apos;s private blockchain.
            </p>
          </div>
          <Button variant="bordered" endContent={<ChevronRight className="w-4 h-4" />}>
            View Audit Trail
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
