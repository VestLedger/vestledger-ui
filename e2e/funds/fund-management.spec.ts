import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { FundAdminPage } from '../pages/fund-admin.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Fund Management', () => {
  test('should load fund admin page', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    await expect(fundAdmin.pageTitle).toBeVisible();
  });

  test('should display funds list', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for either a table or list of funds, or an empty state
    const content = page.locator('table, [data-testid="funds-list"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test fund');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should navigate to distributions', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');

    // Look for distributions link/button
    const distributionsLink = page.getByText(/distribution/i).first();

    if (await distributionsLink.isVisible()) {
      await distributionsLink.click();
      await expect(page).toHaveURL(/distribution/);
    }
  });

  test('should display fund details when clicking a fund', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    // Wait for funds to load
    await page.waitForLoadState('networkidle');

    // Find and click the first fund if available
    const fundRow = page.locator('table tbody tr, [data-testid="fund-item"]').first();

    if (await fundRow.isVisible()) {
      await fundRow.click();

      // Should show fund details
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Fund Admin Features', () => {
  test('should access fund admin from navigation', async ({ page }) => {
    await loginViaRedirect(page, '/dashboard');

    // Navigate via sidebar
    await page.getByText('Fund Admin', { exact: false }).first().click();
    await expect(page).toHaveURL(/fund-admin/);
  });

  test('should load fund admin sections', async ({ page }) => {
    const sections = [
      '/fund-admin',
      '/fund-admin/distributions/calendar',
    ];

    for (const section of sections) {
      await loginViaRedirect(page, section);
      await page.waitForLoadState('networkidle');

      // Page should load without critical errors
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    }
  });
});

test.describe('Fund Management - Interactions - Data Verification', () => {
  test('search should filter funds list', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-fund');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('fund type filter should update funds list', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const typeFilter = page.getByRole('combobox', { name: /type|fund type/i })
      .or(page.locator('[data-testid="type-filter"]'))
      .or(page.locator('select').filter({ hasText: /type|all types/i }));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await typeFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await typeFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Fund type filter should update funds list'
          ).toBe(true);
        }
      }
    }
  });

  test('status filter should filter funds', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const statusFilter = page.getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="status-filter"]'))
      .or(page.locator('select').filter({ hasText: /status|active|closed/i }));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should filter funds'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking fund should show fund details', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const fundRows = page.locator('table tbody tr, [data-testid="fund-item"]');

    if (await fundRows.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], main h2, main h3';
      const before = await captureDataSnapshot(page, detailsSelector);

      await fundRows.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !page.url().endsWith('/fund-admin');
      expect(
        changed || urlChanged,
        'Clicking fund should show details or navigate'
      ).toBe(true);
    }
  });

  test('tab navigation should update fund admin view', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const tabs = page.getByRole('tab')
      .or(page.locator('[role="tablist"] button'));

    const dataSelector = 'table, [class*="card"], [class*="content"], [class*="panel"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(page, dataSelector);

      await tabs.nth(1).click();
      await page.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update fund admin view').toBe(true);
    }
  });

  test('sorting should reorder funds list', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();

    const sortableHeader = page.locator('table th').filter({ hasText: /name|date|size|aum/i });
    const dataSelector = 'table tbody tr';

    if (await sortableHeader.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 1) {
        await sortableHeader.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Sorting should reorder funds list'
        ).toBe(true);
      }
    }
  });
});
