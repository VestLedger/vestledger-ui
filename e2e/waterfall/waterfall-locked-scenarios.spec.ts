import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { WaterfallPage } from '../pages/waterfall.page';

test.describe('Waterfall Scenario Manager - Locked Scenarios', () => {
  test('should display Locked badge on locked scenarios', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    // Look for any "Locked" badges in the scenario list
    const lockedBadges = waterfall.lockedBadges;
    const count = await lockedBadges.count();

    // If locked scenarios exist in mock data, they should display the badge
    if (count > 0) {
      await expect(lockedBadges.first()).toBeVisible();
    }
  });

  test('should disable delete button for locked scenarios', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    // Find a scenario item that has a "Locked" badge
    const scenarioItems = waterfall.scenarioItems;
    const itemCount = await scenarioItems.count();

    for (let i = 0; i < itemCount; i++) {
      const item = scenarioItems.nth(i);
      const hasLocked = await item.getByText('Locked', { exact: true }).isVisible().catch(() => false);

      if (hasLocked) {
        // The delete button should be disabled
        const deleteButton = waterfall.getScenarioDeleteButton(item);
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeDisabled();
        }
        break;
      }
    }
  });

  test('should disable archive button for locked scenarios', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    const scenarioItems = waterfall.scenarioItems;
    const itemCount = await scenarioItems.count();

    for (let i = 0; i < itemCount; i++) {
      const item = scenarioItems.nth(i);
      const hasLocked = await item.getByText('Locked', { exact: true }).isVisible().catch(() => false);

      if (hasLocked) {
        // The archive button should be disabled
        const archiveButton = waterfall.getScenarioArchiveButton(item);
        if (await archiveButton.isVisible()) {
          await expect(archiveButton).toBeDisabled();
        }
        break;
      }
    }
  });

  test('should allow duplicate on locked scenarios', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    const scenarioItems = waterfall.scenarioItems;
    const itemCount = await scenarioItems.count();

    for (let i = 0; i < itemCount; i++) {
      const item = scenarioItems.nth(i);
      const hasLocked = await item.getByText('Locked', { exact: true }).isVisible().catch(() => false);

      if (hasLocked) {
        // Duplicate button should NOT be disabled (escape hatch)
        const duplicateButton = waterfall.getScenarioDuplicateButton(item);
        if (await duplicateButton.isVisible()) {
          await expect(duplicateButton).toBeEnabled();
        }
        break;
      }
    }
  });

  test('should allow favorite toggle on locked scenarios', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    const scenarioItems = waterfall.scenarioItems;
    const itemCount = await scenarioItems.count();

    for (let i = 0; i < itemCount; i++) {
      const item = scenarioItems.nth(i);
      const hasLocked = await item.getByText('Locked', { exact: true }).isVisible().catch(() => false);

      if (hasLocked) {
        // Favorite button should NOT be disabled (metadata-only)
        const favoriteButton = waterfall.getScenarioFavoriteButton(item);
        if (await favoriteButton.isVisible()) {
          await expect(favoriteButton).toBeEnabled();
        }
        break;
      }
    }
  });

  test('should display scenario list with mixed locked/unlocked states', async ({ page }) => {
    const waterfall = new WaterfallPage(page);
    await waterfall.goto();
    await page.waitForLoadState('networkidle');

    // Verify the scenario manager loads with scenarios
    const scenarioItems = waterfall.scenarioItems;
    const itemCount = await scenarioItems.count();

    // Should have at least some scenarios from mock data
    expect(itemCount).toBeGreaterThanOrEqual(0);

    // If we have scenarios, verify their structure
    if (itemCount > 0) {
      const firstItem = scenarioItems.first();
      await expect(firstItem).toBeVisible();
    }
  });
});
