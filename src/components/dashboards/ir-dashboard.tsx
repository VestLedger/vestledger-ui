'use client';


import { Mail, Calendar, Phone } from 'lucide-react';
import { Card, Button, Badge } from '@/ui';
import { ListItemCard, RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { irDashboardRequested, irDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function IRDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(irDashboardRequested, irDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const recentInteractions = data?.recentInteractions || [];
  const upcomingTasks = data?.upcomingTasks || [];

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
      loadingMessage="Loading IR dashboard…"
      errorTitle="Failed to load IR dashboard"
      isEmpty={() => false}
    >
      {() => (
        <RoleDashboardLayout
          title="Relationship Navigator"
          description="LP communications and investor relations"
          metrics={metricItems}
          actions={(
            <>
              <Button variant="bordered" startContent={<Mail className="w-4 h-4" />}>
                Draft Update
              </Button>
              <Button color="primary" startContent={<Phone className="w-4 h-4" />}>
                Schedule Call
              </Button>
            </>
          )}
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" padding="md">
              <SectionHeader
                title="Recent LP Interactions"
                titleClassName="font-medium"
                action={<Button size="sm" variant="light">View All</Button>}
                className="mb-4"
              />
               <div className="space-y-4">
                 {recentInteractions.map((interaction, idx) => (
                  <ListItemCard
                    key={idx}
                    padding="sm"
                    className="rounded-lg border border-[var(--app-border-subtle)]"
                    icon={(
                      <div className="w-10 h-10 rounded-full bg-[var(--app-secondary-bg)] flex items-center justify-center text-[var(--app-secondary)] font-bold">
                        {interaction.lp.substring(0, 2)}
                      </div>
                    )}
                    title={interaction.lp}
                    description={interaction.notes}
                    actions={(
                      <div className="flex items-center gap-3">
                        <Badge variant="flat" color={interaction.type === 'Call' ? 'primary' : interaction.type === 'Email' ? 'secondary' : 'warning'}>
                          {interaction.type}
                        </Badge>
                        <span className="text-xs text-[var(--app-text-muted)]">{interaction.date}</span>
                      </div>
                    )}
                  />
                 ))}
               </div>
            </Card>

            <Card padding="md">
              <SectionHeader
                title={(
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--app-info)]" />
                    Upcoming Tasks
                  </span>
                )}
                titleClassName="font-medium"
                className="mb-4"
              />
              <div className="space-y-3">
                {upcomingTasks.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border-l-2 border-[var(--app-primary)]">
                     <div>
                       <div className="text-sm font-medium">{item.task}</div>
                       <div className="text-xs text-[var(--app-text-muted)]">Due: {item.due}</div>
                     </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]' : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'}`}>
                       {item.priority}
                     </span>
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
