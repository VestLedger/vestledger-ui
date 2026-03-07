import { defineConfig, devices } from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { appBaseUrl, publicBaseUrl, playwrightDevServerUrl } = require('./config/runtime-hosts.cjs');

const appBaseURL = appBaseUrl;
const publicBaseURL = publicBaseUrl;
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1';
const ignoreHTTPSErrors = process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === '1';
const slowEnv = process.env.PLAYWRIGHT_SLOW_ENV === '1';
const storageState = './e2e/.auth/storageState.json';
const authenticatedTestIgnore = ['**/auth/**', '**/public/**', '**/setup/**'];

function resolveTimeout(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const testTimeout = resolveTimeout(
  process.env.PLAYWRIGHT_TEST_TIMEOUT,
  slowEnv ? 120_000 : 45_000,
);
const expectTimeout = resolveTimeout(
  process.env.PLAYWRIGHT_EXPECT_TIMEOUT,
  slowEnv ? 20_000 : 5_000
);
const actionTimeout = resolveTimeout(
  process.env.PLAYWRIGHT_ACTION_TIMEOUT,
  slowEnv ? 30_000 : 10_000
);
const navigationTimeout = resolveTimeout(
  process.env.PLAYWRIGHT_NAVIGATION_TIMEOUT,
  slowEnv ? 90_000 : 30_000
);
const webServerTimeout = resolveTimeout(
  process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT,
  slowEnv ? 300_000 : 120_000
);

export default defineConfig({
  testDir: './e2e',
  timeout: testTimeout,
  expect: {
    timeout: expectTimeout,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: appBaseURL,
    ignoreHTTPSErrors,
    actionTimeout,
    navigationTimeout,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'auth-chromium',
      testMatch: ['auth/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: appBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'auth-firefox',
      testMatch: ['auth/**/*.spec.ts'],
      use: {
        ...devices['Desktop Firefox'],
        baseURL: appBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'auth-webkit',
      testMatch: ['auth/**/*.spec.ts'],
      use: {
        ...devices['Desktop Safari'],
        baseURL: appBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'public-chromium',
      testMatch: ['public/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: publicBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'public-firefox',
      testMatch: ['public/**/*.spec.ts'],
      use: {
        ...devices['Desktop Firefox'],
        baseURL: publicBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'public-webkit',
      testMatch: ['public/**/*.spec.ts'],
      use: {
        ...devices['Desktop Safari'],
        baseURL: publicBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'public-mobile-chrome',
      testMatch: ['public/**/*.spec.ts'],
      use: {
        ...devices['Pixel 5'],
        baseURL: publicBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'public-mobile-safari',
      testMatch: ['public/**/*.spec.ts'],
      use: {
        ...devices['iPhone 12'],
        baseURL: publicBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'setup',
      testMatch: ['setup/**/*.setup.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: appBaseURL,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: authenticatedTestIgnore,
      use: { ...devices['Desktop Chrome'], storageState },
    },
    {
      name: 'firefox',
      dependencies: ['setup'],
      testIgnore: authenticatedTestIgnore,
      use: { ...devices['Desktop Firefox'], storageState },
    },
    {
      name: 'webkit',
      dependencies: ['setup'],
      testIgnore: authenticatedTestIgnore,
      use: { ...devices['Desktop Safari'], storageState },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: 'NEXT_DIST_DIR=.next-playwright pnpm exec next dev -H 127.0.0.1 -p 3000',
        url: playwrightDevServerUrl,
        reuseExistingServer: !process.env.CI,
        timeout: webServerTimeout,
      },
});
