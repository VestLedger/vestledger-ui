'use client';

import type { ReactNode } from 'react';
import { PageContainer } from '@/ui';
import { MetricsGrid } from './MetricsGrid';
import type { MetricsGridItem, MetricsGridProps } from './MetricsGrid';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

export interface RoleDashboardLayoutProps {
  title: string;
  description: string;
  actions?: ReactNode;
  metrics: MetricsGridItem[];
  metricsColumns?: MetricsGridProps['columns'];
  beforeMetrics?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function RoleDashboardLayout({
  title,
  description,
  actions,
  metrics,
  metricsColumns = { base: 1, sm: 2, lg: 4 },
  beforeMetrics,
  children,
  className,
}: RoleDashboardLayoutProps) {
  const density = useDashboardDensity();
  const resolvedClassName = className ?? density.page.sectionStackClass;
  const titleClassName = density.mode === 'compact'
    ? 'text-xl sm:text-2xl font-bold'
    : 'text-2xl sm:text-3xl font-bold';

  return (
    <PageContainer className={resolvedClassName}>
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${density.mode === 'compact' ? 'gap-3' : 'gap-4'}`}>
        <div>
          <h2 className={titleClassName}>{title}</h2>
          <p className="text-sm text-[var(--app-text-muted)]">{description}</p>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {beforeMetrics}

      <MetricsGrid
        items={metrics}
        columns={metricsColumns}
      />

      {children}
    </PageContainer>
  );
}
