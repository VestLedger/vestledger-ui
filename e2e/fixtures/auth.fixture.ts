import { test as base, expect, Page } from '@playwright/test';

// Test user credentials - configure these in your environment
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'demo@vestledger.com',
  password: process.env.TEST_USER_PASSWORD || 'Pa$$w0rd',
};

export type AuthFixture = {
  authenticatedPage: Page;
  login: (email?: string, password?: string) => Promise<void>;
};

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await loginUser(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },
  login: async ({ page }, use) => {
    const loginFn = async (
      email: string = TEST_USER.email,
      password: string = TEST_USER.password
    ) => {
      await loginUser(page, email, password);
    };
    await use(loginFn);
  },
});

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');

  // Wait for the form to be ready
  await page.waitForSelector('form');

  // Fill email - use CSS selector for NextUI inputs
  await page.locator('input[type="email"], input[type="text"]').first().fill(email);

  // Fill password - use CSS selector for type="password"
  await page.locator('input[type="password"]').fill(password);

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|portfolio|fund-admin)/, { timeout: 10000 });
}

export { expect };
