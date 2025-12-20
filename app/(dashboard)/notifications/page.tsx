'use client'

import { useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PageContainer, PageHeader, Card, Badge, Breadcrumb } from '@/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { alertsRequested, alertsSelectors, markAlertRead } from '@/store/slices/alertsSlice';
import { getRouteConfig } from '@/config/routes';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-[var(--app-success)]" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-[var(--app-warning)]" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-[var(--app-danger)]" />;
    case 'info':
      return <Info className="w-5 h-5 text-[var(--app-info)]" />;
    default:
      return <Bell className="w-5 h-5 text-[var(--app-text-muted)]" />;
  }
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const alertsData = useAppSelector(alertsSelectors.selectData);
  const alertsStatus = useAppSelector(alertsSelectors.selectStatus);
  const alertsError = useAppSelector(alertsSelectors.selectError);
  const reduxNotifications = alertsData?.items || [];

  useEffect(() => {
    dispatch(alertsRequested({}));
  }, [dispatch]);

  const routeConfig = getRouteConfig('/notifications');

  const notifications = reduxNotifications.map((alert) => {
    const type =
      alert.type === 'alert'
        ? 'warning'
        : alert.type === 'report'
        ? 'info'
        : alert.type === 'deal'
        ? 'info'
        : 'info';

    return {
      id: alert.id,
      type,
      title: alert.title,
      message: alert.message,
      timestamp: new Date(alert.time || Date.now()),
      read: !alert.unread,
    };
  });

  return (
    <PageContainer>
      {routeConfig && (
        <Breadcrumb
          items={routeConfig.breadcrumbs}
          aiSuggestion={routeConfig.aiSuggestion}
        />
      )}

      <PageHeader
        title="Notifications"
        description="All alerts, reminders, and system updates in one place"
        icon={Bell}
      />

      <div className="space-y-3">
        {alertsStatus === 'loading' && (
          <LoadingState message="Loading notifications…" fullHeight={false} />
        )}
        {alertsStatus === 'failed' && alertsError && (
          <ErrorState
            error={alertsError}
            title="Failed to load notifications"
            onRetry={() => dispatch(alertsRequested({}))}
          />
        )}
        {alertsStatus === 'succeeded' && notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            message="You're all caught up."
          />
        )}
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            padding="md"
            className="flex items-start justify-between gap-3 border-[var(--app-border)]"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{notification.title}</h3>
                  {!notification.read && (
                    <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--app-text-muted)] mt-1">{notification.message}</p>
                <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                  {notification.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
            {!notification.read && (
              <button
                onClick={() => dispatch(markAlertRead(notification.id))}
                className="text-xs text-[var(--app-primary)] hover:underline"
              >
                Mark as read
              </button>
            )}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
