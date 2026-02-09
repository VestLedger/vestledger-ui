'use client';


import { TrendingUp, FileText, Search, Download } from 'lucide-react';
import { Card, Button, Badge } from '@/ui';
import { ListItemCard, RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import type { MetricsGridItem } from '@/ui/composites';
import { researcherDashboardRequested, researcherDashboardSelectors } from '@/store/slices/dashboardsSlice';
import { AsyncStateRenderer } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';

export function ResearcherDashboard() {
  const { data, isLoading, error, refetch } = useAsyncData(researcherDashboardRequested, researcherDashboardSelectors.selectState);

  // Extract data with defaults
  const metrics = data?.metrics || [];
  const recentReports = data?.recentReports || [];
  const trendingTopics = data?.trendingTopics || [];

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
      loadingMessage="Loading researcher dashboard…"
      errorTitle="Failed to load researcher dashboard"
      isEmpty={() => false}
    >
      {() => (
        <RoleDashboardLayout
          title="Research Hub"
          description="Analytics, market trends, and benchmarking"
          metrics={metricItems}
          actions={(
            <>
              <Button variant="bordered" startContent={<Search className="w-4 h-4" />}>
                Query Data
              </Button>
              <Button color="primary" startContent={<FileText className="w-4 h-4" />}>
                New Report
              </Button>
            </>
          )}
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" padding="md">
              <SectionHeader
                title="Recent Reports"
                titleClassName="font-medium"
                action={<Button size="sm" variant="light">View All</Button>}
                className="mb-4"
              />
               <div className="space-y-4">
                 {recentReports.map((report, idx) => (
                  <ListItemCard
                    key={idx}
                    padding="sm"
                    className="rounded-lg border border-[var(--app-border-subtle)]"
                    icon={(
                      <div className="w-10 h-10 rounded-lg bg-[var(--app-primary-bg)] flex items-center justify-center text-[var(--app-primary)]">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    title={report.name}
                    description={`${report.type} Report • ${report.date}`}
                    actions={(
                      <div className="flex items-center gap-3">
                        <Badge variant="flat" color={report.status === 'Published' ? 'success' : 'warning'}>
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="light" isIconOnly aria-label={`Download ${report.name}`}>
                          <Download className="w-4 h-4" />
                        </Button>
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
                    <TrendingUp className="w-5 h-5 text-[var(--app-primary)]" />
                    Trending Topics
                  </span>
                )}
                titleClassName="font-medium"
                className="mb-4"
              />
              <div className="space-y-3">
                {trendingTopics.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                     <div>
                       <div className="text-sm font-medium">{item.topic}</div>
                       <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.sentiment === 'Hot' ? 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]' :
                          item.sentiment === 'Rising' ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]' :
                            item.sentiment === 'Mixed' ? 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]' :
                              'bg-[var(--app-neutral-bg)] text-[var(--app-neutral)]'
                       }`}>
                         {item.sentiment}
                       </span>
                     </div>
                    <span className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
                       {item.change}
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
