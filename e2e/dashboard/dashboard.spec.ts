import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test('should load dashboard after login', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    await expect(dashboard.mainContent).toBeVisible();
  });

  test('should display sidebar navigation', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    await expect(dashboard.sidebar).toBeVisible();
  });

  test('should have working navigation links', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Test navigation to different sections
    const navItems = [
      { text: 'Portfolio', url: /portfolio/ },
      { text: 'Fund Admin', url: /fund-admin/ },
      { text: 'Documents', url: /documents/ },
    ];

    for (const item of navItems) {
      await dashboard.sidebar.getByText(item.text, { exact: false }).first().click();
      await expect(authenticatedPage).toHaveURL(item.url);
    }
  });

  test('should display dashboard stats/metrics', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Look for stat cards or metrics
    const statsCards = authenticatedPage.locator('[data-testid="stats-card"], [class*="stat"], [class*="metric"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile viewport', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });

    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    await expect(dashboard.mainContent).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to all main sections', async ({ authenticatedPage }) => {
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
      await authenticatedPage.goto(route);
      await authenticatedPage.waitForLoadState('networkidle');

      // Each page should load without errors
      const errorMessage = authenticatedPage.locator('text=/error|404|not found/i');
      await expect(errorMessage).not.toBeVisible();
    }
  });
});
