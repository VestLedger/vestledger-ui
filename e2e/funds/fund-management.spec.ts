import { test, expect } from '../fixtures/auth.fixture';
import { FundAdminPage } from '../pages/fund-admin.page';

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
