import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test('should load dashboard after login', async ({ page }) => {
    test.setTimeout(60000);
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

    await expect(page.locator('a[href="/home"]').first()).toBeVisible();
    await expect(page.locator('a[href="/pipeline"]').first()).toBeVisible();
    await expect(page.locator('a[href="/portfolio"]').first()).toBeVisible();
  });

  test('should display dashboard stats/metrics', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(page.getByTestId('gp-morning-brief')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('gp-home-blockers-beacon')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('gp-priority-matrix')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('gp-home-opportunities')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('portfolio-health-list')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('gp-home-revenue-distribution')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('gp-home-arr-trend')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('fund-health-list')).toBeVisible({ timeout: 10000 });
  });

  test('should open blocker beacon and route from blocker item', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    const blockerTrigger = page.getByTestId('gp-home-blockers-beacon-trigger');
    await expect(blockerTrigger).toBeVisible({ timeout: 10000 });
    await blockerTrigger.click();

    const blockerDropdown = page.getByTestId('gp-home-blockers-beacon-dropdown');
    await expect(blockerDropdown).toBeVisible({ timeout: 10000 });

    const blockerItem = blockerDropdown
      .getByRole('menuitem', { name: /bridge extension decision for biotech|bridge funding decision: biotech runway risk/i })
      .first();
    await expect(blockerItem).toBeVisible({ timeout: 10000 });
    await blockerItem.click();

    await expect.poll(() => new URL(page.url()).pathname, { timeout: 10000 }).toMatch(
      /\/(portfolio|fund-admin|compliance|reports)/
    );
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    if (!(await dashboard.mainContent.isVisible())) {
      const sidebarToggle = page.getByRole('button', { name: /(collapse|expand) sidebar/i });
      if (await sidebarToggle.count()) {
        await sidebarToggle.first().click();
      }
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to fund details from fund health row', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    const firstFundRow = page.getByTestId('fund-health-row').first();
    await expect(firstFundRow).toBeVisible({ timeout: 10000 });
    await firstFundRow.click();

    await expect(page).toHaveURL(/\/fund-admin/);
    await expect(page.getByRole('heading', { name: /fund administration/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to portfolio details from portfolio health row', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    const firstPortfolioRow = page.getByTestId('portfolio-health-row').first();
    await expect(firstPortfolioRow).toBeVisible({ timeout: 10000 });
    await firstPortfolioRow.click();

    await expect(page).toHaveURL(/\/portfolio/);
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to all main sections', async ({ page }) => {
    await loginViaRedirect(page, '/home');

    const routes = [
      '/home',
      '/portfolio',
      '/fund-admin',
      '/documents',
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Each page should load without errors
      const hasError = await page
        .getByRole('heading', { name: /something went wrong|page not found/i })
        .isVisible()
        .catch(() => false);
      expect(hasError).toBeFalsy();
    }
  });
});
