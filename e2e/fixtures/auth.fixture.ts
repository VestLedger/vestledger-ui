import { test as base, expect, Page } from '@playwright/test';

// Test user credentials - configure these in your environment
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@vestledger.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  role: 'gp' as const,
};

export type AuthFixture = {
  authenticatedPage: Page;
  login: (email?: string, password?: string, role?: string) => Promise<void>;
};

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await loginUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.role);
    await use(page);
  },
  login: async ({ page }, use) => {
    const loginFn = async (
      email: string = TEST_USER.email,
      password: string = TEST_USER.password,
      role: string = TEST_USER.role
    ) => {
      await loginUser(page, email, password, role);
    };
    await use(loginFn);
  },
});

async function loginUser(page: Page, email: string, password: string, role: string) {
  await page.goto('/login');

  // Wait for the form to be ready
  await page.waitForSelector('form');

  // Fill email
  await page.getByLabel('Email').fill(email);

  // Select role
  await page.getByLabel('Select Role (Demo)').click();
  await page.getByRole('option', { name: new RegExp(role, 'i') }).first().click();

  // Fill password
  await page.getByLabel('Password').fill(password);

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|portfolio|fund-admin)/, { timeout: 10000 });
}

export { expect };
