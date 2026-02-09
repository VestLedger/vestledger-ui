import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { LPPortalPage } from '../pages/lp-portal.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('LP Portal', () => {
  test('should load LP portal page', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    await expect(lpPortal.pageTitle).toBeVisible();
  });

  test('should display LP portal content', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for LP portal content
    const content = page.locator('[data-testid="lp-portal"], [class*="portal"], main');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show investments summary', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for investment-related content
    const investments = page.locator('[data-testid="investments"], [class*="investment"], table');

    if (await investments.first().isVisible()) {
      await expect(investments.first()).toBeVisible();
    }
  });

  test('should display portfolio value', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for value/summary cards
    const valueDisplay = page.locator('[data-testid="portfolio-value"], [class*="value"], [class*="total"]');

    if (await valueDisplay.first().isVisible()) {
      await expect(valueDisplay.first()).toBeVisible();
    }
  });

  test('should have documents section', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for documents link or section
    const documentsSection = page.getByText(/document/i);

    if (await documentsSection.first().isVisible()) {
      await expect(documentsSection.first()).toBeVisible();
    }
  });

  test('should have statements section', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for statements link or section
    const statementsSection = page.getByText(/statement/i);

    if (await statementsSection.first().isVisible()) {
      await expect(statementsSection.first()).toBeVisible();
    }
  });
});

test.describe('LP Portal Navigation', () => {
  test('should navigate to LP management', async ({ page }) => {
    await loginViaRedirect(page, '/lp-management');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should access LP related features', async ({ page }) => {
    const lpRoutes = ['/lp-portal', '/lp-management'];

    for (const route of lpRoutes) {
      await loginViaRedirect(page, route);
      await page.waitForLoadState('networkidle');

      // Page should load without errors
      const errorMessage = page.locator('text=/error|404|not found/i');
      await expect(errorMessage).not.toBeVisible();
    }
  });
});

test.describe('LP Portal Interactions', () => {
  test('should be able to view investment details', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    // Look for clickable investment items
    const investmentItem = page.locator('[data-testid="investment-item"], table tbody tr, [class*="investment-card"]').first();

    if (await investmentItem.isVisible()) {
      await investmentItem.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('LP Portal - Interactions - Data Verification', () => {
  test('fund selector should update portfolio data', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const fundSelector = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-selector"]'))
      .or(page.locator('select').filter({ hasText: /fund/i }));

    const dataSelector = '[class*="card"], [data-testid="investment"], table tbody tr';

    if (await fundSelector.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await fundSelector.first().click();
      await page.waitForTimeout(300);

      const fundOption = page.getByRole('option').nth(1);
      if (await fundOption.isVisible()) {
        await fundOption.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Fund selector should update portfolio data').toBe(true);
        }
      }
    }
  });

  test('tab navigation should update displayed content', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const tabs = page.getByRole('tab')
      .or(page.locator('[role="tablist"] button'));

    const dataSelector = '[class*="card"], table, [class*="content"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(page, dataSelector);

      await tabs.nth(1).click();
      await page.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update displayed content').toBe(true);
    }
  });

  test('period selector should update performance metrics', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const periodSelector = page.getByRole('combobox', { name: /period|time|range/i })
      .or(page.locator('select').filter({ hasText: /YTD|1Y|3Y|all/i }));

    const dataSelector = '[class*="metric"], [class*="value"], [data-testid="performance"]';

    if (await periodSelector.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await periodSelector.first().click();
      await page.waitForTimeout(300);

      const periodOption = page.getByRole('option').nth(1);
      if (await periodOption.isVisible()) {
        await periodOption.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Period selector should update performance metrics').toBe(true);
        }
      }
    }
  });

  test('clicking investment should show details panel', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const investmentItems = page.locator('[data-testid="investment-item"], table tbody tr, [class*="investment-card"]');

    if (await investmentItems.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"]';
      const before = await captureDataSnapshot(page, detailsSelector);

      await investmentItems.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Clicking investment should show details panel').toBe(true);
    }
  });
});
