import type { Page } from '@playwright/test';

const DEFAULT_TEST_USER = {
  email: process.env.TEST_USER_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@vestledger.com',
  password: process.env.TEST_USER_PASSWORD || process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Pa$$w0rd',
};

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

export async function loginViaRedirect(
  page: Page,
  targetPath: string,
  options?: {
    email?: string;
    password?: string;
    waitForLoadState?: 'load' | 'domcontentloaded' | 'networkidle';
    timeoutMs?: number;
  }
) {
  const user = getTestUser();
  const email = options?.email ?? user.email;
  const password = options?.password ?? user.password;
  const waitForLoadState = options?.waitForLoadState ?? 'networkidle';
  const timeoutMs = options?.timeoutMs ?? 20000;
  const variants = getPathVariants(targetPath);

  await page.goto(variants.full);

  const currentUrl = page.url();
  const isLoginPage = currentUrl.includes('/login');

  if (variants.full !== '/login' && isLoginPage) {
    await page.waitForSelector('form');
    await page.locator('input[type="email"], input[type="text"]').first().fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await waitForTargetPath(page, variants.full, timeoutMs);
  } else {
    await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});
  }

  const finalUrl = new URL(page.url());
  const atPathnameOnly = finalUrl.pathname === variants.pathname && finalUrl.search === '';

  if (variants.hasSearch && atPathnameOnly) {
    await page.goto(variants.full);
    await waitForTargetPath(page, variants.full, timeoutMs).catch(() => {});
  }

  await page.waitForLoadState(waitForLoadState);
}
