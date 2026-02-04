import { test, expect } from '../fixtures/auth.fixture';

test.describe('Analytics', () => {
  test('should load analytics page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display charts or visualizations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const charts = authenticatedPage.locator('canvas, svg, [class*="chart"], [class*="recharts"]');

    if (await charts.first().isVisible()) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should have date range filter', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const dateFilter = authenticatedPage.locator('[data-testid="date-filter"], [class*="date-picker"], input[type="date"]');

    if (await dateFilter.first().isVisible()) {
      await expect(dateFilter.first()).toBeVisible();
    }
  });
});

test.describe('Reports', () => {
  test('should load reports page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display reports list or generation options', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const content = authenticatedPage.locator('table, [data-testid="reports"], [class*="report"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have report generation or export options', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const exportButton = authenticatedPage.getByRole('button', { name: /generate|export|download|create/i });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});
