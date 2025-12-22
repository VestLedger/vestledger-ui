'use client';


import { Search, CheckCircle2, Clock } from 'lucide-react';
import { Card, Button, Badge, PageContainer } from '@/ui';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import { analystDashboardRequested, analystDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { ErrorState, LoadingState } from '@/components/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function AnalystDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(analystDashboardRequested, analystDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const recentDeals = data?.recentDeals || [];
  const urgentTasks = data?.urgentTasks || [];

  if (isLoading) return <LoadingState message="Loading analyst dashboard…" />;
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load analyst dashboard"
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
          <h2 className="text-2xl sm:text-3xl font-bold">Analyst Workspace</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Deal flow and market intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Search className="w-4 h-4" />}>
            New Deal Sourcing
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
             <h3 className="text-lg font-medium">Active Due Diligence</h3>
             <Button size="sm" variant="light">View All</Button>
           </div>
           <div className="space-y-4">
             {recentDeals.map((deal, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-hover)] transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)] font-bold">
                     {deal.name.substring(0, 2)}
                   </div>
                   <div>
                     <div className="font-medium">{deal.name}</div>
                     <div className="text-xs text-[var(--app-text-muted)]">{deal.sector}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Badge variant="flat" color={deal.stage === 'Due Diligence' ? 'warning' : 'primary'}>
                      {deal.stage}
                    </Badge>
                    <div className="text-right">
                       <div className="text-sm font-bold text-[var(--app-success)]">{deal.score}/100</div>
                       <div className="text-[10px] text-[var(--app-text-muted)]">Score</div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-medium mb-4">Urgent Tasks</h3>
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
                     <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                       {item.priority}
                     </span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
