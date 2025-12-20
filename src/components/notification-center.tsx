'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/ui';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import type { Notification, NotificationCategory, NotificationType } from '@/types/notification';
import { useUIKey } from '@/store/ui';

export interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  maxHeight?: string;
}

const getNotificationIcon = (type: NotificationType) => {
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

const getCategoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'deal':
      return <TrendingUp className="w-4 h-4" />;
    case 'lp':
      return <Users className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'calendar':
      return <Calendar className="w-4 h-4" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getRelativeTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
};

export function NotificationCenter({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  maxHeight = '32rem',
}: NotificationCenterProps) {
  const router = useRouter();
  const { value: ui, patch: patchUI } = useUIKey('notification-center', { isOpen: false });
  const { isOpen } = ui;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        patchUI({ isOpen: false });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, patchUI]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => patchUI({ isOpen: !isOpen })}
        className="relative p-2 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[var(--app-text-muted)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--app-danger)] opacity-75" />
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--app-danger)] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge size="sm" variant="solid" className="bg-[var(--app-danger)] text-white">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={onMarkAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
                {onClearAll && notifications.length > 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={onClearAll}
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-[var(--app-text-subtle)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--app-text-muted)]">
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 border-b border-[var(--app-border)] hover:bg-[var(--app-surface-hover)] transition-colors cursor-pointer ${
                      !notification.read ? 'bg-[var(--app-primary-bg)]/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-[var(--app-text)]">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-[var(--app-primary)] flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--app-text-subtle)]">
                              {getRelativeTime(notification.timestamp)}
                            </span>
                            <span className="text-xs text-[var(--app-text-subtle)]">•</span>
                            <div className="flex items-center gap-1 text-xs text-[var(--app-text-subtle)]">
                              {getCategoryIcon(notification.category)}
                              <span className="capitalize">{notification.category}</span>
                            </div>
                          </div>
                          {notification.actionLabel && (
                            <span className="text-xs font-medium text-[var(--app-primary)]">
                              {notification.actionLabel} →
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && onMarkAsRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-[var(--app-surface-hover)] rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="p-1 hover:bg-[var(--app-surface-hover)] rounded"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[var(--app-border)] bg-[var(--app-surface-hover)]">
                <button
                  onClick={() => {
                    patchUI({ isOpen: false });
                    router.push('/notifications');
                  }}
                  className="w-full text-center text-sm font-medium text-[var(--app-primary)] hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
