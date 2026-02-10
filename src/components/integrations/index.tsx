'use client';

import { Card, Button, RadioGroup } from '@/ui';
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

const integrationIconMap = {
  calendar: Calendar,
  email: Mail,
  slack: Slack,
  github: Github,
} as const satisfies Record<IntegrationSummary['icon'], LucideIcon>;

export function Integrations() {
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
                      <Button variant="bordered" size="sm" startContent={<Settings className="w-4 h-4" />}>
                        Configure
                      </Button>
                      <Button variant="bordered" size="sm" color="danger">
                        Disconnect
                      </Button>
                    </>
                  ) : integration.status === 'available' ? (
                    <Button color="primary" size="sm" fullWidth>
                      Connect
                    </Button>
                  ) : (
                    <Button variant="bordered" size="sm" fullWidth disabled>
                      Coming Soon
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
            onConnectCalendar={(provider) => console.log('Connect calendar:', provider)}
            onDisconnectCalendar={(accountId) => console.log('Disconnect calendar:', accountId)}
            onSyncCalendar={(accountId) => console.log('Sync calendar:', accountId)}
            onConfigureRules={(accountId) => console.log('Configure rules for:', accountId)}
            onToggleAutoCapture={(accountId) => console.log('Toggle auto-capture for:', accountId)}
            onCaptureEvent={(eventId) => console.log('Capture event:', eventId)}
            onIgnoreEvent={(eventId) => console.log('Ignore event:', eventId)}
            onEditEvent={(eventId) => console.log('Edit event:', eventId)}
            onCreateEvent={() => console.log('Create event')}
            onExportEvents={(format) => console.log('Export events:', format)}
          />
        </div>
      </div>
          </PageScaffold>
        );
      }}
    </AsyncStateRenderer>
  );
}
