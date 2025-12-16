'use client';

import { Mail, Calendar, Phone } from 'lucide-react';
import { Card, Button, Badge, PageContainer } from '@/ui';
import { MetricCard } from '@/components/metric-card';
import { getIRDashboardSnapshot } from '@/services/dashboards/irDashboardService';

export function IRDashboard() {
  const { metrics, recentInteractions, upcomingTasks } = getIRDashboardSnapshot();

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Relationship Navigator</h2>
          <p className="text-sm text-[var(--app-text-muted)]">LP communications and investor relations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="bordered" startContent={<Mail className="w-4 h-4" />}>
            Draft Update
          </Button>
          <Button color="primary" startContent={<Phone className="w-4 h-4" />}>
            Schedule Call
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="md">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-medium">Recent LP Interactions</h3>
             <Button size="sm" variant="light">View All</Button>
           </div>
           <div className="space-y-4">
             {recentInteractions.map((interaction, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)] transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[var(--app-secondary-bg)] flex items-center justify-center text-[var(--app-secondary)] font-bold">
                     {interaction.lp.substring(0, 2)}
                   </div>
                   <div>
                     <div className="font-medium">{interaction.lp}</div>
                     <div className="text-xs text-[var(--app-text-muted)]">{interaction.notes}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Badge variant="flat" color={interaction.type === 'Call' ? 'primary' : interaction.type === 'Email' ? 'secondary' : 'warning'}>
                      {interaction.type}
                    </Badge>
                    <span className="text-xs text-[var(--app-text-muted)]">{interaction.date}</span>
                 </div>
               </div>
             ))}
           </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Tasks
          </h3>
          <div className="space-y-3">
            {upcomingTasks.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border-l-2 border-[var(--app-primary)]">
                 <div>
                   <div className="text-sm font-medium">{item.task}</div>
                   <div className="text-xs text-[var(--app-text-muted)]">Due: {item.due}</div>
                 </div>
                 <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                   {item.priority}
                 </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
