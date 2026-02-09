import { defineConfig, devices } from '@playwright/test';

const appBaseURL = process.env.APP_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const publicBaseURL = process.env.PUBLIC_BASE_URL || 'https://vestledger.com';
const storageState = './e2e/.auth/storageState.json';
const authenticatedTestIgnore = ['**/auth/**', '**/public/**', '**/setup/**'];

export default defineConfig({
  testDir: './e2e',
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
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
