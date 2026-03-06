import type { Page } from '@playwright/test';

export type TestUserRole =
  | 'superadmin'
  | 'gp'
  | 'analyst'
  | 'ops'
  | 'ir'
  | 'researcher'
  | 'lp'
  | 'auditor'
  | 'service_provider'
  | 'strategic_partner';

type TestUserCredentials = {
  email: string;
  password: string;
};

type AuthenticatedUser = {
  id?: string;
  name: string;
  email: string;
  role: TestUserRole;
  tenantId?: string;
  organizationRole?: 'org_admin' | 'member';
  isPlatformAdmin?: boolean;
};

type ApiAuthSession = {
  accessToken: string;
  user: AuthenticatedUser;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  username?: string;
  name?: string;
  role?: string;
  tenantId?: string;
  organizationRole?: string;
  isPlatformAdmin?: boolean;
};

const TEST_USER_ROLES: readonly TestUserRole[] = [
  'superadmin',
  'gp',
  'analyst',
  'ops',
  'ir',
  'researcher',
  'lp',
  'auditor',
  'service_provider',
  'strategic_partner',
] as const;

const AUTH_STORAGE_KEY = 'isAuthenticated';
const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'accessToken';
const DATA_MODE_OVERRIDE_KEY = 'dataModeOverride';

const RETRYABLE_NAVIGATION_ERRORS = ['ERR_ABORTED', 'frame was detached'];
const NAVIGATION_RETRY_DELAY_MS = 250;
const NAVIGATION_ATTEMPT_TIMEOUT_MS = 20_000;

const unauthRouteChecks = new Set<string>();
const apiSessionCache = new Map<string, ApiAuthSession>();

function requireEnv(primaryName: string, fallbackNames: string[] = []): string {
  const names = [primaryName, ...fallbackNames];
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }
  throw new Error(`Missing required env var(s): ${names.join(' or ')}`);
}

