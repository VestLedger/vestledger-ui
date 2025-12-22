'use client'

import { useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge, Select } from '@/ui';
import type { PageHeaderBadge } from '@/ui';
import { ListItemCard, PageScaffold } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { alertsRequested, alertsSelectors, markAlertRead } from '@/store/slices/alertsSlice';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-states';
import { useUIKey } from '@/store/ui';

type NotificationFilter = 'all' | 'unread' | 'alert' | 'deal' | 'report' | 'system';

type NotificationsUIState = {
  selectedFilter?: NotificationFilter;
  selectedTab?: NotificationFilter;
};

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

export function Notifications() {
  const dispatch = useAppDispatch();
  const alertsData = useAppSelector(alertsSelectors.selectData);
  const alertsStatus = useAppSelector(alertsSelectors.selectStatus);
  const alertsError = useAppSelector(alertsSelectors.selectError);
  const reduxNotifications = alertsData?.items || [];
  const { value: ui, patch: patchUI } = useUIKey<NotificationsUIState>('notifications', { selectedFilter: 'all' });
  const selectedFilter = (ui.selectedFilter ?? ui.selectedTab ?? 'all') as NotificationFilter;

  useEffect(() => {
    dispatch(alertsRequested({}));
  }, [dispatch]);

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
      category: alert.type,
      type,
      title: alert.title,
      message: alert.message,
      timestamp: new Date(alert.time || Date.now()),
      read: !alert.unread,
    };
  });

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const alertCount = notifications.filter((notification) => notification.category === 'alert').length;
  const dealCount = notifications.filter((notification) => notification.category === 'deal').length;
  const reportCount = notifications.filter((notification) => notification.category === 'report').length;
  const systemCount = notifications.filter((notification) => notification.category === 'system').length;

  const badges: PageHeaderBadge[] = [
    {
      label: `${totalCount} total`,
      size: 'md',
      variant: 'bordered',
      className: 'text-[var(--app-text-muted)] border-[var(--app-border)]',
    },
  ];

  if (unreadCount > 0) {
    badges.push({
      label: `${unreadCount} unread`,
      size: 'md',
      variant: 'flat',
      className: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]',
    });
  }

  if (alertCount > 0) {
    badges.push({
      label: `${alertCount} alerts`,
      size: 'md',
      variant: 'bordered',
      className: 'text-[var(--app-warning)] border-[var(--app-warning)]',
    });
  }

  if (systemCount > 0) {
    badges.push({
      label: `${systemCount} system`,
      size: 'md',
      variant: 'bordered',
      className: 'text-[var(--app-info)] border-[var(--app-info)]',
    });
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === 'all') {
      return true;
    }
    if (selectedFilter === 'unread') {
      return !notification.read;
    }
    return notification.category === selectedFilter;
  });

  const emptyStateTitle = selectedFilter === 'all' ? 'No notifications yet' : 'No notifications for this filter';
  const emptyStateMessage = selectedFilter === 'all'
    ? "You're all caught up."
    : 'Try a different filter or check back later.';
  const aiSummaryText = totalCount === 0
    ? 'Inbox cleared. No new alerts, reports, or system updates.'
    : `${unreadCount} unread notifications. ${alertCount} alerts need review. ${dealCount} deal updates, ${reportCount} reports, and ${systemCount} system messages in the feed.`;

  return (
    <PageScaffold
      routePath="/notifications"
      header={{
        title: 'Notifications',
        description: 'All alerts, reminders, and system updates in one place',
        icon: Bell,
        aiSummary: {
          text: aiSummaryText,
          confidence: 0.86,
        },
        actionContent: (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--app-text-muted)]">Filter</span>
            <Select
              aria-label="Filter notifications"
              size="sm"
              className="w-48"
              selectedKeys={[selectedFilter]}
              onChange={(event) => patchUI({ selectedFilter: event.target.value as NotificationFilter })}
              disallowEmptySelection
              options={[
                { value: 'all', label: `All notifications (${totalCount})` },
                { value: 'unread', label: `Unread (${unreadCount})` },
                { value: 'alert', label: `Alerts (${alertCount})` },
                { value: 'deal', label: `Deals (${dealCount})` },
                { value: 'report', label: `Reports (${reportCount})` },
                { value: 'system', label: `System (${systemCount})` },
              ]}
            />
          </div>
        ),
        badges,
      }}
    >
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
        {alertsStatus === 'succeeded' && filteredNotifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title={emptyStateTitle}
            message={emptyStateMessage}
          />
        )}
        {filteredNotifications.map((notification) => (
          <ListItemCard
            key={notification.id}
            icon={getIcon(notification.type)}
            title={notification.title}
            description={notification.message}
            meta={notification.timestamp.toLocaleString()}
            badges={
              !notification.read ? (
                <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                  New
                </Badge>
              ) : null
            }
            actions={
              !notification.read ? (
                <button
                  onClick={() => dispatch(markAlertRead(notification.id))}
                  className="text-xs text-[var(--app-primary)] hover:underline"
                >
                  Mark as read
                </button>
              ) : null
            }
          />
        ))}
      </div>
    </PageScaffold>
  );
}
