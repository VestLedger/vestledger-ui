'use client';

import { useUIKey } from '@/store/ui';
import { Card, Button, Badge, Input } from '@/ui';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Search,
  Plus,
} from 'lucide-react';

export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'other';
export type EventType = 'meeting' | 'call' | 'conference' | 'site-visit' | 'other';
export type CaptureStatus = 'pending' | 'captured' | 'ignored' | 'failed';

export interface CalendarAccount {
  id: string;
  email: string;
  provider: CalendarProvider;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: Date;
  autoCapture: boolean;
  captureRules: CaptureRule[];
  syncedCalendars: string[];
  errorMessage?: string;
}

export interface CaptureRule {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;

  // Matching Criteria
  attendeeDomains?: string[]; // e.g., ["investor.com", "lp.com"]
  attendeeEmails?: string[];
  keywordsInTitle?: string[];
  keywordsInDescription?: string[];
  eventTypes?: EventType[];
  minDuration?: number; // minutes
  maxDuration?: number; // minutes

  // Actions
  autoCreateInteraction: boolean;
  autoCategorize: boolean;
  categoryMapping?: { [key: string]: string }; // keyword -> category
  autoLinkToContact: boolean;
  autoLinkToDeal: boolean;
  notifyOnCapture: boolean;
  notifyUsers?: string[];
}

export interface CalendarEvent {
  id: string;
  calendarAccountId: string;
  provider: CalendarProvider;

  // Event Details
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;

  // Participants
  organizer: string;
  attendees: EventAttendee[];

  // Capture Status
  captureStatus: CaptureStatus;
  capturedDate?: Date;
  captureRuleId?: string;
  captureRuleName?: string;

  // Auto-linking
  linkedContactIds: string[];
  linkedContactNames: string[];
  linkedDealIds: string[];
  linkedDealNames: string[];
  linkedFundIds: string[];
  linkedFundNames: string[];

  // Categorization
  eventType: EventType;
  category?: string;
  tags: string[];

  // Interaction Data (if captured)
  interactionId?: string;
  outcome?: 'positive' | 'neutral' | 'negative';
  notes?: string;

  // Metadata
  isRecurring: boolean;
  recurrencePattern?: string;
  isCancelled: boolean;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'needs-action';
}

export interface EventAttendee {
  email: string;
  name?: string;
  responseStatus: 'accepted' | 'tentative' | 'declined' | 'needs-action';
  isOrganizer: boolean;
  isOptional: boolean;
}

export interface CalendarSync {
  id: string;
  calendarAccountId: string;
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'failed';
  eventsScanned: number;
  eventsCaptured: number;
  eventsIgnored: number;
  eventsFailed: number;
  errorMessage?: string;
}

interface CalendarIntegrationProps {
  accounts: CalendarAccount[];
  events: CalendarEvent[];
  syncs?: CalendarSync[];
  onConnectCalendar?: (provider: CalendarProvider) => void;
  onDisconnectCalendar?: (accountId: string) => void;
  onSyncCalendar?: (accountId: string) => void;
  onConfigureRules?: (accountId: string) => void;
  onToggleAutoCapture?: (accountId: string) => void;
  onCaptureEvent?: (eventId: string) => void;
  onIgnoreEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onCreateEvent?: () => void;
  onExportEvents?: (format: 'csv' | 'ical') => void;
}

