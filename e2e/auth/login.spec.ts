import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.use({ storageState: { cookies: [], origins: [] } });

const MOCK_USER = {
  email: 'mock.user@vestledger.test',
  password: 'mock-password',
};

function createMockAccessToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'test-user-id',
    email: MOCK_USER.email,
    username: 'Demo User',
    role: 'gp',
  };
  const base64Url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${base64Url(header)}.${base64Url(payload)}.signature`;
}

async function mockAuthLogin(page: Page, response: { status: number; body: Record<string, unknown> }) {
  await page.context().route('**/auth/login', async (route) => {
    const request = route.request();
    const origin = request.headerValue('origin') ?? '*';
    const corsHeaders = {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': request.headerValue('access-control-request-headers') ?? '*',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
      });
      return;
    }

    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify(response.body),
    });
  });
}

async function mockLoginSuccess(page: Page) {
  await mockAuthLogin(page, {
    status: 200,
    body: { access_token: createMockAccessToken() },
  });
}

async function mockLoginFailure(page: Page) {
  await mockAuthLogin(page, {
    status: 401,
    body: { message: 'Invalid credentials' },
  });
}

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form with all elements', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.brandLogo).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
      await expect(loginPage.requestAccessLink).toBeVisible();
    });

    test('should show welcome message', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByText('Welcome back')).toBeVisible();
      await expect(page.getByText('Sign in to your VestLedger account')).toBeVisible();
    });

    test('should require email and password', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Try to submit empty form
      await loginPage.signInButton.click();

      // Form should have required validation
      await expect(loginPage.emailInput).toHaveAttribute('required', '');
      await expect(loginPage.passwordInput).toHaveAttribute('required', '');
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      await mockLoginFailure(page);

      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(MOCK_USER.email, MOCK_USER.password);

      await expect(
        page.locator('form').getByText('Incorrect email or password. Please try again.')
      ).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to request access page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.requestAccessLink.click();
      await expect(page).toHaveURL(/\/eoi/);
    });

    test('should redirect to home dashboard after successful login', async ({ page }) => {
      await mockLoginSuccess(page);

      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(MOCK_USER.email, MOCK_USER.password);

      await expect.poll(() => new URL(page.url()).pathname, { timeout: 15000 }).toBe('/home');
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      await mockLoginSuccess(page);

      // Navigate to login with redirect parameter
      await page.goto('/login?redirect=/portfolio');

      const loginPage = new LoginPage(page);

      await loginPage.login(MOCK_USER.email, MOCK_USER.password);

      await expect.poll(() => new URL(page.url()).pathname, { timeout: 15000 }).toBe('/portfolio');
    });

    test('should normalize legacy dashboard redirect URL after login', async ({ page }) => {
      await mockLoginSuccess(page);

      await page.goto('/login?redirect=/dashboard');

      const loginPage = new LoginPage(page);
      await loginPage.login(MOCK_USER.email, MOCK_USER.password);

      await expect.poll(() => new URL(page.url()).pathname, { timeout: 15000 }).toBe('/home');
    });
  });

  test.describe('Session Management', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/home');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login from multiple protected routes', async ({ page }) => {
      const protectedRoutes = ['/home', '/portfolio', '/fund-admin', '/waterfall', '/lp-portal'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should return not found for removed dashboard route', async ({ page }) => {
      const response = await page.goto('/dashboard');
      expect(response?.status()).toBe(404);
    });
  });
});
