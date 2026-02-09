'use client';


import { Shield, CheckCircle2, Search, Download } from 'lucide-react';
import { Card, Button, Badge } from '@/ui';
import { RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { auditorDashboardRequested, auditorDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function AuditorDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(auditorDashboardRequested, auditorDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const auditTrail = data?.auditTrail || [];
  const complianceItems = data?.complianceItems || [];

  const metricItems: MetricsGridItem[] = metrics.map((metric) => ({
    type: 'metric',
    props: metric,
  }));

  return (
    <AsyncStateRenderer
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      loadingMessage="Loading auditor dashboard…"
      errorTitle="Failed to load auditor dashboard"
      isEmpty={() => false}
    >
      {() => (
        <RoleDashboardLayout
          title="Auditor View"
          description="Compliance records, audit trails, and reports"
          metrics={metricItems}
          actions={(
            <>
              <Button variant="bordered" startContent={<Search className="w-4 h-4" />}>
                Search Records
              </Button>
              <Button color="primary" startContent={<Download className="w-4 h-4" />}>
                Export Audit Log
              </Button>
            </>
          )}
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" padding="md">
              <SectionHeader
                title="On-Chain Audit Trail"
                titleClassName="font-medium"
                action={<Button size="sm" variant="light">View Full Log</Button>}
                className="mb-4"
              />
               <div className="space-y-3">
                 {auditTrail.map((entry, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)] transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-[var(--app-success-bg)] flex items-center justify-center text-[var(--app-success)]">
                         <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="font-medium text-sm">{entry.action}</div>
                         <div className="text-xs text-[var(--app-text-muted)]">{entry.fund} • {entry.date}</div>
                       </div>
                     </div>
                     <div className="text-right">
                       <code className="text-xs bg-[var(--app-surface-hover)] px-2 py-1 rounded text-[var(--app-primary)]">
                         {entry.hash}
                       </code>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>

            <Card padding="md">
              <SectionHeader
                title={(
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--app-success)]" />
                    Compliance Status
                  </span>
                )}
                titleClassName="font-medium"
                className="mb-4"
              />
              <div className="space-y-3">
                {complianceItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                     <div>
                       <div className="text-sm font-medium">{item.item}</div>
                       <div className="text-xs text-[var(--app-text-muted)]">{item.lastCheck}</div>
                     </div>
                     <Badge size="sm" variant="flat" color={item.status === 'Passed' ? 'success' : 'warning'}>
                       {item.status}
                     </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </RoleDashboardLayout>
      )}
    </AsyncStateRenderer>
  );
}
