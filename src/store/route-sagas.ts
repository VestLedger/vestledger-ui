import type { SagaKey } from '@/store/sagaManager';

const CORE_SAGAS: SagaKey[] = [
  'alerts',
  'navigation',
  'fund',
  'search',
  'copilot',
  'uiEffects',
];

const ROUTE_SAGAS: Array<{
  match: (pathname: string) => boolean;
  sagas: SagaKey[];
}> = [
  { match: (pathname) => pathname === '/dashboard', sagas: ['dashboards'] },
  { match: (pathname) => pathname.startsWith('/pipeline'), sagas: ['pipeline'] },
  { match: (pathname) => pathname.startsWith('/portfolio'), sagas: ['portfolio'] },
  { match: (pathname) => pathname.startsWith('/documents'), sagas: ['documents'] },
  { match: (pathname) => pathname.startsWith('/deal-intelligence'), sagas: ['dealIntelligence', 'misc'] },
  { match: (pathname) => pathname.startsWith('/dealflow-review'), sagas: ['dealflow'] },
  { match: (pathname) => pathname.startsWith('/ai-tools'), sagas: ['ai'] },
  { match: (pathname) => pathname.startsWith('/waterfall'), sagas: ['waterfall', 'distribution'] },
  { match: (pathname) => pathname.startsWith('/fund-admin'), sagas: ['backOffice', 'distribution'] },
  { match: (pathname) => pathname.startsWith('/compliance'), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith('/tax-center'), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith('/409a-valuations'), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith('/lp-portal'), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith('/lp-management'), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith('/integrations'), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith('/audit-trail'), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith('/contacts'), sagas: ['crm'] },
  { match: (pathname) => pathname.startsWith('/analytics'), sagas: ['portfolio'] },
  { match: (pathname) => pathname.startsWith('/notifications'), sagas: ['alerts'] },
];

export function getSagaKeysForPath(pathname: string | null): SagaKey[] {
  if (!pathname || pathname === '/login') return [];

  const keys = new Set<SagaKey>(CORE_SAGAS);
  for (const entry of ROUTE_SAGAS) {
    if (entry.match(pathname)) {
      entry.sagas.forEach((key) => keys.add(key));
    }
  }
  return Array.from(keys);
}
