const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const FIVE_SECONDS_IN_MS = 5 * 1000;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

export const AUTH_COOKIE_MAX_AGE_SECONDS = parsePositiveInt(
  process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE_SECONDS,
  ONE_DAY_IN_SECONDS
);

export const AUTH_HYDRATION_TIMEOUT_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_AUTH_HYDRATION_TIMEOUT_MS,
  FIVE_SECONDS_IN_MS
);

export const INTERNAL_TENANT_ID = normalizeValue(
  process.env.NEXT_PUBLIC_INTERNAL_TENANT_ID,
  'org_vestledger_internal'
);

export const MOCK_SUPERADMIN_PROFILE = Object.freeze({
  id: normalizeValue(process.env.NEXT_PUBLIC_SUPERADMIN_USER_ID, 'user_superadmin_001'),
  displayName: normalizeValue(
    process.env.NEXT_PUBLIC_SUPERADMIN_DISPLAY_NAME,
    'Platform Superadmin'
  ),
  accessToken: normalizeValue(
    process.env.NEXT_PUBLIC_SUPERADMIN_ACCESS_TOKEN,
    'mock-superadmin-token'
  ),
});

export const MOCK_DEMO_PROFILE = Object.freeze({
  id: normalizeValue(process.env.NEXT_PUBLIC_DEMO_USER_ID, 'user_demo_gp_001'),
  tenantId: normalizeValue(process.env.NEXT_PUBLIC_DEMO_TENANT_ID, 'org_summit_vc'),
  accessToken: normalizeValue(process.env.NEXT_PUBLIC_DEMO_ACCESS_TOKEN, 'mock-token'),
});
