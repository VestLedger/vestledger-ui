'use client';

import { useState } from 'react';
import { Search, Bell, Settings, User, ChevronDown, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useFund } from '@/contexts/fund-context';
import { Button, Badge, Card, Input } from '@/ui';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { user, logout } = useAuth();
  const { selectedFund } = useFund();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Mock notifications
  const notifications = [
    { id: 1, type: 'deal', title: 'New deal added to pipeline', message: 'Quantum AI - Series A', time: '5m ago', unread: true },
    { id: 2, type: 'report', title: 'Q3 Report uploaded', message: 'DataSync Pro submitted quarterly report', time: '2h ago', unread: true },
    { id: 3, type: 'alert', title: 'Due diligence deadline', message: 'NeuroLink DD checklist due in 2 days', time: '1d ago', unread: false },
    { id: 4, type: 'system', title: 'System update', message: 'New analytics features available', time: '3d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="h-16 border-b border-[var(--app-border)] bg-[var(--app-surface)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Left: Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <Input
          type="text"
          placeholder="Search deals, companies, documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
          size="sm"
          className="w-full"
          classNames={{
            inputWrapper: "bg-[var(--app-surface-hover)]"
          }}
        />
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-2 ml-4">
        {/* Quick Actions */}
        <Button
          variant="light"
          size="sm"
          isIconOnly
          className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] relative"
            onPress={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--app-danger)] text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <>
              <div className="absolute right-0 top-full mt-2 w-80 z-50">
                <Card padding="none" className="shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--app-border)] flex items-center justify-between">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={`w-full px-4 py-3 text-left hover:bg-[var(--app-surface-hover)] transition-colors border-b border-[var(--app-border)] last:border-0 ${
                          notification.unread ? 'bg-[var(--app-primary-bg)]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">{notification.title}</span>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-[var(--app-primary)] flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">{notification.message}</p>
                        <span className="text-xs text-[var(--app-text-subtle)]">{notification.time}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-[var(--app-border)] text-center">
                    <button className="text-sm text-[var(--app-primary)] hover:underline">
                      View all notifications
                    </button>
                  </div>
                </Card>
              </div>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
            </>
          )}
        </div>

        {/* Settings */}
        <Button
          variant="light"
          size="sm"
          isIconOnly
          className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <Button
            variant="flat"
            size="sm"
            className="gap-2"
            endContent={<ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />}
            onPress={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--app-primary)] flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium">{user?.name || 'User'}</span>
              {selectedFund && (
                <span className="text-xs text-[var(--app-text-subtle)]">{selectedFund.displayName}</span>
              )}
            </div>
          </Button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div className="absolute right-0 top-full mt-2 w-64 z-50">
                <Card padding="sm" className="shadow-lg">
                  {/* User Info */}
                  <div className="px-3 py-3 border-b border-[var(--app-border)] mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--app-primary)] flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-[var(--app-text-muted)] truncate">{user?.email || 'user@example.com'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <button className="w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-[var(--app-surface-hover)] transition-colors flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button className="w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-[var(--app-surface-hover)] transition-colors flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                    <button className="w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-[var(--app-surface-hover)] transition-colors flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="border-t border-[var(--app-border)] mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-[var(--app-danger-bg)] text-[var(--app-danger)] transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </Card>
              </div>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
