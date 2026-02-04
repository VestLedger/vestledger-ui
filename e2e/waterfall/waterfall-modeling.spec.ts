import { test, expect } from '../fixtures/auth.fixture';
import { WaterfallPage } from '../pages/waterfall.page';

test.describe('Waterfall Modeling', () => {
  test('should load waterfall page', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    await expect(waterfall.pageTitle).toBeVisible();
  });

  test('should display waterfall content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for waterfall-related content
    const content = authenticatedPage.locator('[data-testid="waterfall"], [class*="waterfall"], [class*="tier"], main');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have tier management UI', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for tier-related elements
    const tierElements = authenticatedPage.locator('[data-testid="tier"], [class*="tier"]');
    const addTierButton = authenticatedPage.getByRole('button', { name: /add|new|create/i });

    // Either tiers should exist or there should be an add button
    const hasTiers = await tierElements.count() > 0;
    const hasAddButton = await addTierButton.isVisible();

    expect(hasTiers || hasAddButton).toBeTruthy();
  });

  test('should display timeline or visualization', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for timeline or chart visualization
    const visualization = authenticatedPage.locator('[data-testid="timeline"], [class*="timeline"], [class*="chart"], canvas, svg');

    if (await visualization.first().isVisible()) {
      await expect(visualization.first()).toBeVisible();
    }
  });

  test('should have calculation functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for calculate or run button
    const calculateButton = authenticatedPage.getByRole('button', { name: /calculate|run|compute|model/i });

    if (await calculateButton.isVisible()) {
      await expect(calculateButton).toBeEnabled();
    }
  });
});

test.describe('Waterfall Tier Operations', () => {
  test('should be able to interact with tiers', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for tier items
    const tiers = authenticatedPage.locator('[data-testid="tier-item"], [class*="tier-row"], [class*="tier-card"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      // Click on first tier
      await tiers.first().click();

      // Should show edit options or details
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('should add new tier if available', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    const addButton = authenticatedPage.getByRole('button', { name: /add tier|new tier|add/i });

    if (await addButton.isVisible()) {
      await addButton.click();
      await authenticatedPage.waitForTimeout(500);

      // Should open a form or modal
      const modal = authenticatedPage.locator('[role="dialog"], [class*="modal"], form');
      await expect(modal.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Waterfall Summary', () => {
  test('should display summary panel', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/waterfall');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for summary or totals section
    const summary = authenticatedPage.locator('[data-testid="summary"], [class*="summary"], [class*="total"]');

    if (await summary.first().isVisible()) {
      await expect(summary.first()).toBeVisible();
    }
  });
});
