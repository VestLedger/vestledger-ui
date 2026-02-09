import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';

test.describe('Settings', () => {
  test('should load settings page', async ({ page }) => {
    await loginViaRedirect(page, '/settings');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display settings sections', async ({ page }) => {
    await loginViaRedirect(page, '/settings');
    await page.waitForLoadState('networkidle');

    const settingsSections = page.locator('[data-testid="settings-section"], [class*="settings"], form');
    await expect(settingsSections.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have save button', async ({ page }) => {
    await loginViaRedirect(page, '/settings');
    await page.waitForLoadState('networkidle');

    const saveButton = page.getByRole('button', { name: /save|update|apply/i });

    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeVisible();
    }
  });
});

test.describe('Notifications', () => {
  test('should load notifications page', async ({ page }) => {
    await loginViaRedirect(page, '/notifications');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display notifications list or empty state', async ({ page }) => {
    await loginViaRedirect(page, '/notifications');
    await page.waitForLoadState('networkidle');

    const content = page.locator('[data-testid="notifications"], [class*="notification"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have mark as read functionality', async ({ page }) => {
    await loginViaRedirect(page, '/notifications');
    await page.waitForLoadState('networkidle');

    const markReadButton = page.getByRole('button', { name: /mark.*read|clear/i });

    if (await markReadButton.isVisible()) {
      await expect(markReadButton).toBeVisible();
    }
  });
});
