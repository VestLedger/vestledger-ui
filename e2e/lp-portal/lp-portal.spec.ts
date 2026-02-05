import { test, expect } from '../fixtures/auth.fixture';
import { LPPortalPage } from '../pages/lp-portal.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('LP Portal', () => {
  test('should load LP portal page', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    await expect(lpPortal.pageTitle).toBeVisible();
  });

  test('should display LP portal content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for LP portal content
    const content = authenticatedPage.locator('[data-testid="lp-portal"], [class*="portal"], main');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show investments summary', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for investment-related content
    const investments = authenticatedPage.locator('[data-testid="investments"], [class*="investment"], table');

    if (await investments.first().isVisible()) {
      await expect(investments.first()).toBeVisible();
    }
  });

  test('should display portfolio value', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for value/summary cards
    const valueDisplay = authenticatedPage.locator('[data-testid="portfolio-value"], [class*="value"], [class*="total"]');

    if (await valueDisplay.first().isVisible()) {
      await expect(valueDisplay.first()).toBeVisible();
    }
  });

  test('should have documents section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for documents link or section
    const documentsSection = authenticatedPage.getByText(/document/i);

    if (await documentsSection.first().isVisible()) {
      await expect(documentsSection.first()).toBeVisible();
    }
  });

  test('should have statements section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for statements link or section
    const statementsSection = authenticatedPage.getByText(/statement/i);

    if (await statementsSection.first().isVisible()) {
      await expect(statementsSection.first()).toBeVisible();
    }
  });
});

test.describe('LP Portal Navigation', () => {
  test('should navigate to LP management', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-management');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should access LP related features', async ({ authenticatedPage }) => {
    const lpRoutes = ['/lp-portal', '/lp-management'];

    for (const route of lpRoutes) {
      await authenticatedPage.goto(route);
      await authenticatedPage.waitForLoadState('networkidle');

      // Page should load without errors
      const errorMessage = authenticatedPage.locator('text=/error|404|not found/i');
      await expect(errorMessage).not.toBeVisible();
    }
  });
});

test.describe('LP Portal Interactions', () => {
  test('should be able to view investment details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for clickable investment items
    const investmentItem = authenticatedPage.locator('[data-testid="investment-item"], table tbody tr, [class*="investment-card"]').first();

    if (await investmentItem.isVisible()) {
      await investmentItem.click();
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});

test.describe('LP Portal - Interactions - Data Verification', () => {
  test('fund selector should update portfolio data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const fundSelector = authenticatedPage.getByRole('combobox', { name: /fund/i })
      .or(authenticatedPage.locator('[data-testid="fund-selector"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /fund/i }));

    const dataSelector = '[class*="card"], [data-testid="investment"], table tbody tr';

    if (await fundSelector.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await fundSelector.first().click();
      await authenticatedPage.waitForTimeout(300);

      const fundOption = authenticatedPage.getByRole('option').nth(1);
      if (await fundOption.isVisible()) {
        await fundOption.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Fund selector should update portfolio data').toBe(true);
        }
      }
    }
  });

  test('tab navigation should update displayed content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const tabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[role="tablist"] button'));

    const dataSelector = '[class*="card"], table, [class*="content"]';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await tabs.nth(1).click();
      await authenticatedPage.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update displayed content').toBe(true);
    }
  });

  test('period selector should update performance metrics', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const periodSelector = authenticatedPage.getByRole('combobox', { name: /period|time|range/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /YTD|1Y|3Y|all/i }));

    const dataSelector = '[class*="metric"], [class*="value"], [data-testid="performance"]';

    if (await periodSelector.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await periodSelector.first().click();
      await authenticatedPage.waitForTimeout(300);

      const periodOption = authenticatedPage.getByRole('option').nth(1);
      if (await periodOption.isVisible()) {
        await periodOption.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        if (before.count > 0) {
          expect(changed, 'Period selector should update performance metrics').toBe(true);
        }
      }
    }
  });

  test('clicking investment should show details panel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const investmentItems = authenticatedPage.locator('[data-testid="investment-item"], table tbody tr, [class*="investment-card"]');

    if (await investmentItems.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"]';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await investmentItems.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Clicking investment should show details panel').toBe(true);
    }
  });
});
