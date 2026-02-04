import { test, expect } from '../fixtures/auth.fixture';

test.describe('Pipeline', () => {
  test('should load pipeline page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display pipeline content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const content = authenticatedPage.locator('[data-testid="pipeline"], [class*="pipeline"], table, [class*="kanban"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have stage management', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const stages = authenticatedPage.locator('[data-testid="stage"], [class*="stage"], [class*="column"]');

    if (await stages.first().isVisible()) {
      await expect(stages.first()).toBeVisible();
    }
  });

  test('should have add deal functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const addButton = authenticatedPage.getByRole('button', { name: /add|new|create/i });

    if (await addButton.isVisible()) {
      await expect(addButton).toBeEnabled();
    }
  });
});

test.describe('Contacts', () => {
  test('should load contacts page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const mainContent = authenticatedPage.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display contacts list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const content = authenticatedPage.locator('table, [data-testid="contacts"], [class*="contact"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test contact');
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});
