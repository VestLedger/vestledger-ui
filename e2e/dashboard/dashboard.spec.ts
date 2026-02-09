import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test('should load dashboard after login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.mainContent).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.sidebar).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Test navigation to different sections
    const navItems = [
      { text: 'Portfolio', url: /portfolio/ },
      { text: 'Fund Admin', url: /fund-admin/ },
      { text: 'Documents', url: /documents/ },
    ];

    for (const item of navItems) {
      await dashboard.sidebar.getByText(item.text, { exact: false }).first().click();
      await expect(page).toHaveURL(item.url);
    }
  });

  test('should display dashboard stats/metrics', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Look for stat cards or metrics
    const statsCards = page.locator('[data-testid="stats-card"], [class*="stat"], [class*="metric"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.mainContent).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to all main sections', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/portfolio',
      '/fund-admin',
      '/waterfall',
      '/lp-portal',
      '/pipeline',
      '/documents',
      '/analytics',
      '/reports',
      '/settings',
    ];

    for (const route of routes) {
      await loginViaRedirect(page, route);
      await page.waitForLoadState('networkidle');

      // Each page should load without errors
      const errorMessage = page.locator('text=/error|404|not found/i');
      await expect(errorMessage).not.toBeVisible();
    }
  });
});
