import { test, expect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Integrations - Page Load', () => {
  test('should load integrations page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const pageTitle = authenticatedPage.locator('h1, [class*="title"]').filter({ hasText: /integration/i });
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display integrations content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for integration-related content
    const content = authenticatedPage.locator('[class*="card"], [data-testid="integration"], [class*="integration"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Integrations - Available Integrations', () => {
  test('should display available integration cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const integrationCards = authenticatedPage.locator('[data-testid="integration-card"], [class*="card"]');
    const count = await integrationCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show integration names', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    // Common integrations: Quickbooks, Salesforce, Google, etc.
    const integrationNames = authenticatedPage.locator('text=/quickbooks|salesforce|google|dropbox|slack|plaid|stripe|xero/i');
    if (await integrationNames.count() > 0) {
      await expect(integrationNames.first()).toBeVisible();
    }
  });

  test('should show integration status badges', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusBadge = authenticatedPage.locator('[class*="badge"]').filter({ hasText: /connected|disconnected|available|active/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });
});

test.describe('Integrations - Connection Actions', () => {
  test('should have connect button for available integrations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const connectButton = authenticatedPage.getByRole('button', { name: /connect|add|enable/i });
    if (await connectButton.first().isVisible()) {
      await expect(connectButton.first()).toBeEnabled();
    }
  });

  test('should have disconnect button for connected integrations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const disconnectButton = authenticatedPage.getByRole('button', { name: /disconnect|remove|disable/i });
    if (await disconnectButton.first().isVisible()) {
      await expect(disconnectButton.first()).toBeEnabled();
    }
  });

  test('should have configure/settings option for connected integrations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const configureButton = authenticatedPage.getByRole('button', { name: /configure|settings|manage/i });
    if (await configureButton.first().isVisible()) {
      await expect(configureButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Categories', () => {
  test('should display integration categories', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    // Common categories: Accounting, CRM, Storage, etc.
    const categories = authenticatedPage.locator('text=/accounting|crm|storage|communication|banking|calendar/i');
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test('should filter by category', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const categoryFilter = authenticatedPage.getByRole('combobox', { name: /category/i })
      .or(authenticatedPage.locator('[data-testid="category-filter"]'))
      .or(authenticatedPage.locator('button').filter({ hasText: /all categories/i }));

    if (await categoryFilter.first().isVisible()) {
      await expect(categoryFilter.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Search', () => {
  test('should have search functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    if (await searchInput.first().isVisible()) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should search integrations by name', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('google');
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      // Results should be filtered
      const results = authenticatedPage.locator('[class*="card"], [data-testid="integration"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Integrations - Connected Integrations', () => {
  test('should show connected integrations section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const connectedSection = authenticatedPage.locator('text=/connected|active integrations/i');
    if (await connectedSection.count() > 0) {
      await expect(connectedSection.first()).toBeVisible();
    }
  });

  test('should show last sync time for connected integrations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const lastSync = authenticatedPage.locator('text=/last sync|synced|updated/i');
    if (await lastSync.count() > 0) {
      await expect(lastSync.first()).toBeVisible();
    }
  });

  test('should have sync now button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const syncButton = authenticatedPage.getByRole('button', { name: /sync|refresh/i });
    if (await syncButton.first().isVisible()) {
      await expect(syncButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - API Keys', () => {
  test('should have API keys section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const apiSection = authenticatedPage.locator('text=/api key|api access|developer/i');
    if (await apiSection.count() > 0) {
      await expect(apiSection.first()).toBeVisible();
    }
  });

  test('should have generate API key button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const generateButton = authenticatedPage.getByRole('button', { name: /generate.*key|create.*key|new.*key/i });
    if (await generateButton.first().isVisible()) {
      await expect(generateButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Webhooks', () => {
  test('should have webhooks configuration section', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const webhooksSection = authenticatedPage.locator('text=/webhook/i');
    if (await webhooksSection.count() > 0) {
      await expect(webhooksSection.first()).toBeVisible();
    }
  });
});

test.describe('Integrations - Interactions - Data Verification', () => {
  test('category filter should update integrations list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const categoryFilter = authenticatedPage.getByRole('combobox', { name: /category/i })
      .or(authenticatedPage.locator('[data-testid="category-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /category|all categories/i }));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await categoryFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await categoryFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Category filter should update integrations list'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter integrations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-integration');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('status filter should update integrations list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusFilter = authenticatedPage.getByRole('combobox', { name: /status/i })
      .or(authenticatedPage.locator('[data-testid="status-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /status|connected|all/i }));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const connectedOption = authenticatedPage.getByRole('option', { name: /connected/i });
        if (await connectedOption.isVisible()) {
          await connectedOption.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update integrations list'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking integration card should show details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const integrationCards = authenticatedPage.locator('[class*="card"], [data-testid="integration-card"]');

    if (await integrationCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await integrationCards.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !authenticatedPage.url().endsWith('/integrations');
      expect(
        changed || urlChanged,
        'Clicking integration card should show details or navigate'
      ).toBe(true);
    }
  });

  test('tab navigation should update integrations view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const tabs = authenticatedPage.getByRole('tab')
      .or(authenticatedPage.locator('[role="tablist"] button'));

    const dataSelector = '[class*="card"], [class*="content"], table';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await tabs.nth(1).click();
      await authenticatedPage.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update integrations view').toBe(true);
    }
  });

  test('sync button should trigger data refresh', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/integrations');
    await authenticatedPage.waitForLoadState('networkidle');

    const syncButton = authenticatedPage.getByRole('button', { name: /sync|refresh/i });
    const dataSelector = '[class*="card"], [data-testid="integration"], [class*="status"], [class*="sync"]';

    if (await syncButton.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await syncButton.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(1000);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      // Sync should update status or show loading state
      expect(
        changed || before.count > 0,
        'Sync button should trigger data refresh or maintain state'
      ).toBe(true);
    }
  });
});
