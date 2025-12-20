export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'default';
export type NotificationCategory = 'deal' | 'lp' | 'document' | 'calendar' | 'alert' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