export function CalendarIntegration({
  accounts,
  events,
  syncs = [],
  onConnectCalendar,
  onDisconnectCalendar,
  onSyncCalendar,
  onConfigureRules,
  onToggleAutoCapture,
  onCaptureEvent,
  onIgnoreEvent,
  onEditEvent,
  onCreateEvent,
  onExportEvents,
}: CalendarIntegrationProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    searchQuery: string;
    filterStatus: CaptureStatus | 'all';
    filterType: EventType | 'all';
    dateRange: 'upcoming' | 'past-week' | 'past-month' | 'all';
  }>('calendar-integration', {
    searchQuery: '',
    filterStatus: 'all',
    filterType: 'all',
    dateRange: 'upcoming',
  });
  const { searchQuery, filterStatus, filterType, dateRange } = ui;

  const getProviderBadge = (provider: CalendarProvider) => {
    const colors = {
      'google': 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]',
      'outlook': 'bg-[var(--app-info-bg)] text-[var(--app-info)]',
      'apple': 'bg-[var(--app-text-muted)]/20 text-[var(--app-text)]',
      'other': 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]',
    };

    return (
      <Badge size="sm" variant="flat" className={colors[provider]}>
        {provider === 'google' ? 'Google Calendar' : provider === 'outlook' ? 'Outlook' : provider}
      </Badge>
    );
  };

  const getStatusBadge = (status: CalendarAccount['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'syncing':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      case 'error':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]">
            Disconnected
          </Badge>
        );
    }
  };

  const getCaptureStatusBadge = (status: CaptureStatus) => {
    switch (status) {
      case 'captured':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Captured
          </Badge>
        );
      case 'pending':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'ignored':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]">
            Ignored
          </Badge>
        );
      case 'failed':
        return (
          <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filterByDateRange = (event: CalendarEvent) => {
    const now = new Date();
    const eventDate = new Date(event.startTime);

    switch (dateRange) {
      case 'upcoming':
        return eventDate >= now;
      case 'past-week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return eventDate >= weekAgo && eventDate < now;
      case 'past-month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return eventDate >= monthAgo && eventDate < now;
      case 'all':
        return true;
    }
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.attendees.some(a => a.email.toLowerCase().includes(searchQuery.toLowerCase()) || a.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.linkedContactNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || event.captureStatus === filterStatus;
      const matchesType = filterType === 'all' || event.eventType === filterType;
      const matchesDateRange = filterByDateRange(event);
      const notCancelled = !event.isCancelled;

      return matchesSearch && matchesStatus && matchesType && matchesDateRange && notCancelled;
    })
    .sort((a, b) => {
      if (dateRange === 'upcoming') {
        return a.startTime.getTime() - b.startTime.getTime();
      }
      return b.startTime.getTime() - a.startTime.getTime();
    });

  // Calculate stats
  const totalConnected = accounts.filter(a => a.status === 'connected').length;
  const autoCaptureEnabled = accounts.filter(a => a.autoCapture).length;
  const pendingCapture = events.filter(e => e.captureStatus === 'pending').length;
  const capturedToday = events.filter(e => {
    if (!e.capturedDate) return false;
    const today = new Date();
    return e.capturedDate.toDateString() === today.toDateString();
  }).length;

  const latestSync = syncs.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

  return (
    <div className="space-y-4">
      {/* Header & Stats */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Calendar Integration</h3>
          </div>
          <div className="flex items-center gap-2">
            {onCreateEvent && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Plus className="w-3 h-3" />}
                onPress={onCreateEvent}
              >
                New Event
              </Button>
            )}
            {onConnectCalendar && (
              <Button
                size="sm"
                color="primary"
                startContent={<LinkIcon className="w-4 h-4" />}
                onPress={() => onConnectCalendar('google')}
              >
                Connect Calendar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-[var(--app-success-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Connected</p>
            <p className="text-2xl font-bold text-[var(--app-success)]">{totalConnected}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-primary-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Auto-Capture On</p>
            <p className="text-2xl font-bold text-[var(--app-primary)]">{autoCaptureEnabled}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-warning-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Pending Capture</p>
            <p className="text-2xl font-bold text-[var(--app-warning)]">{pendingCapture}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-info-bg)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Captured Today</p>
            <p className="text-2xl font-bold text-[var(--app-info)]">{capturedToday}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
            <p className="text-xs font-medium text-[var(--app-text-muted)] mb-1">Total Events</p>
            <p className="text-2xl font-bold">{filteredEvents.length}</p>
          </div>
        </div>

        {/* Latest Sync Status */}
        {latestSync && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--app-surface-hover)]">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${latestSync.status === 'running' ? 'animate-spin' : ''}`} />
                <span className="font-medium">Last Sync</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--app-text-muted)]">
                <span>Scanned: {latestSync.eventsScanned}</span>
                <span>Captured: {latestSync.eventsCaptured}</span>
                <span>Ignored: {latestSync.eventsIgnored}</span>
                {latestSync.status === 'running' ? (
                  <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">
                    In Progress
                  </Badge>
                ) : latestSync.status === 'completed' ? (
                  <span>{latestSync.endDate?.toLocaleString()}</span>
                ) : (
                  <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">
                    Failed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Connected Accounts */}
      <Card padding="md">
        <h4 className="text-sm font-semibold mb-3">Connected Calendars</h4>
        <div className="space-y-2">
          {accounts.length === 0 ? (
            <div className="text-center py-6 text-sm text-[var(--app-text-muted)]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No calendars connected</p>
            </div>
          ) : (
            accounts.map(account => (
              <div
                key={account.id}
                className="p-3 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{account.email}</span>
                        {getProviderBadge(account.provider)}
                        {getStatusBadge(account.status)}
                        {account.autoCapture && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
                            Auto-Capture ON
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                        {account.lastSync && (
                          <span>Last synced: {account.lastSync.toLocaleString()}</span>
                        )}
                        {account.captureRules.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{account.captureRules.filter(r => r.isActive).length} active rules</span>
                          </>
                        )}
                        {account.syncedCalendars.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{account.syncedCalendars.length} calendars</span>
                          </>
                        )}
                      </div>
                      {account.errorMessage && (
                        <div className="mt-1 text-xs text-[var(--app-danger)]">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {account.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onSyncCalendar && account.status === 'connected' && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onSyncCalendar(account.id)}
                        title="Sync Now"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    {onConfigureRules && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => onConfigureRules(account.id)}
                        title="Configure Rules"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                    {onToggleAutoCapture && (
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => onToggleAutoCapture(account.id)}
                      >
                        {account.autoCapture ? 'Disable' : 'Enable'} Auto-Capture
                      </Button>
                    )}
                    {onDisconnectCalendar && (
                      <Button
                        size="sm"
                        variant="light"
                        className="text-[var(--app-danger)]"
                        onPress={() => onDisconnectCalendar(account.id)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => patchUI({ searchQuery: e.target.value })}
            startContent={<Search className="w-4 h-4" />}
            size="sm"
            className="flex-1"
          />
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={dateRange}
            onChange={(e) => patchUI({ dateRange: e.target.value as typeof dateRange })}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past-week">Past Week</option>
            <option value="past-month">Past Month</option>
            <option value="all">All Time</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={filterStatus}
            onChange={(e) => patchUI({ filterStatus: e.target.value as CaptureStatus | 'all' })}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="captured">Captured</option>
            <option value="ignored">Ignored</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
            value={filterType}
            onChange={(e) => patchUI({ filterType: e.target.value as EventType | 'all' })}
          >
            <option value="all">All Types</option>
            <option value="meeting">Meeting</option>
            <option value="call">Call</option>
            <option value="conference">Conference</option>
            <option value="site-visit">Site Visit</option>
            <option value="other">Other</option>
          </select>
          {onExportEvents && (
            <>
              <Button
                size="sm"
                variant="flat"
                startContent={<Download className="w-3 h-3" />}
                onPress={() => onExportEvents('csv')}
              >
                CSV
              </Button>
              <Button
                size="sm"
                variant="flat"
                startContent={<Download className="w-3 h-3" />}
                onPress={() => onExportEvents('ical')}
              >
                iCal
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Events List */}
      <Card padding="md">
        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No events found</p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const isUpcoming = new Date(event.startTime) > new Date();

              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-surface)] border border-[var(--app-border)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.title}</span>
                        {getCaptureStatusBadge(event.captureStatus)}
                        {event.isVirtual && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">
                            <Video className="w-3 h-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                        {event.captureRuleName && (
                          <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                            {event.captureRuleName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {event.startTime.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{formatDuration(event.duration)}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          </>
                        )}
                        {event.attendees.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees.length} attendees</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Linked Entities */}
                      {(event.linkedContactNames.length > 0 || event.linkedDealNames.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {event.linkedContactNames.map((name, idx) => (
                            <Badge
                              key={`contact-${idx}`}
                              size="sm"
                              variant="flat"
                              className="bg-[var(--app-success-bg)] text-[var(--app-success)]"
                            >
                              {name}
                            </Badge>
                          ))}
                          {event.linkedDealNames.map((name, idx) => (
                            <Badge
                              key={`deal-${idx}`}
                              size="sm"
                              variant="flat"
                              className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {event.captureStatus === 'pending' && onCaptureEvent && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => onCaptureEvent(event.id)}
                        >
                          Capture
                        </Button>
                      )}
                      {event.captureStatus === 'pending' && onIgnoreEvent && (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => onIgnoreEvent(event.id)}
                        >
                          Ignore
                        </Button>
                      )}
                      {onEditEvent && (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => onEditEvent(event.id)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
