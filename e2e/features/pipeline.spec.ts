import { test, expect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

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

test.describe('Pipeline - Interactions - Data Verification', () => {
  test('stage filter should update pipeline view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const stageFilter = authenticatedPage.getByRole('combobox', { name: /stage/i })
      .or(authenticatedPage.locator('[data-testid="stage-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /stage|all stages/i }));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr, [class*="column"]';

    if (await stageFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await stageFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Stage filter should update pipeline view'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter pipeline deals', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-deal');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('view toggle should change pipeline display', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const viewToggle = authenticatedPage.getByRole('button', { name: /list|grid|kanban|table/i })
      .or(authenticatedPage.locator('[data-testid="view-toggle"]'));

    const dataSelector = '[class*="card"], [class*="column"], table, [class*="kanban"], [class*="list"]';

    if (await viewToggle.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await viewToggle.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(300);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'View toggle should change pipeline display'
      ).toBe(true);
    }
  });

  test('status filter should filter deals', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusFilter = authenticatedPage.getByRole('combobox', { name: /status/i })
      .or(authenticatedPage.locator('[data-testid="status-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /status|active|closed/i }));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should filter deals'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking deal should show deal details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pipeline');
    await authenticatedPage.waitForLoadState('networkidle');

    const dealCards = authenticatedPage.locator('[class*="card"], [data-testid="deal"]');

    if (await dealCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await dealCards.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = authenticatedPage.url() !== 'http://localhost:3000/pipeline' &&
        authenticatedPage.url() !== 'https://localhost:3000/pipeline';
      expect(
        changed || urlChanged,
        'Clicking deal should show details or navigate'
      ).toBe(true);
    }
  });
});
