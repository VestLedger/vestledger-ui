import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';

export type DataMode = 'mock' | 'api';

export type FeatureName =
  | 'auth'
  | 'funds'
  | 'alerts'
  | 'search'
  | 'reports'
  | 'analytics'
  | 'documents'
  | 'portfolio'
  | 'pipeline'
  | 'dashboards'
  | 'dealflow'
  | 'backOffice'
  | 'ai'
  | 'dealIntelligence'
  | 'crm'
  | 'integrations'
  | 'lpPortal'
  | 'auditTrail'
  | 'companySearch'
  | 'collaboration'
  | 'onboarding';

/**
 * Audited features where mock fallback should be blocked while running in API mode.
 * This supports the UI-to-API wiring initiative.
 */
export const AUDITED_NO_MOCK_FEATURES: readonly FeatureName[] = [
  'auth',
  'funds',
  'alerts',
  'reports',
  'analytics',
  'documents',
  'portfolio',
  'pipeline',
  'dashboards',
  'dealflow',
  'backOffice',
  'ai',
  'dealIntelligence',
  'crm',
  'integrations',
  'lpPortal',
  'auditTrail',
  'companySearch',
  'collaboration',
  'onboarding',
] as const;

/**
 * Feature flags for per-feature mock/API mode control.
 * Set a feature to true to use real API, false to use mock data.
 * If not specified, falls back to global DATA_MODE.
 */
const featureFlags: Partial<Record<FeatureName, boolean>> = {
  auth: true,
  funds: true,
  alerts: true,
  search: true,
  reports: true,
  analytics: true,
  documents: true,
  portfolio: true,
  pipeline: true,
  dashboards: true,
  dealflow: true,
  backOffice: true,
  ai: true,
  dealIntelligence: true,
  crm: true,
  integrations: true,
  lpPortal: true,
  auditTrail: true,
  companySearch: true,
  collaboration: true,
  onboarding: true,
};

export const DATA_MODE_OVERRIDE_KEY = 'dataModeOverride';

export function parseDataMode(value?: string | null): DataMode | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'mock' || normalized === 'api') {
    return normalized;
  }
  return null;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const entries = cookieHeader.split('; ');
  const match = entries.find((entry) => entry.startsWith(`${name}=`));
  if (!match) return null;
  return match.slice(name.length + 1);
}

export function getDataModeOverrideFromCookieHeader(cookieHeader?: string | null): DataMode | null {
  if (!cookieHeader) return null;
  const raw = getCookieValue(cookieHeader, DATA_MODE_OVERRIDE_KEY);
  return parseDataMode(raw);
}

function getStoredDataModeOverride(): DataMode | null {
  const fromStorage = parseDataMode(safeLocalStorage.getItem(DATA_MODE_OVERRIDE_KEY));
  if (fromStorage) return fromStorage;

  if (typeof document !== 'undefined') {
    const fromCookie = getDataModeOverrideFromCookieHeader(document.cookie);
    if (fromCookie) return fromCookie;
  }

  return null;
}

export function getDataMode(): DataMode {
  const override = getStoredDataModeOverride();
  if (override) return override;

  const raw = process.env.NEXT_PUBLIC_DATA_MODE?.toLowerCase();
  if (raw === 'api') return 'api';
  return 'mock';
}

/**
 * Check if a feature should use mock data.
 * @param feature - Optional feature name to check feature-specific flag
 * @returns true if mock mode should be used, false if API mode
 */
export function isMockMode(feature?: FeatureName): boolean {
  const override = getStoredDataModeOverride();
  if (override) return override === 'mock';

  // Check feature-specific override
  if (feature !== undefined && feature in featureFlags) {
    return !featureFlags[feature]; // true flag = use API, so return false for mock
  }

  // Fall back to global mode
  return getDataMode() === 'mock';
}

/**
 * Whether this runtime should disallow mock fallbacks for a feature.
 * In API mode, audited features should not silently fall back to bundled mock data.
 */
export function isAuditedNoMockRuntime(feature?: FeatureName): boolean {
  if (getDataMode() !== 'api') {
    return false;
  }

  if (!feature) {
    return true;
  }

  return AUDITED_NO_MOCK_FEATURES.includes(feature);
}