function parseRole(value: string, source = 'role'): TestUserRole {
  const normalized = value.trim();
  if ((TEST_USER_ROLES as readonly string[]).includes(normalized)) {
    return normalized as TestUserRole;
  }
  throw new Error(
    `Invalid ${source}: ${value}. Expected one of: ${TEST_USER_ROLES.join(', ')}`
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function getPathVariants(path: string): { full: string; pathname: string; hasSearch: boolean } {
  const normalized = normalizePath(path);
  const [pathname] = normalized.split('?');
  return {
    full: normalized,
    pathname,
    hasSearch: normalized.includes('?'),
  };
}

function getRoleCredentialPrefix(role: TestUserRole): string {
  return role.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

type RoleCredentialEnvNames = {
  emailVar: string;
  passwordVar: string;
};

export function getRoleCredentialEnvNames(role: TestUserRole): RoleCredentialEnvNames {
  const prefix = getRoleCredentialPrefix(role);
  return {
    emailVar: `TEST_USER_${prefix}_EMAIL`,
    passwordVar: `TEST_USER_${prefix}_PASSWORD`,
  };
}

function readRoleCredentialEnv(role: TestUserRole): TestUserCredentials | null {
  const { emailVar, passwordVar } = getRoleCredentialEnvNames(role);
  const email = process.env[emailVar]?.trim();
  const password = process.env[passwordVar]?.trim();
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export function hasRoleCredentials(role: TestUserRole): boolean {
  if (readRoleCredentialEnv(role)) {
    return true;
  }
  if (role === 'gp') {
    return Boolean(process.env.TEST_USER_EMAIL?.trim() && process.env.TEST_USER_PASSWORD?.trim());
  }
  return false;
}

function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  const payload = parts[1];
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  const decoded = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(decoded) as JwtPayload;
}

function resolveBaseUrlFromPageOrEnv(page: Page): string {
  const currentUrl = page.url();
  if (currentUrl && currentUrl !== 'about:blank') {
    return new URL(currentUrl).origin;
  }

  return requireEnv('APP_BASE_URL', ['BASE_URL']);
}

function resolveApiBaseUrl(appBaseUrlHint?: string): string {
  const configured = requireEnv('PLAYWRIGHT_API_BASE_URL', ['NEXT_PUBLIC_API_BASE_URL']);

  if (/^https?:\/\//i.test(configured)) {
    return configured;
  }

  if (!configured.startsWith('/')) {
    throw new Error(
      `Invalid API base URL: ${configured}. Use absolute URL or root-relative path (e.g. /api).`
    );
  }

  const appBaseUrl = appBaseUrlHint ?? requireEnv('APP_BASE_URL', ['BASE_URL']);
  return new URL(configured, ensureTrailingSlash(appBaseUrl)).toString();
}

function buildAuthLoginUrl(apiBaseUrl: string): string {
  return new URL('auth/login', ensureTrailingSlash(apiBaseUrl)).toString();
}

function buildSessionFromToken(accessToken: string): ApiAuthSession {
  const payload = decodeJwtPayload(accessToken);

  const email = isNonEmptyString(payload.email)
    ? payload.email.trim()
    : (() => {
        throw new Error('JWT payload missing email claim');
      })();

  const role = isNonEmptyString(payload.role)
    ? parseRole(payload.role, 'JWT role claim')
    : (() => {
        throw new Error('JWT payload missing role claim');
      })();

  const nameFromToken = isNonEmptyString(payload.username)
    ? payload.username
    : isNonEmptyString(payload.name)
      ? payload.name
      : email;

  const organizationRole =
    payload.organizationRole === 'org_admin' || payload.organizationRole === 'member'
      ? payload.organizationRole
      : undefined;

  return {
    accessToken,
    user: {
      id: isNonEmptyString(payload.sub) ? payload.sub : undefined,
      name: nameFromToken,
      email,
      role,
      tenantId: isNonEmptyString(payload.tenantId) ? payload.tenantId : undefined,
      organizationRole,
      isPlatformAdmin:
        typeof payload.isPlatformAdmin === 'boolean' ? payload.isPlatformAdmin : undefined,
    },
  };
}

async function authenticateViaApi(
  credentials: TestUserCredentials,
  appBaseUrlHint?: string
): Promise<ApiAuthSession> {
  const apiBaseUrl = resolveApiBaseUrl(appBaseUrlHint);
  const cacheKey = `${apiBaseUrl}|${credentials.email}|${credentials.password}`;
  const cached = apiSessionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const endpoint = buildAuthLoginUrl(apiBaseUrl);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || response.statusText;
    throw new Error(`API login failed (${response.status}) at ${endpoint}: ${message}`);
  }

  if (!isNonEmptyString(payload.access_token)) {
    throw new Error(`API login response missing access_token at ${endpoint}`);
  }

  const session = buildSessionFromToken(payload.access_token);
  apiSessionCache.set(cacheKey, session);
  return session;
}

function resolveCredentials(options?: {
  email?: string;
  password?: string;
  role?: TestUserRole;
}): TestUserCredentials {
  if (options?.email !== undefined || options?.password !== undefined) {
    if (!options?.email || !options?.password) {
      throw new Error('When overriding credentials, both email and password are required.');
    }

    return {
      email: options.email,
      password: options.password,
    };
  }

  if (options?.role) {
    const roleCredentials = readRoleCredentialEnv(options.role);
    if (roleCredentials) {
      return roleCredentials;
    }

    if (options.role === 'gp') {
      return getTestUser();
    }

    const { emailVar, passwordVar } = getRoleCredentialEnvNames(options.role);
    throw new Error(
      `Missing ${emailVar} / ${passwordVar} for role override '${options.role}'.`
    );
  }

  return getTestUser();
}

function getCookieShape(baseUrl: string): { origin: string; domain: string; secure: boolean } {
  const parsed = new URL(baseUrl);
  return {
    origin: parsed.origin,
    domain: parsed.hostname,
    secure: parsed.protocol === 'https:',
  };
}

function buildStorageState(baseUrl: string, session: ApiAuthSession) {
  const { origin, domain, secure } = getCookieShape(baseUrl);
  const expires = Math.floor(Date.now() / 1000) + 86400;

  return {
    cookies: [
      {
        name: AUTH_STORAGE_KEY,
        value: 'true',
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
      {
        name: 'user',
        value: encodeURIComponent(JSON.stringify(session.user)),
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
      {
        name: DATA_MODE_OVERRIDE_KEY,
        value: 'api',
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [
      {
        origin,
        localStorage: [
          { name: AUTH_STORAGE_KEY, value: 'true' },
          { name: USER_STORAGE_KEY, value: JSON.stringify(session.user) },
          { name: TOKEN_STORAGE_KEY, value: session.accessToken },
          { name: DATA_MODE_OVERRIDE_KEY, value: 'api' },
        ],
      },
    ],
  };
}

export async function createApiStorageState(
  baseUrl: string,
  credentials: TestUserCredentials
) {
  const session = await authenticateViaApi(credentials, baseUrl);
  return buildStorageState(baseUrl, session);
}

export function getTestUser(): TestUserCredentials {
  return {
    email: requireEnv('TEST_USER_EMAIL'),
    password: requireEnv('TEST_USER_PASSWORD'),
  };
}

async function waitForTargetPath(page: Page, targetPath: string, timeoutMs = 20_000) {
  const variants = getPathVariants(targetPath);
  await page.waitForURL(
    (url) => `${url.pathname}${url.search}` === variants.full || url.pathname === variants.pathname,
    { timeout: timeoutMs }
  );
}

async function gotoWithRetry(
  page: Page,
  targetPath: string,
  options: Parameters<Page['goto']>[1],
  maxAttempts = 3
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await page.goto(targetPath, {
        timeout: NAVIGATION_ATTEMPT_TIMEOUT_MS,
        ...options,
      });
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isRetryable = RETRYABLE_NAVIGATION_ERRORS.some((fragment) =>
        message.includes(fragment)
      );
      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }
      await page.waitForTimeout(NAVIGATION_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError ?? new Error(`Failed to navigate to ${targetPath}`);
}

async function clearAuthState(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ authKey, userKey, tokenKey, dataModeKey }) => {
      window.localStorage.removeItem(authKey);
      window.localStorage.removeItem(userKey);
      window.localStorage.removeItem(tokenKey);
      window.localStorage.removeItem(dataModeKey);
      window.sessionStorage.clear();
    },
    {
      authKey: AUTH_STORAGE_KEY,
      userKey: USER_STORAGE_KEY,
      tokenKey: TOKEN_STORAGE_KEY,
      dataModeKey: DATA_MODE_OVERRIDE_KEY,
    }
  );
}

async function applySessionToPage(page: Page, baseUrl: string, session: ApiAuthSession) {
  const { domain, secure } = getCookieShape(baseUrl);
  const encodedUser = encodeURIComponent(JSON.stringify(session.user));

  await page.context().addCookies([
    { name: AUTH_STORAGE_KEY, value: 'true', domain, path: '/', sameSite: 'Lax', secure },
    { name: 'user', value: encodedUser, domain, path: '/', sameSite: 'Lax', secure },
    { name: DATA_MODE_OVERRIDE_KEY, value: 'api', domain, path: '/', sameSite: 'Lax', secure },
  ]);

  await page.addInitScript(
    ({ authKey, userKey, tokenKey, dataModeKey, userValue, tokenValue }) => {
      window.localStorage.setItem(authKey, 'true');
      window.localStorage.setItem(userKey, userValue);
      window.localStorage.setItem(tokenKey, tokenValue);
      window.localStorage.setItem(dataModeKey, 'api');
    },
    {
      authKey: AUTH_STORAGE_KEY,
      userKey: USER_STORAGE_KEY,
      tokenKey: TOKEN_STORAGE_KEY,
      dataModeKey: DATA_MODE_OVERRIDE_KEY,
      userValue: JSON.stringify(session.user),
      tokenValue: session.accessToken,
    }
  );

  await page.evaluate(
    ({ authKey, userKey, tokenKey, dataModeKey, userValue, tokenValue }) => {
      window.localStorage.setItem(authKey, 'true');
      window.localStorage.setItem(userKey, userValue);
      window.localStorage.setItem(tokenKey, tokenValue);
      window.localStorage.setItem(dataModeKey, 'api');
    },
    {
      authKey: AUTH_STORAGE_KEY,
      userKey: USER_STORAGE_KEY,
      tokenKey: TOKEN_STORAGE_KEY,
      dataModeKey: DATA_MODE_OVERRIDE_KEY,
      userValue: JSON.stringify(session.user),
      tokenValue: session.accessToken,
    }
  );
}

async function seedAuthenticatedState(page: Page, credentials: TestUserCredentials) {
  const baseUrl = resolveBaseUrlFromPageOrEnv(page);
  const session = await authenticateViaApi(credentials, baseUrl);
  await applySessionToPage(page, baseUrl, session);
}

async function verifyUnauthenticatedRedirectOnce(
  page: Page,
  targetPath: string
) {
  const variants = getPathVariants(targetPath);
  if (variants.pathname === '/login' || unauthRouteChecks.has(variants.pathname)) {
    return;
  }

  const browser = page.context().browser();
  if (!browser) {
    return;
  }

  const baseUrl = resolveBaseUrlFromPageOrEnv(page);
  const probeContext = await browser.newContext({
    baseURL: baseUrl,
    storageState: { cookies: [], origins: [] },
    ignoreHTTPSErrors:
      process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === '1' ||
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0',
  });

  try {
    const probePage = await probeContext.newPage();
    await gotoWithRetry(probePage, variants.full, { waitUntil: 'domcontentloaded' });
    const unauthPathname = new URL(probePage.url()).pathname;
    if (unauthPathname !== '/login') {
      throw new Error(
        `Expected unauthenticated access to ${variants.full} to redirect to /login but landed on ${unauthPathname}`
      );
    }
    unauthRouteChecks.add(variants.pathname);
  } finally {
    await probeContext.close();
  }
}

export async function loginViaRedirect(
  page: Page,
  targetPath: string,
  options?: {
    email?: string;
    password?: string;
    role?: TestUserRole;
    waitForLoadState?: 'load' | 'domcontentloaded' | 'networkidle';
    timeoutMs?: number;
    requireLoginRedirect?: boolean;
    forceFreshAuth?: boolean;
  }
) {
  const waitForLoadState = options?.waitForLoadState ?? 'domcontentloaded';
  const timeoutMs = options?.timeoutMs ?? 20_000;
  const requireLoginRedirect =
    options?.requireLoginRedirect ?? process.env.PLAYWRIGHT_VERIFY_UNAUTH_ROUTE === '1';
  const forceFreshAuth = options?.forceFreshAuth ?? false;
  const variants = getPathVariants(targetPath);

  const credentials = resolveCredentials(options);

  if (requireLoginRedirect) {
    await verifyUnauthenticatedRedirectOnce(page, targetPath);
  }

  const hasCredentialOverride =
    options?.email !== undefined ||
    options?.password !== undefined ||
    options?.role !== undefined;

  if (forceFreshAuth || hasCredentialOverride) {
    await clearAuthState(page);
    await seedAuthenticatedState(page, credentials);
  }

  await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });

  if (variants.pathname !== '/login') {
    // Recover from stale sessions by reseeding auth and retrying navigation.
    for (let attempt = 0; attempt < 3 && new URL(page.url()).pathname === '/login'; attempt += 1) {
      await seedAuthenticatedState(page, credentials);
      await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });
    }
  }

  await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});

  const finalUrl = new URL(page.url());
  const atPathnameOnly =
    finalUrl.pathname === variants.pathname && finalUrl.search === '';

  if (variants.hasSearch && atPathnameOnly) {
    await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });
    await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});
  }

  if (variants.pathname !== '/login' && new URL(page.url()).pathname === '/login') {
    throw new Error(
      `Authenticated navigation to ${variants.full} kept redirecting to /login`
    );
  }

  await page.waitForLoadState(waitForLoadState);
}
