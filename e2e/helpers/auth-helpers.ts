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

const DEFAULT_TEST_USER = {
  email: process.env.TEST_USER_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@vestledger.com',
  password: process.env.TEST_USER_PASSWORD || process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Pa$$w0rd',
  role: (process.env.TEST_USER_ROLE as TestUserRole | undefined) || 'gp',
};
const AUTH_STORAGE_KEY = 'isAuthenticated';
const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'accessToken';
const DATA_MODE_OVERRIDE_KEY = 'dataModeOverride';
const RETRYABLE_NAVIGATION_ERRORS = ['ERR_ABORTED', 'frame was detached'];
const NAVIGATION_RETRY_DELAY_MS = 250;
const NAVIGATION_ATTEMPT_TIMEOUT_MS = 20_000;

export function getTestUser() {
  return { ...DEFAULT_TEST_USER };
}

function normalizePath(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function getPathVariants(path: string) {
  const normalized = normalizePath(path);
  const [pathname] = normalized.split('?');
  return {
    full: normalized,
    pathname,
    hasSearch: normalized.includes('?'),
  };
}

async function waitForTargetPath(page: Page, targetPath: string, timeoutMs = 20000) {
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
      const isRetryable = RETRYABLE_NAVIGATION_ERRORS.some((fragment) => message.includes(fragment));
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

async function seedAuthenticatedState(page: Page, email: string, role: TestUserRole) {
  const user = {
    name: `Playwright ${role.toUpperCase()} User`,
    email,
    role,
  };
  const currentUrl = new URL(page.url());
  const domain = currentUrl.hostname;
  const secure = currentUrl.protocol === 'https:';
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  await page.context().addCookies([
    { name: AUTH_STORAGE_KEY, value: 'true', domain, path: '/', sameSite: 'Lax', secure },
    { name: 'user', value: encodedUser, domain, path: '/', sameSite: 'Lax', secure },
    { name: DATA_MODE_OVERRIDE_KEY, value: 'mock', domain, path: '/', sameSite: 'Lax', secure },
  ]);

  await page.addInitScript(
    ({ authKey, userKey, tokenKey, dataModeKey, userValue }) => {
      window.localStorage.setItem(authKey, 'true');
      window.localStorage.setItem(userKey, userValue);
      window.localStorage.setItem(tokenKey, 'mock-token');
      window.localStorage.setItem(dataModeKey, 'mock');
    },
    {
      authKey: AUTH_STORAGE_KEY,
      userKey: USER_STORAGE_KEY,
      tokenKey: TOKEN_STORAGE_KEY,
      dataModeKey: DATA_MODE_OVERRIDE_KEY,
      userValue: JSON.stringify(user),
    }
  );

  await page.evaluate(
    ({ authKey, userKey, tokenKey, dataModeKey, userValue }) => {
      window.localStorage.setItem(authKey, 'true');
      window.localStorage.setItem(userKey, userValue);
      window.localStorage.setItem(tokenKey, 'mock-token');
      window.localStorage.setItem(dataModeKey, 'mock');
    },
    {
      authKey: AUTH_STORAGE_KEY,
      userKey: USER_STORAGE_KEY,
      tokenKey: TOKEN_STORAGE_KEY,
      dataModeKey: DATA_MODE_OVERRIDE_KEY,
      userValue: JSON.stringify(user),
    }
  );
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
  }
) {
  const user = getTestUser();
  const email = options?.email ?? user.email;
  const role = options?.role ?? user.role;
  const waitForLoadState = options?.waitForLoadState ?? 'networkidle';
  const timeoutMs = options?.timeoutMs ?? 20000;
  const requireLoginRedirect = options?.requireLoginRedirect ?? true;
  const variants = getPathVariants(targetPath);

  await clearAuthState(page);

  if (variants.pathname !== '/login') {
    await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });
    const unauthPathname = new URL(page.url()).pathname;
    if (requireLoginRedirect && unauthPathname !== '/login') {
      throw new Error(`Expected unauthenticated access to ${variants.full} to redirect to /login but landed on ${unauthPathname}`);
    }
  }

  await seedAuthenticatedState(page, email, role);
  await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });
  await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});

  const finalUrl = new URL(page.url());
  const atPathnameOnly = finalUrl.pathname === variants.pathname && finalUrl.search === '';

  if (variants.hasSearch && atPathnameOnly) {
    await gotoWithRetry(page, variants.full, { waitUntil: 'domcontentloaded' });
    await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});
  }

  await page.waitForLoadState(waitForLoadState);
}
