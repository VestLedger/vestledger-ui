'use client';


import { Shield, CheckCircle2, Search, Download } from 'lucide-react';
import { Card, Button, Badge, PageContainer } from '@/ui';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { auditorDashboardRequested, auditorDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { ErrorState, LoadingState } from '@/components/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function AuditorDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(auditorDashboardRequested, auditorDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const auditTrail = data?.auditTrail || [];
  const complianceItems = data?.complianceItems || [];

  if (isLoading) return <LoadingState message="Loading auditor dashboard…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load auditor dashboard"
        onRetry={refetch}
      />
    );
  }

  const metricItems: MetricsGridItem[] = metrics.map((metric) => ({
    type: 'metric',
    props: metric,
  }));

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Auditor View</h2>
          <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted">Compliance records, audit trails, and reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="bordered" startContent={<Search className="w-4 h-4" />}>
            Search Records
          </Button>
          <Button color="primary" startContent={<Download className="w-4 h-4" />}>
            Export Audit Log
          </Button>
        </div>
      </div>

      <MetricsGrid
        items={metricItems}
        columns={{ base: 1, sm: 2, lg: 4 }}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="md">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-medium">On-Chain Audit Trail</h3>
             <Button size="sm" variant="light">View Full Log</Button>
           </div>
           <div className="space-y-3">
             {auditTrail.map((entry, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-app-border-subtle dark:border-app-dark-border-subtle hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-app-success-bg dark:bg-app-dark-success-bg flex items-center justify-center text-app-success dark:text-app-dark-success">
                     <CheckCircle2 className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-medium text-sm">{entry.action}</div>
                     <div className="text-xs text-app-text-muted dark:text-app-dark-text-muted">{entry.fund} • {entry.date}</div>
                   </div>
                 </div>
                 <div className="text-right">
                   <code className="text-xs bg-app-surface-hover dark:bg-app-dark-surface-hover px-2 py-1 rounded text-app-primary dark:text-app-dark-primary">
                     {entry.hash}
                   </code>
                 </div>
               </div>
             ))}
           </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Compliance Status
          </h3>
          <div className="space-y-3">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                 <div>
                   <div className="text-sm font-medium">{item.item}</div>
                   <div className="text-xs text-app-text-muted dark:text-app-dark-text-muted">{item.lastCheck}</div>
                 </div>
                 <Badge size="sm" variant="flat" color={item.status === 'Passed' ? 'success' : 'warning'}>
                   {item.status}
                 </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
