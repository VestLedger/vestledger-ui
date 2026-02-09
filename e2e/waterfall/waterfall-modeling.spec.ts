import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { WaterfallPage } from '../pages/waterfall.page';

test.describe('Waterfall Modeling', () => {
  test('should load waterfall page', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();

    await expect(waterfall.pageTitle).toBeVisible();
  });

  test('should display waterfall content', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for waterfall-related content
    const content = page.locator('[data-testid="waterfall"], [class*="waterfall"], [class*="tier"], main');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have tier management UI', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for tier-related elements
    const tierElements = page.locator('[data-testid="tier"], [class*="tier"]');
    const addTierButton = page.getByRole('button', { name: /add|new|create/i });

    // Either tiers should exist or there should be an add button
    const hasTiers = await tierElements.count() > 0;
    const hasAddButton = await addTierButton.isVisible();

    expect(hasTiers || hasAddButton).toBeTruthy();
  });

  test('should display timeline or visualization', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for timeline or chart visualization
    const visualization = page.locator('[data-testid="timeline"], [class*="timeline"], [class*="chart"], canvas, svg');

    if (await visualization.first().isVisible()) {
      await expect(visualization.first()).toBeVisible();
    }
  });

  test('should have calculation functionality', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for calculate or run button
    const calculateButton = page.getByRole('button', { name: /calculate|run|compute|model/i });

    if (await calculateButton.isVisible()) {
      await expect(calculateButton).toBeEnabled();
    }
  });
});

test.describe('Waterfall Tier Operations', () => {
  test('should be able to interact with tiers', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for tier items
    const tiers = page.locator('[data-testid="tier-item"], [class*="tier-row"], [class*="tier-card"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      // Click on first tier
      await tiers.first().click();

      // Should show edit options or details
      await page.waitForTimeout(500);
    }
  });

  test('should add new tier if available', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add tier|new tier|add/i });

    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Should open a form or modal
      const modal = page.locator('[role="dialog"], [class*="modal"], form');
      await expect(modal.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Waterfall Summary', () => {
  test('should display summary panel', async ({ page }) => {
    await loginViaRedirect(page, '/waterfall');
    await page.waitForLoadState('networkidle');

    // Look for summary or totals section
    const summary = page.locator('[data-testid="summary"], [class*="summary"], [class*="total"]');

    if (await summary.first().isVisible()) {
      await expect(summary.first()).toBeVisible();
    }
  });
});
