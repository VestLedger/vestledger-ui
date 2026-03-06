import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import { createApiStorageState, loginViaRedirect, getTestUser } from '../helpers/auth-helpers';

// Test user credentials - configure these in your environment
const TEST_USER = getTestUser();
const REUSE_AUTH_SESSION = process.env.PLAYWRIGHT_REUSE_AUTH_PAGE !== '0';
const STORAGE_STATE_PATH = './e2e/.auth/storageState.json';

async function seedAuthFromApi(page: Page, baseURL: string | undefined) {
  const appOrigin = new URL(baseURL || process.env.APP_BASE_URL || process.env.BASE_URL || 'http://localhost:3000').origin;
  const storageState = await createApiStorageState(appOrigin, TEST_USER);

  await page.context().addCookies(storageState.cookies);
  for (const { origin, localStorage } of storageState.origins) {
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.evaluate((items) => {
      for (const { name, value } of items) {
        window.localStorage.setItem(name, value);
      }
    }, localStorage);
  }
}

export type AuthFixture = {
  authenticatedPage: Page;
  login: (email?: string, password?: string) => Promise<void>;
};

type WorkerAuthFixture = {
  workerAuthContext: BrowserContext | null;
};

export const test = base.extend<AuthFixture, WorkerAuthFixture>({
  workerAuthContext: [
    async ({ browser }, use, workerInfo) => {
      if (!REUSE_AUTH_SESSION) {
        await use(null);
        return;
      }

      const projectBaseURL = workerInfo.project.use.baseURL;
      const resolvedBaseURL =
        (typeof projectBaseURL === 'string' ? projectBaseURL : undefined) ??
        process.env.APP_BASE_URL ??
        process.env.BASE_URL;
      if (!resolvedBaseURL) {
        throw new Error('Missing base URL. Set APP_BASE_URL or BASE_URL in config/environment.');
      }

      const context = await browser.newContext({
        baseURL: resolvedBaseURL,
        storageState: STORAGE_STATE_PATH,
      });
      const bootstrapPage = await context.newPage();

      // Seed auth state directly — no redirect dance.
      await seedAuthFromApi(bootstrapPage, resolvedBaseURL);
      await bootstrapPage.close();

      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  page: async ({ context, workerAuthContext }, use) => {
    if (workerAuthContext) {
      const page = await workerAuthContext.newPage();
      await use(page);
      await page.close();
      return;
    }

    const page = await context.newPage();
    await use(page);
  },
  authenticatedPage: async ({ page, baseURL }, use) => {
    await seedAuthFromApi(page, baseURL);
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await use(page);
  },
  login: async ({ page }, use) => {
    const loginFn = async (
      email: string = TEST_USER.email,
      password: string = TEST_USER.password
    ) => {
      await loginViaRedirect(page, '/home', { email, password });
    };
    await use(loginFn);
  },
});

export { expect };
export { loginViaRedirect, getTestUser, hasRoleCredentials, getRoleCredentialEnvNames } from '../helpers/auth-helpers';
