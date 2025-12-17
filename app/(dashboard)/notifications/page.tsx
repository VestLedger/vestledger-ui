'use client'

import { useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PageContainer, PageHeader, Card, Badge, Breadcrumb } from '@/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { alertsRequested, markAlertRead } from '@/store/slices/alertsSlice';
import { getRouteConfig } from '@/config/routes';

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
  const reduxNotifications = useAppSelector((state) => state.alerts.data?.items || []);

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
        {notifications.length === 0 && (
          <Card padding="md" className="text-[var(--app-text-muted)]">No notifications yet.</Card>
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
