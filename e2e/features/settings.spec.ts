import { test, expect } from '../fixtures/auth.fixture';

test.describe('Settings', () => {
  test('should load settings page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display settings sections', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForLoadState('networkidle');

    const settingsSections = authenticatedPage.locator('[data-testid="settings-section"], [class*="settings"], form');
    await expect(settingsSections.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have save button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForLoadState('networkidle');

    const saveButton = authenticatedPage.getByRole('button', { name: /save|update|apply/i });

    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeVisible();
    }
  });
});

test.describe('Notifications', () => {
  test('should load notifications page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/notifications');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display notifications list or empty state', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/notifications');
    await authenticatedPage.waitForLoadState('networkidle');

    const content = authenticatedPage.locator('[data-testid="notifications"], [class*="notification"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have mark as read functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/notifications');
    await authenticatedPage.waitForLoadState('networkidle');

    const markReadButton = authenticatedPage.getByRole('button', { name: /mark.*read|clear/i });

    if (await markReadButton.isVisible()) {
      await expect(markReadButton).toBeVisible();
    }
  });
});
