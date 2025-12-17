export type DataMode = 'mock' | 'api';

export type FeatureName =
  | 'auth'
  | 'funds'
  | 'alerts'
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
  | 'companySearch';

/**
 * Feature flags for per-feature mock/API mode control.
 * Set a feature to true to use real API, false to use mock data.
 * If not specified, falls back to global DATA_MODE.
 */
const featureFlags: Partial<Record<FeatureName, boolean>> = {
  // Example: Uncomment to enable API mode for specific features
  // auth: true,        // Use real auth API
  // funds: true,       // Use real funds API
  // dashboards: false, // Force mock mode for dashboards
};

export function getDataMode(): DataMode {
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
  // Check feature-specific override
  if (feature !== undefined && feature in featureFlags) {
    return !featureFlags[feature]; // true flag = use API, so return false for mock
  }

  // Fall back to global mode
  return getDataMode() === 'mock';
}

