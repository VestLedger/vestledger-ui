'use client';

import { DollarSign, AlertTriangle, Calendar, Download } from 'lucide-react';
import { Card, Button, Badge, PageContainer } from '@/ui';
import { MetricCard } from '@/components/metric-card';
import { getOpsDashboardSnapshot } from '@/services/dashboards/opsDashboardService';

export function OpsDashboard() {
  const { metrics, complianceAlerts, upcomingDistributions } = getOpsDashboardSnapshot();

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Operations Center</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Fund administration and compliance overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="bordered" startContent={<Download className="w-4 h-4" />}>
            Export Reports
          </Button>
          <Button color="primary" startContent={<DollarSign className="w-4 h-4" />}>
            New Capital Call
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card padding="md">
           <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-amber-500" />
             Compliance Alerts
           </h3>
           <div className="space-y-3">
             {complianceAlerts.map((alert, i) => (
               <div key={i} className="p-3 bg-[var(--app-surface-hover)]/30 rounded-lg border-l-2 border-amber-500">
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
           <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-blue-500" />
             Upcoming Distributions
           </h3>
           <div className="space-y-4">
             {upcomingDistributions.map((dist, i) => (
               <div key={i} className="flex items-center justify-between pb-3 border-b border-[var(--app-border-subtle)] last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-sm">{dist.event}</div>
                    <div className="text-xs text-[var(--app-text-muted)]">{dist.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{dist.amount}</div>
                    <div className={`text-[10px] ${dist.status === 'Approved' ? 'text-green-500' : 'text-amber-500'}`}>{dist.status}</div>
                  </div>
               </div>
             ))}
           </div>
        </Card>
      </div>
    </PageContainer>
  );
}
