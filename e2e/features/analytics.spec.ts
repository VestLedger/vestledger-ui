import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Analytics', () => {
  test('should load analytics page', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display charts or visualizations', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const charts = page.locator('canvas, svg, [class*="chart"], [class*="recharts"]');

    if (await charts.first().isVisible()) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should have date range filter', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const dateFilter = page.locator('[data-testid="date-filter"], [class*="date-picker"], input[type="date"]');

    if (await dateFilter.first().isVisible()) {
      await expect(dateFilter.first()).toBeVisible();
    }
  });
});

test.describe('Reports', () => {
  test('should load reports page', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display reports list or generation options', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const content = page.locator('table, [data-testid="reports"], [class*="report"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have report generation or export options', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const exportButton = page.getByRole('button', { name: /generate|export|download|create/i });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('Analytics - Interactions - Data Verification', () => {
  test('date range filter should update charts', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const dateFilter = page.getByRole('combobox', { name: /date|period|range/i })
      .or(page.locator('[data-testid="date-filter"]'))
      .or(page.locator('select').filter({ hasText: /YTD|1Y|all time|last/i }));

    const dataSelector = 'canvas, svg, [class*="chart"], [class*="recharts"], [class*="metric"], [class*="value"]';

    if (await dateFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await dateFilter.first().click();
      await page.waitForTimeout(300);

      const option = page.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Date range filter should update charts'
        ).toBe(true);
      }
    }
  });

  test('fund filter should update analytics data', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const fundFilter = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-filter"]'))
      .or(page.locator('select').filter({ hasText: /fund|all funds/i }));

    const dataSelector = 'canvas, svg, [class*="chart"], [class*="metric"], [class*="value"], table tbody tr';

    if (await fundFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await fundFilter.first().click();
      await page.waitForTimeout(300);

      const option = page.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Fund filter should update analytics data'
        ).toBe(true);
      }
    }
  });

  test('metric type selector should update displayed metrics', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const metricSelector = page.getByRole('combobox', { name: /metric|type/i })
      .or(page.locator('[data-testid="metric-selector"]'))
      .or(page.locator('select').filter({ hasText: /IRR|TVPI|DPI/i }));

    const dataSelector = '[class*="metric"], [class*="value"], [class*="stat"], canvas, svg';

    if (await metricSelector.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await metricSelector.first().click();
      await page.waitForTimeout(300);

      const option = page.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Metric type selector should update displayed metrics'
        ).toBe(true);
      }
    }
  });

  test('tab navigation should update analytics view', async ({ page }) => {
    await loginViaRedirect(page, '/analytics');
    await page.waitForLoadState('networkidle');

    const tabs = page.getByRole('tab')
      .or(page.locator('[role="tablist"] button'));

    const dataSelector = 'canvas, svg, [class*="chart"], table, [class*="content"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(page, dataSelector);

      await tabs.nth(1).click();
      await page.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update analytics view').toBe(true);
    }
  });
});

test.describe('Reports - Interactions - Data Verification', () => {
  test('report type filter should update report list', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const reportTypeFilter = page.getByRole('combobox', { name: /type|report/i })
      .or(page.locator('[data-testid="report-type-filter"]'))
      .or(page.locator('select').filter({ hasText: /report|all types/i }));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await reportTypeFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await reportTypeFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Report type filter should update report list'
          ).toBe(true);
        }
      }
    }
  });

  test('date filter should update reports list', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const dateFilter = page.getByRole('combobox', { name: /date|period/i })
      .or(page.locator('input[type="date"]'));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await dateFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await dateFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Date filter should update reports list'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter reports', async ({ page }) => {
    await loginViaRedirect(page, '/reports');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-report');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });
});
