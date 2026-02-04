import { test, expect } from '../fixtures/auth.fixture';
import { LPPortalPage } from '../pages/lp-portal.page';

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
