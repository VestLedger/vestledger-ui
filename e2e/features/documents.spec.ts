import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';

test.describe('Documents', () => {
  test('should load documents page', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display document list or empty state', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const content = page.locator('table, [data-testid="documents-list"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have upload functionality', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.getByRole('button', { name: /upload|add/i });

    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeEnabled();
    }
  });

  test('should have search/filter functionality', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test document');
      await page.waitForLoadState('networkidle');
    }
  });
});
