import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { FundAdminPage } from '../pages/fund-admin.page';

test.describe('Fund Active Waterfall', () => {
  test('should display Active Waterfall row in fund details', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();
    await page.waitForLoadState('networkidle');

    // Click the first fund to show details
    const fundRow = page.locator('table tbody tr, [data-testid="fund-item"]').first();

    if (await fundRow.isVisible()) {
      await fundRow.click();
      await page.waitForLoadState('networkidle');

      // Verify the Active Waterfall label appears in the fund detail
      await expect(fundAdmin.activeWaterfallLabel).toBeVisible({ timeout: 10000 });

      // Should show either a scenario name or "None set"
      const waterfallValue = page.getByText('None set')
        .or(page.locator('text=/\\w+ .* Fund|Scenario/i'));
      await expect(waterfallValue.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show Change button when fund is selected', async ({ page }) => {
    const fundAdmin = new FundAdminPage(page);
    await fundAdmin.goto();
    await page.waitForLoadState('networkidle');

    // Click the first fund to show details
    const fundRow = page.locator('table tbody tr, [data-testid="fund-item"]').first();

    if (await fundRow.isVisible()) {
      await fundRow.click();
      await page.waitForLoadState('networkidle');

      // Verify the Active Waterfall label is present
      if (await fundAdmin.activeWaterfallLabel.isVisible()) {
        // Change button should be visible for mutable funds
        await expect(fundAdmin.changeWaterfallButton).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display fund performance alongside active waterfall', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');

    // Click the first fund
    const fundRow = page.locator('table tbody tr, [data-testid="fund-item"]').first();

    if (await fundRow.isVisible()) {
      await fundRow.click();
      await page.waitForLoadState('networkidle');

      // Both Performance and Active Waterfall should be in the details grid
      const performanceLabel = page.getByText('Performance');
      const waterfallLabel = page.getByText('Active Waterfall');

      if (await performanceLabel.isVisible()) {
        await expect(waterfallLabel).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
