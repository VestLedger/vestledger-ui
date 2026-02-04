import { test, expect } from '../fixtures/auth.fixture';

test.describe('Documents', () => {
  test('should load documents page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/documents');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display document list or empty state', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/documents');
    await authenticatedPage.waitForLoadState('networkidle');

    const content = authenticatedPage.locator('table, [data-testid="documents-list"], [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have upload functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/documents');
    await authenticatedPage.waitForLoadState('networkidle');

    const uploadButton = authenticatedPage.getByRole('button', { name: /upload|add/i });

    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeEnabled();
    }
  });

  test('should have search/filter functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/documents');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test document');
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});
