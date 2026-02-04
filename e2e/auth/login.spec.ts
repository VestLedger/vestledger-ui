import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form with all elements', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.brandLogo).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.roleSelect).toBeVisible();
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
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('invalid@test.com', 'wrongpassword', 'gp');

      // Wait for error message
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should allow role selection', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Test GP role selection
      await loginPage.selectRole('GP');

      // Test LP role selection
      await loginPage.selectRole('LP');
    });

    test('should navigate to request access page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.requestAccessLink.click();
      await expect(page).toHaveURL(/\/eoi/);
    });

    test('should redirect to dashboard after successful login', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Use valid test credentials (these should be configured for your test environment)
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'test@vestledger.com',
        process.env.TEST_USER_PASSWORD || 'testpassword123',
        'gp'
      );

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(dashboard|portfolio|fund-admin)/, { timeout: 15000 });
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      // Navigate to login with redirect parameter
      await page.goto('/login?redirect=/portfolio');

      const loginPage = new LoginPage(page);

      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'test@vestledger.com',
        process.env.TEST_USER_PASSWORD || 'testpassword123',
        'gp'
      );

      // Should redirect to the specified URL
      await expect(page).toHaveURL(/\/portfolio/, { timeout: 15000 });
    });
  });

  test.describe('Session Management', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login from multiple protected routes', async ({ page }) => {
      const protectedRoutes = ['/dashboard', '/portfolio', '/fund-admin', '/waterfall', '/lp-portal'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });
});
