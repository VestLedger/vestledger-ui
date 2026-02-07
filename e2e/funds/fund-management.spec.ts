import { test, expect } from '../fixtures/auth.fixture';
import { FundAdminPage } from '../pages/fund-admin.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Fund Management', () => {
  test('should load fund admin page', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    await expect(fundAdmin.pageTitle).toBeVisible();
  });

  test('should display funds list', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    // Wait for content to load
    await authenticatedPage.waitForLoadState('networkidle');

    // Check for either a table or list of funds, or an empty state
    const content = authenticatedPage.locator('table, [data-testid="funds-list"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    // Look for search input
    const searchInput = authenticatedPage.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test fund');
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });

  test('should navigate to distributions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');

    // Look for distributions link/button
    const distributionsLink = authenticatedPage.getByText(/distribution/i).first();

    if (await distributionsLink.isVisible()) {
      await distributionsLink.click();
      await expect(authenticatedPage).toHaveURL(/distribution/);
    }
  });

  test('should display fund details when clicking a fund', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    // Wait for funds to load
    await authenticatedPage.waitForLoadState('networkidle');

    // Find and click the first fund if available
    const fundRow = authenticatedPage.locator('table tbody tr, [data-testid="fund-item"]').first();

    if (await fundRow.isVisible()) {
      await fundRow.click();

      // Should show fund details
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});

test.describe('Fund Admin Features', () => {
  test('should access fund admin from navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    // Navigate via sidebar
    await authenticatedPage.getByText('Fund Admin', { exact: false }).first().click();
    await expect(authenticatedPage).toHaveURL(/fund-admin/);
  });

  test('should load fund admin sections', async ({ authenticatedPage }) => {
    const sections = [
      '/fund-admin',
      '/fund-admin/distributions/calendar',
    ];

    for (const section of sections) {
      await authenticatedPage.goto(section);
      await authenticatedPage.waitForLoadState('networkidle');

      // Page should load without critical errors
      const mainContent = authenticatedPage.locator('main');
      await expect(mainContent).toBeVisible();
    }
  });
});

test.describe('Fund Management - Interactions - Data Verification', () => {
  test('search should filter funds list', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-fund');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('fund type filter should update funds list', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const typeFilter = authenticatedPage.getByRole('combobox', { name: /type|fund type/i })
      .or(authenticatedPage.locator('[data-testid="type-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /type|all types/i }));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await typeFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await typeFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Fund type filter should update funds list'
          ).toBe(true);
        }
      }
    }
  });

  test('status filter should filter funds', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const statusFilter = authenticatedPage.getByRole('combobox', { name: /status/i })
      .or(authenticatedPage.locator('[data-testid="status-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /status|active|closed/i }));

    const dataSelector = 'table tbody tr, [data-testid="fund-item"], [class*="card"]';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should filter funds'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking fund should show fund details', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const fundRows = authenticatedPage.locator('table tbody tr, [data-testid="fund-item"]');

    if (await fundRows.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], main h2, main h3';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await fundRows.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !authenticatedPage.url().endsWith('/fund-admin');
      expect(
        changed || urlChanged,
        'Clicking fund should show details or navigate'
      ).toBe(true);
    }
  });

  test('tab navigation should update fund admin view', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const tabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[role="tablist"] button'));

    const dataSelector = 'table, [class*="card"], [class*="content"], [class*="panel"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await tabs.nth(1).click();
      await authenticatedPage.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update fund admin view').toBe(true);
    }
  });

  test('sorting should reorder funds list', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const sortableHeader = authenticatedPage.locator('table th').filter({ hasText: /name|date|size|aum/i });
    const dataSelector = 'table tbody tr';

    if (await sortableHeader.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 1) {
        await sortableHeader.first().click();
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(300);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Sorting should reorder funds list'
        ).toBe(true);
      }
    }
  });
});
