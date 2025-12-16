'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, LogOut, Sparkles, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button, Badge, Card, Input } from '@/ui';
import { useRouter } from 'next/navigation';
import { useAICopilot } from './ai-copilot-sidebar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAlerts, markAlertRead } from '@/store/slices/alertsSlice';
import { NotificationCenter } from '@/components/notification-center';
import type { Notification } from '@/types/notification';
import { useTheme } from 'next-themes';
import { searchTopbar, type TopbarSearchResult } from '@/services/topbarSearchService';
import { useUIKey } from '@/store/ui';

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { openWithQuery } = useAICopilot();
  const dispatch = useAppDispatch();
  const { items: reduxNotifications } = useAppSelector((state) => state.alerts);
  const { theme, setTheme } = useTheme();
  const { value: topbarUI, patch: patchTopbarUI } = useUIKey('topbar', {
    isProfileOpen: false,
    searchQuery: '',
    isSearchFocused: false,
  });
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Convert Redux alerts to Notification format
  const notifications: Notification[] = reduxNotifications.map((alert) => ({
    id: alert.id,
    type: alert.type === 'alert' ? 'warning' : 'info',
    category: alert.type === 'deal' ? 'deal' : alert.type === 'report' ? 'document' : 'alert',
    title: alert.title,
    message: alert.message,
    timestamp: new Date(alert.time || Date.now()),
    read: !alert.unread,
  }));

  const handleMarkAsRead = (id: string) => {
    dispatch(markAlertRead(id));
  };

  const handleMarkAllAsRead = () => {
    reduxNotifications.forEach((notif) => {
      if (notif.unread) {
        dispatch(markAlertRead(notif.id));
      }
    });
  };

  const searchResults = useMemo(
    () => searchTopbar(topbarUI.searchQuery),
    [topbarUI.searchQuery]
  );

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        patchTopbarUI({ isSearchFocused: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [patchTopbarUI]);

  const getResultIcon = (result: TopbarSearchResult) => {
    const Icon = result.icon || Search;
    return <Icon className="w-4 h-4" />;
  };

  const handleResultClick = (result: TopbarSearchResult) => {
    if (result.href) {
      router.push(result.href);
    }
    patchTopbarUI({ searchQuery: '', isSearchFocused: false });
  };

  return (
    <div
      className="py-4 px-4 sm:px-6 border-b border-[var(--app-border)] flex items-center justify-between sticky top-0 z-30"
      style={{
        height: '69px',
        background: 'linear-gradient(90deg, transparent 0%, var(--app-primary-bg) 55%, var(--app-primary-bg) 100%)'
      }}
    >
      {/* Left: AI-Powered Search */}
      <div className="flex items-center flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Ask Vesta anything... (e.g., 'show me active deals', 'find Quantum AI')"
            value={topbarUI.searchQuery}
            onChange={(e) => patchTopbarUI({ searchQuery: e.target.value })}
            onFocus={() => patchTopbarUI({ isSearchFocused: true })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && topbarUI.searchQuery.trim()) {
                openWithQuery(topbarUI.searchQuery);
                patchTopbarUI({ searchQuery: '', isSearchFocused: false });
              }
            }}
            startContent={
              topbarUI.searchQuery && searchResults.some(r => r.type === 'ai-suggestion') ? (
                <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
              ) : (
                <Search className="w-4 h-4 text-[var(--app-text-subtle)]" />
              )
            }
            className="w-full"
            classNames={{
              inputWrapper: searchResults.length > 0 && topbarUI.isSearchFocused
                ? "bg-[var(--app-surface-hover)] ring-2 ring-[var(--app-primary)]"
                : "bg-[var(--app-surface-hover)]"
            }}
          />

          {/* AI Search Results Dropdown */}
          {topbarUI.isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <Card padding="none" className="shadow-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-[var(--app-surface-hover)] transition-colors border-b border-[var(--app-border)] last:border-0 flex items-start gap-3"
                    >
                      <div className={`mt-0.5 ${result.type === 'ai-suggestion' ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'}`}>
                        {getResultIcon(result)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{result.title}</span>
                          {result.confidence && (
                            <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)] text-xs">
                              {Math.round(result.confidence * 100)}% match
                            </Badge>
                          )}
                        </div>
                        {result.description && (
                          <p className="text-xs text-[var(--app-text-muted)] truncate">{result.description}</p>
                        )}
                        {result.category && (
                          <span className="text-xs text-[var(--app-text-subtle)]">{result.category}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 bg-[var(--app-surface-hover)] border-t border-[var(--app-border)] flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[var(--app-primary)]" />
                  <span className="text-xs text-[var(--app-text-muted)]">
                    Press Enter to ask Vesta • Natural language queries
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* No results message */}
          {topbarUI.isSearchFocused && topbarUI.searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <Card padding="md" className="shadow-lg">
                <div className="text-center py-4 text-[var(--app-text-muted)]">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No quick results found</p>
                  <p className="text-xs mt-1">Press Enter to ask Vesta for help</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme Toggle */}
        <Button
          variant="light"
          isIconOnly
          onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications - Using new NotificationCenter component */}
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* User Profile Dropdown */}
        <div className="relative">
          <Button
            variant="flat"
            className="gap-2"
            endContent={<ChevronDown className={`w-4 h-4 transition-transform ${topbarUI.isProfileOpen ? 'rotate-180' : ''}`} />}
            onPress={() => patchTopbarUI({ isProfileOpen: !topbarUI.isProfileOpen })}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--app-primary)] flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium">{user?.name || 'User'}</span>
            </div>
          </Button>

          {/* Profile Dropdown */}
          {topbarUI.isProfileOpen && (
            <>
              <div className="absolute right-0 top-full mt-2 w-64 z-50">
                <Card padding="sm" className="shadow-lg">
                  {/* User Info */}
                  <button
                    onClick={() => {
                      router.push('/settings');
                      patchTopbarUI({ isProfileOpen: false });
                    }}
                    className="w-full text-left px-3 py-3 border-b border-[var(--app-border)] mb-2 hover:bg-[var(--app-surface-hover)] transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--app-primary)] flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-[var(--app-text-muted)] truncate">{user?.email || 'user@example.com'}</div>
                      </div>
                    </div>
                  </button>

                  {/* Menu Items */}
                  <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm hover:bg-[var(--app-danger-bg)] text-[var(--app-danger)] transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                  </button>
                </Card>
              </div>
              <div className="fixed inset-0 z-40" onClick={() => patchTopbarUI({ isProfileOpen: false })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
