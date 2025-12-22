'use client'

import type { ReactNode } from 'react';
import { PageContainer, Breadcrumb, PageHeader } from '@/ui';
import type { BreadcrumbItem, AISuggestion, PageHeaderProps, PageContainerProps } from '@/ui';
import { getRouteConfig } from '@/config/routes';

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
  const routeConfig = routePath ? getRouteConfig(routePath) : undefined;
  const resolvedBreadcrumbs = breadcrumbs ?? routeConfig?.breadcrumbs;
  const resolvedSuggestion = aiSuggestion ?? routeConfig?.aiSuggestion;

  const resolvedHeader: PageHeaderProps = {
    ...header,
    description: header.description ?? routeConfig?.description,
  };

  return (
    <PageContainer {...containerProps}>
      {resolvedBreadcrumbs && resolvedBreadcrumbs.length > 0 && (
        <Breadcrumb items={resolvedBreadcrumbs} aiSuggestion={resolvedSuggestion} />
      )}

      <PageHeader {...resolvedHeader} />

      {toolbar && (
        <div className="mt-4">
          {toolbar}
        </div>
      )}

      {children}
    </PageContainer>
  );
}
