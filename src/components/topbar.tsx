'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, User, ChevronDown, LogOut, HelpCircle, Sparkles, TrendingUp, FileText, Building2, Users, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useFund } from '@/contexts/fund-context';
import { Button, Badge, Card, Input } from '@/ui';
import { useRouter } from 'next/navigation';
import { useAICopilot } from './ai-copilot-sidebar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAlerts, markAlertRead } from '@/store/slices/alertsSlice';

type SearchResultType = 'deal' | 'company' | 'document' | 'contact' | 'action' | 'ai-suggestion';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  category?: string;
  confidence?: number;
  icon?: any;
  action?: () => void;
}

export function Topbar() {
  const { user, logout } = useAuth();
  const { selectedFund } = useFund();
  const router = useRouter();
  const { openWithQuery } = useAICopilot();
  const dispatch = useAppDispatch();
  const { items: notifications } = useAppSelector((state) => state.alerts);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // AI-powered search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate AI-powered search with smart suggestions
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Natural language detection
    if (query.includes('show') || query.includes('find') || query.includes('get')) {
      // AI understands intent
      if (query.includes('deal') || query.includes('pipeline')) {
        results.push({
          id: 'ai-1',
          type: 'ai-suggestion',
          title: 'Navigate to Deal Pipeline',
          description: 'AI detected: You want to view deals',
          confidence: 0.95,
          icon: Sparkles,
          action: () => router.push('/pipeline')
        });
      }
      if (query.includes('portfolio') || query.includes('companies')) {
        results.push({
          id: 'ai-2',
          type: 'ai-suggestion',
          title: 'Navigate to Portfolio',
          description: 'AI detected: You want to view portfolio companies',
          confidence: 0.92,
          icon: Sparkles,
          action: () => router.push('/portfolio')
        });
      }
      if (query.includes('report') || query.includes('analytics')) {
        results.push({
          id: 'ai-3',
          type: 'ai-suggestion',
          title: 'Navigate to Analytics',
          description: 'AI detected: You want to view reports or analytics',
          confidence: 0.88,
          icon: Sparkles,
          action: () => router.push('/analytics')
        });
      }
    }

    // Mock deal results
    if (query.includes('quantum') || query.includes('ai') || query.includes('series')) {
      results.push({
        id: 'deal-1',
        type: 'deal',
        title: 'Quantum AI - Series A',
        description: '$5M • SaaS • 85% probability',
        category: 'Active Deal',
        icon: TrendingUp
      });
    }

    // Mock company results
    if (query.includes('data') || query.includes('sync')) {
      results.push({
        id: 'company-1',
        type: 'company',
        title: 'DataSync Pro',
        description: 'Series B • Portfolio Company',
        category: 'Portfolio',
        icon: Building2
      });
    }

    // Mock document results
    if (query.includes('dd') || query.includes('due diligence') || query.includes('doc')) {
      results.push({
        id: 'doc-1',
        type: 'document',
        title: 'Due Diligence Checklist - Quantum AI',
        description: 'Updated 2 days ago',
        category: 'Document',
        icon: FileText
      });
    }

    // AI quick actions
    if (query.includes('create') || query.includes('new') || query.includes('add')) {
      results.push({
        id: 'action-1',
        type: 'action',
        title: 'Create New Deal',
        description: 'Quick action',
        icon: DollarSign,
        action: () => {
          // Navigate to create deal
          router.push('/pipeline?action=create');
        }
      });
    }

    // Time-based queries
    if (query.includes('today') || query.includes('this week') || query.includes('recent')) {
      results.push({
        id: 'ai-4',
        type: 'ai-suggestion',
        title: 'Recent Activity',
        description: 'Show deals and updates from the past week',
        confidence: 0.90,
        icon: Clock,
        action: () => router.push('/dashboard')
      });
    }

    setSearchResults(results.slice(0, 6)); // Limit to top 6 results
  }, [searchQuery, router]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResultIcon = (result: SearchResult) => {
    const Icon = result.icon || Search;
    return <Icon className="w-4 h-4" />;
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.action) {
      result.action();
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <div className="py-4 px-4 sm:px-6 border-b border-[var(--app-border)] bg-[var(--app-surface)] flex items-center justify-between sticky top-0 z-30" style={{ height: '69px' }}>
      {/* Left: AI-Powered Search */}
      <div className="flex items-center flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Ask Vesta anything... (e.g., 'show me active deals', 'find Quantum AI')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                openWithQuery(searchQuery);
                setSearchQuery('');
                setIsSearchFocused(false);
              }
            }}
            startContent={
              searchQuery && searchResults.some(r => r.type === 'ai-suggestion') ? (
                <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
              ) : (
                <Search className="w-4 h-4 text-[var(--app-text-subtle)]" />
              )
            }
            size="sm"
            className="w-full"
            classNames={{
              inputWrapper: searchResults.length > 0 && isSearchFocused
                ? "bg-[var(--app-surface-hover)] ring-2 ring-[var(--app-primary)]"
                : "bg-[var(--app-surface-hover)]"
            }}
          />

          {/* AI Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
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
          {isSearchFocused && searchQuery && searchResults.length === 0 && (
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
                    {notifications.length === 0 && (
                      <div className="px-4 py-6 text-center text-[var(--app-text-muted)] text-sm">
                        No notifications yet
                      </div>
                    )}
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={`w-full px-4 py-3 text-left hover:bg-[var(--app-surface-hover)] transition-colors border-b border-[var(--app-border)] last:border-0 ${
                          notification.unread ? 'bg-[var(--app-primary-bg)]' : ''
                        }`}
                        onClick={() => {
                          if (notification.unread) {
                            dispatch(markAlertRead(notification.id));
                          }
                        }}
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
