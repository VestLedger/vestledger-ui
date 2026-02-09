'use client';


import { DollarSign, AlertTriangle, Calendar, Download } from 'lucide-react';
import { Card, Button, Badge } from '@/ui';
import { RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { opsDashboardRequested, opsDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function OpsDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(opsDashboardRequested, opsDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const complianceAlerts = data?.complianceAlerts || [];
  const upcomingDistributions = data?.upcomingDistributions || [];

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
      loadingMessage="Loading ops dashboard…"
      errorTitle="Failed to load ops dashboard"
      isEmpty={() => false}
    >
      {() => (
        <RoleDashboardLayout
          title="Operations Center"
          description="Fund administration and compliance overview"
          metrics={metricItems}
          actions={(
            <>
              <Button variant="bordered" startContent={<Download className="w-4 h-4" />}>
                Export Reports
              </Button>
              <Button color="primary" startContent={<DollarSign className="w-4 h-4" />}>
                New Capital Call
              </Button>
            </>
          )}
        >
          <div className="grid lg:grid-cols-2 gap-4">
            <Card padding="md">
              <SectionHeader
                title={(
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[var(--app-warning)]" />
                    Compliance Alerts
                  </span>
                )}
                titleClassName="font-medium"
                className="mb-4"
              />
               <div className="space-y-3">
                 {complianceAlerts.map((alert, i) => (
                   <div key={i} className="p-3 bg-[var(--app-surface-hover)]/30 rounded-lg border-l-2 border-[var(--app-warning)]">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{alert.title}</div>
                        <Badge size="sm" variant="flat" className="text-[10px]">{alert.fund}</Badge>
                      </div>
                      <div className="text-xs text-[var(--app-text-muted)] mt-1">{alert.description}</div>
                   </div>
                 ))}
               </div>
            </Card>

            <Card padding="md">
              <SectionHeader
                title={(
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--app-info)]" />
                    Upcoming Distributions
                  </span>
                )}
                titleClassName="font-medium"
                className="mb-4"
              />
               <div className="space-y-4">
                 {upcomingDistributions.map((dist, i) => (
                   <div key={i} className="flex items-center justify-between pb-3 border-b border-[var(--app-border-subtle)] last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">{dist.event}</div>
                        <div className="text-xs text-[var(--app-text-muted)]">{dist.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{dist.amount}</div>
                       <div className={`text-[10px] ${dist.status === 'Approved' ? 'text-[var(--app-success)]' : 'text-[var(--app-warning)]'}`}>{dist.status}</div>
                      </div>
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
