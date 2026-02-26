'use client';

import { Card, Button, RadioGroup, useToast } from '@/ui';
import type { LucideIcon } from 'lucide-react';
import { Plug, Calendar, Mail, Slack, Github, Settings } from 'lucide-react';
import { CalendarIntegration } from './calendar-integration';
import { useUIKey } from '@/store/ui';
import { integrationsRequested, integrationsSelectors } from '@/store/slices/miscSlice';
import type { IntegrationSummary } from '@/types/integrations';
import { AsyncStateRenderer, EmptyState } from '@/ui/async-states';
import { useAsyncData } from '@/hooks/useAsyncData';
import { PageScaffold, StatusBadge } from '@/ui/composites';
import { ROUTE_PATHS } from '@/config/routes';
import {
  captureCalendarEvent,
  configureCalendarRules,
  connectCalendar,
  connectIntegration,
  createCalendarEvent,
  disconnectCalendar,
  disconnectIntegration,
  editCalendarEvent,
  exportCalendarEvents,
  ignoreCalendarEvent,
  syncCalendar,
  toggleCalendarAutoCapture,
} from '@/services/integrationsService';

const integrationIconMap = {
  calendar: Calendar,
  email: Mail,
  slack: Slack,
  github: Github,
} as const satisfies Record<IntegrationSummary['icon'], LucideIcon>;

export function Integrations() {
  const toast = useToast();
  const { data, isLoading, error, refetch } = useAsyncData(integrationsRequested, integrationsSelectors.selectState);

  // UI state MUST be called before any early returns (Rules of Hooks)
  const { value: ui, patch: patchUI } = useUIKey('integrations', { selectedCategory: 'all' });
  const { selectedCategory } = ui;

  const integrations = data?.integrations || [];
  const calendarAccounts = data?.accounts || [];
  const calendarEvents = data?.events || [];

  const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))];
  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter((i) => i.category === selectedCategory);

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const runRefreshAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    try {
      await action();
      refetch();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update integration.'));
    }
  };

  const handleExportEvents = async (format: 'csv' | 'ical') => {
    try {
      const content = await exportCalendarEvents(format);
      const mimeType = format === 'csv' ? 'text/csv' : 'text/calendar';
      const extension = format === 'csv' ? 'csv' : 'ics';
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `calendar-events.${extension}`;
      anchor.click();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Calendar events exported.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to export calendar events.'));
    }
  };

  return (
    <AsyncStateRenderer
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      loadingMessage="Loading integrations…"
      errorTitle="Failed to load integrations"
      isEmpty={() => false}
    >
      {() => {
        if (integrations.length === 0) {
          return <EmptyState icon={Plug} title="No integrations configured" message="Connect a tool to get started." />;
        }

        return (
          <PageScaffold
            routePath={ROUTE_PATHS.integrations}
            header={{
              title: 'Integrations',
              description: 'Connect external tools and services to streamline your workflow',
              icon: Plug,
            }}
          >
      <div className="mt-4 space-y-4">
        {/* Category Filter */}
        <RadioGroup
          aria-label="Integration category filter"
          orientation="horizontal"
          classNames={{ wrapper: 'flex flex-wrap gap-3' }}
          options={categories.map((category) => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
          }))}
          value={selectedCategory}
          onValueChange={(value) => patchUI({ selectedCategory: value })}
        />

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const Icon = integrationIconMap[integration.icon];
            return (
              <Card key={integration.id} padding="lg" className="hover:border-[var(--app-primary)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--app-primary-bg)] text-[var(--app-primary)] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <StatusBadge status={integration.status} domain="integrations" size="sm" showIcon />
                </div>
                <h3 className="text-lg font-bold mb-2">{integration.name}</h3>
                <p className="text-[var(--app-text-muted)] text-sm mb-4">
                  {integration.description}
                </p>
                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button
                        variant="bordered"
                        size="sm"
                        startContent={<Settings className="w-4 h-4" />}
                        onPress={() => {
                          toast.info(`Configuration opened for ${integration.name}.`);
                        }}
                      >
                        Configure
                      </Button>
                      <Button
                        variant="bordered"
                        size="sm"
                        color="danger"
                        onPress={() => {
                          void runRefreshAction(
                            () => disconnectIntegration(integration.id),
                            `${integration.name} disconnected.`
                          );
                        }}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : integration.status === 'available' ? (
                    <Button
                      color="primary"
                      size="sm"
                      fullWidth
                      onPress={() => {
                        void runRefreshAction(
                          () => connectIntegration(integration.id),
                          `${integration.name} connected.`
                        );
                      }}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button variant="bordered" size="sm" fullWidth disabled>
                      Planned
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Calendar Integration Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Calendar Integration</h2>
          <CalendarIntegration
            accounts={calendarAccounts}
            events={calendarEvents}
            onConnectCalendar={(provider) => {
              void runRefreshAction(
                () => connectCalendar(provider),
                `${provider.charAt(0).toUpperCase()}${provider.slice(1)} calendar connected.`
              );
            }}
            onDisconnectCalendar={(accountId) => {
              void runRefreshAction(
                () => disconnectCalendar(accountId),
                'Calendar disconnected.'
              );
            }}
            onSyncCalendar={(accountId) => {
              void runRefreshAction(
                () => syncCalendar(accountId),
                'Calendar sync complete.'
              );
            }}
            onConfigureRules={(accountId) => {
              void runRefreshAction(
                () => configureCalendarRules(accountId),
                'Calendar capture rules updated.'
              );
            }}
            onToggleAutoCapture={(accountId) => {
              void runRefreshAction(
                () => toggleCalendarAutoCapture(accountId),
                'Auto-capture setting updated.'
              );
            }}
            onCaptureEvent={(eventId) => {
              void runRefreshAction(
                () => captureCalendarEvent(eventId),
                'Calendar event captured.'
              );
            }}
            onIgnoreEvent={(eventId) => {
              void runRefreshAction(
                () => ignoreCalendarEvent(eventId),
                'Calendar event ignored.'
              );
            }}
            onEditEvent={(eventId) => {
              void runRefreshAction(
                () => editCalendarEvent(eventId),
                'Calendar event updated.'
              );
            }}
            onCreateEvent={() => {
              void runRefreshAction(
                () => createCalendarEvent(),
                'Calendar event created.'
              );
            }}
            onExportEvents={(format) => {
              void handleExportEvents(format);
            }}
          />
        </div>
      </div>
          </PageScaffold>
        );
      }}
    </AsyncStateRenderer>
  );
}
