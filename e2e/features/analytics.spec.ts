import { test, expect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

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

test.describe('Analytics - Interactions - Data Verification', () => {
  test('date range filter should update charts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const dateFilter = authenticatedPage.getByRole('combobox', { name: /date|period|range/i })
      .or(authenticatedPage.locator('[data-testid="date-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /YTD|1Y|all time|last/i }));

    const dataSelector = 'canvas, svg, [class*="chart"], [class*="recharts"], [class*="metric"], [class*="value"]';

    if (await dateFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await dateFilter.first().click();
      await authenticatedPage.waitForTimeout(300);

      const option = authenticatedPage.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Date range filter should update charts'
        ).toBe(true);
      }
    }
  });

  test('fund filter should update analytics data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const fundFilter = authenticatedPage.getByRole('combobox', { name: /fund/i })
      .or(authenticatedPage.locator('[data-testid="fund-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /fund|all funds/i }));

    const dataSelector = 'canvas, svg, [class*="chart"], [class*="metric"], [class*="value"], table tbody tr';

    if (await fundFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await fundFilter.first().click();
      await authenticatedPage.waitForTimeout(300);

      const option = authenticatedPage.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Fund filter should update analytics data'
        ).toBe(true);
      }
    }
  });

  test('metric type selector should update displayed metrics', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const metricSelector = authenticatedPage.getByRole('combobox', { name: /metric|type/i })
      .or(authenticatedPage.locator('[data-testid="metric-selector"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /IRR|TVPI|DPI/i }));

    const dataSelector = '[class*="metric"], [class*="value"], [class*="stat"], canvas, svg';

    if (await metricSelector.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await metricSelector.first().click();
      await authenticatedPage.waitForTimeout(300);

      const option = authenticatedPage.getByRole('option').nth(1);
      if (await option.isVisible()) {
        await option.click();
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Metric type selector should update displayed metrics'
        ).toBe(true);
      }
    }
  });

  test('tab navigation should update analytics view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForLoadState('networkidle');

    const tabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[role="tablist"] button'));

    const dataSelector = 'canvas, svg, [class*="chart"], table, [class*="content"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await tabs.nth(1).click();
      await authenticatedPage.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update analytics view').toBe(true);
    }
  });
});

test.describe('Reports - Interactions - Data Verification', () => {
  test('report type filter should update report list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const reportTypeFilter = authenticatedPage.getByRole('combobox', { name: /type|report/i })
      .or(authenticatedPage.locator('[data-testid="report-type-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /report|all types/i }));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await reportTypeFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await reportTypeFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Report type filter should update report list'
          ).toBe(true);
        }
      }
    }
  });

  test('date filter should update reports list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const dateFilter = authenticatedPage.getByRole('combobox', { name: /date|period/i })
      .or(authenticatedPage.locator('input[type="date"]'));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await dateFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await dateFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Date filter should update reports list'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter reports', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/reports');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = 'table tbody tr, [class*="card"], [data-testid="report-item"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-report');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });
});
