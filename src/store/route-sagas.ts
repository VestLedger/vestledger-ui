import type { SagaKey } from '@/store/sagaManager';
import { ROUTE_PATHS } from '@/config/routes';

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
  { match: (pathname) => pathname === ROUTE_PATHS.dashboard, sagas: ['dashboards'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.pipeline), sagas: ['pipeline'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.portfolio), sagas: ['portfolio'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.documents), sagas: ['documents'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.dealIntelligence), sagas: ['dealIntelligence', 'misc'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.dealflowReview), sagas: ['dealflow'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.aiTools), sagas: ['ai'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.waterfall), sagas: ['waterfall', 'distribution'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.fundAdmin), sagas: ['backOffice', 'distribution'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.compliance), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.taxCenter), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.valuations409a), sagas: ['backOffice'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.lpPortal), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.lpManagement), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.integrations), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.auditTrail), sagas: ['misc'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.contacts), sagas: ['crm'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.analytics), sagas: ['portfolio'] },
  { match: (pathname) => pathname.startsWith(ROUTE_PATHS.notifications), sagas: ['alerts'] },
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
