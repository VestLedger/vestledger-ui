'use client';


import { Search, CheckCircle2, Clock } from 'lucide-react';
import { Card, Button, Badge } from '@/ui';
import { ListItemCard, RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { analystDashboardRequested, analystDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function AnalystDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(analystDashboardRequested, analystDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const recentDeals = data?.recentDeals || [];
  const urgentTasks = data?.urgentTasks || [];

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
      loadingMessage="Loading analyst dashboard…"
      errorTitle="Failed to load analyst dashboard"
      isEmpty={() => false}
    >
      {() => (
        <RoleDashboardLayout
          title="Analyst Workspace"
          description="Deal flow and market intelligence"
          metrics={metricItems}
          actions={(
            <Button color="primary" startContent={<Search className="w-4 h-4" />}>
              New Deal Sourcing
            </Button>
          )}
        >
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2" padding="md">
              <SectionHeader
                title="Active Due Diligence"
                titleClassName="font-medium"
                action={<Button size="sm" variant="light">View All</Button>}
                className="mb-4"
              />
               <div className="space-y-4">
                 {recentDeals.map((deal, idx) => (
                  <ListItemCard
                    key={idx}
                    padding="sm"
                    className="rounded-lg border border-[var(--app-border-subtle)]"
                    icon={(
                      <div className="w-10 h-10 rounded-full bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)] font-bold">
                        {deal.name.substring(0, 2)}
                      </div>
                    )}
                    title={deal.name}
                    description={deal.sector}
                    actions={(
                      <div className="flex items-center gap-3">
                        <Badge variant="flat" color={deal.stage === 'Due Diligence' ? 'warning' : 'primary'}>
                          {deal.stage}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[var(--app-success)]">{deal.score}/100</div>
                          <div className="text-[10px] text-[var(--app-text-muted)]">Score</div>
                        </div>
                      </div>
                    )}
                  />
                 ))}
               </div>
            </Card>

            <Card padding="md">
              <SectionHeader title="Urgent Tasks" titleClassName="font-medium" className="mb-4" />
              <div className="space-y-3">
                {urgentTasks.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2">
                     <CheckCircle2 className="w-5 h-5 text-[var(--app-text-muted)] mt-0.5" />
                     <div>
                       <div className="text-sm font-medium">{item.task}</div>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs text-[var(--app-text-muted)] flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {item.due}
                         </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]' : 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'}`}>
                           {item.priority}
                         </span>
                       </div>
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
