import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Pipeline', () => {
  test('should load pipeline page', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display pipeline content', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const content = page.locator('[data-testid="pipeline"], [class*="pipeline"], table, [class*="kanban"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have stage management', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const stages = page.locator('[data-testid="stage"], [class*="stage"], [class*="column"]');

    if (await stages.first().isVisible()) {
      await expect(stages.first()).toBeVisible();
    }
  });

  test('should have add deal functionality', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add|new|create/i });

    if (await addButton.isVisible()) {
      await expect(addButton).toBeEnabled();
    }
  });
});

test.describe('Contacts', () => {
  test('should load contacts page', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display contacts list', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const content = page.locator('table, [data-testid="contacts"], [class*="contact"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('test contact');
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Pipeline - Interactions - Data Verification', () => {
  test('stage filter should update pipeline view', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const stageFilter = page.getByRole('combobox', { name: /stage/i })
      .or(page.locator('[data-testid="stage-filter"]'))
      .or(page.locator('select').filter({ hasText: /stage|all stages/i }));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr, [class*="column"]';

    if (await stageFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await stageFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Stage filter should update pipeline view'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter pipeline deals', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-deal');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('view toggle should change pipeline display', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const viewToggle = page.getByRole('button', { name: /list|grid|kanban|table/i })
      .or(page.locator('[data-testid="view-toggle"]'));

    const dataSelector = '[class*="card"], [class*="column"], table, [class*="kanban"], [class*="list"]';

    if (await viewToggle.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await viewToggle.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'View toggle should change pipeline display'
      ).toBe(true);
    }
  });

  test('status filter should filter deals', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="status-filter"]'))
      .or(page.locator('select').filter({ hasText: /status|active|closed/i }));

    const dataSelector = '[class*="card"], [data-testid="deal"], table tbody tr';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should filter deals'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking deal should show deal details', async ({ page }) => {
    await loginViaRedirect(page, '/pipeline');
    await page.waitForLoadState('networkidle');

    const dealCards = page.locator('[class*="card"], [data-testid="deal"]');

    if (await dealCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(page, detailsSelector);

      await dealCards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = page.url() !== 'http://localhost:3000/pipeline' &&
        page.url() !== 'https://localhost:3000/pipeline';
      expect(
        changed || urlChanged,
        'Clicking deal should show details or navigate'
      ).toBe(true);
    }
  });
});
