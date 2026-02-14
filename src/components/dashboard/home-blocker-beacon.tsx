'use client';

import type { HomeBlocker } from '@/data/mocks/hooks/dashboard-data';
import { ROUTE_PATHS } from '@/config/routes';
import { SignalBeacon } from '@/ui/composites';

interface HomeBlockerBeaconProps {
  blockers: HomeBlocker[];
  onBlockerClick: (blocker: HomeBlocker) => void;
}

const toneBySeverity: Record<HomeBlocker['severity'], 'critical' | 'warning' | 'info'> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
};

export function HomeBlockerBeacon({ blockers, onBlockerClick }: HomeBlockerBeaconProps) {
  const navigateWithFallback = (blocker: HomeBlocker) => {
    onBlockerClick(blocker);

    // Fallback to hard navigation if client routing did not move away from /home.
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      if (window.location.pathname === ROUTE_PATHS.dashboard && blocker.route !== ROUTE_PATHS.dashboard) {
        window.location.assign(blocker.route);
      }
    }, 80);
  };

  return (
    <div className="flex items-start justify-end" data-testid="gp-home-blockers">
      <SignalBeacon
        label="Blocked on You"
        count={blockers.length}
        tone="warning"
        testId="gp-home-blockers-beacon"
        items={blockers.map((blocker) => ({
          id: blocker.id,
          title: blocker.title,
          description: blocker.description,
          meta: `${blocker.blockedDays}d blocked · ${blocker.lane}`,
          tone: toneBySeverity[blocker.severity],
          onSelect: () => navigateWithFallback(blocker),
        }))}
      />
    </div>
  );
}
