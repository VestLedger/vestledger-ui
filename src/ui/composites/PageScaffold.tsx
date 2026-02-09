'use client'

import type { ReactNode } from 'react';
import { PageContainer, Breadcrumb, PageHeader } from '@/ui';
import type { BreadcrumbItem, AISuggestion, PageHeaderProps, PageContainerProps } from '@/ui';
import { getRouteConfig } from '@/config/routes';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

export interface PageScaffoldProps {
  routePath?: string;
  breadcrumbs?: BreadcrumbItem[];
  aiSuggestion?: AISuggestion;
  header: PageHeaderProps;
  toolbar?: ReactNode;
  containerProps?: Omit<PageContainerProps, 'children'>;
  children: ReactNode;
}

export function PageScaffold({
  routePath,
  breadcrumbs,
  aiSuggestion,
  header,
  toolbar,
  containerProps,
  children,
}: PageScaffoldProps) {
  const density = useDashboardDensity();
  const routeConfig = routePath ? getRouteConfig(routePath) : undefined;
  const resolvedBreadcrumbs = breadcrumbs ?? routeConfig?.breadcrumbs;
  const resolvedSuggestion = aiSuggestion ?? routeConfig?.aiSuggestion;
  const contentId = 'page-content';

  const resolvedHeader: PageHeaderProps = {
    ...header,
    description: header.description ?? routeConfig?.description,
  };

  return (
    <PageContainer {...containerProps}>
      <a
        href={`#${contentId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--app-surface)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--app-text)] focus:shadow-lg"
      >
        Skip to content
      </a>
      {resolvedBreadcrumbs && resolvedBreadcrumbs.length > 0 && (
        <Breadcrumb items={resolvedBreadcrumbs} aiSuggestion={resolvedSuggestion} />
      )}

      <PageHeader {...resolvedHeader} />

      {toolbar && (
        <div className={density.mode === 'compact' ? 'mt-3' : 'mt-4'}>
          {toolbar}
        </div>
      )}

      <div id={contentId} tabIndex={-1}>
        {children}
      </div>
    </PageContainer>
  );
}
