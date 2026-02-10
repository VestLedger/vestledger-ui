import { test as base, expect, Page } from '@playwright/test';
import { loginViaRedirect, getTestUser } from '../helpers/auth-helpers';

// Test user credentials - configure these in your environment
const TEST_USER = getTestUser();

export type AuthFixture = {
  authenticatedPage: Page;
  login: (email?: string, password?: string) => Promise<void>;
};

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    await loginViaRedirect(page, '/home', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
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
export { loginViaRedirect, getTestUser } from '../helpers/auth-helpers';
