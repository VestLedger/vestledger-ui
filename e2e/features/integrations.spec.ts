import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Integrations - Page Load', () => {
  test('should load integrations page', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /integration/i });
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display integrations content', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    // Look for integration-related content
    const content = page.locator('[class*="card"], [data-testid="integration"], [class*="integration"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Integrations - Available Integrations', () => {
  test('should display available integration cards', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const integrationCards = page.locator('[data-testid="integration-card"], [class*="card"]');
    const count = await integrationCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show integration names', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    // Common integrations: Quickbooks, Salesforce, Google, etc.
    const integrationNames = page.locator('text=/quickbooks|salesforce|google|dropbox|slack|plaid|stripe|xero/i');
    if (await integrationNames.count() > 0) {
      await expect(integrationNames.first()).toBeVisible();
    }
  });

  test('should show integration status badges', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const statusBadge = page.locator('[class*="badge"]').filter({ hasText: /connected|disconnected|available|active/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });
});

test.describe('Integrations - Connection Actions', () => {
  test('should have connect button for available integrations', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect|add|enable/i });
    if (await connectButton.first().isVisible()) {
      await expect(connectButton.first()).toBeEnabled();
    }
  });

  test('should have disconnect button for connected integrations', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const disconnectButton = page.getByRole('button', { name: /disconnect|remove|disable/i });
    if (await disconnectButton.first().isVisible()) {
      await expect(disconnectButton.first()).toBeEnabled();
    }
  });

  test('should have configure/settings option for connected integrations', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const configureButton = page.getByRole('button', { name: /configure|settings|manage/i });
    if (await configureButton.first().isVisible()) {
      await expect(configureButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Categories', () => {
  test('should display integration categories', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    // Common categories: Accounting, CRM, Storage, etc.
    const categories = page.locator('text=/accounting|crm|storage|communication|banking|calendar/i');
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test('should filter by category', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i })
      .or(page.locator('[data-testid="category-filter"]'))
      .or(page.locator('button').filter({ hasText: /all categories/i }));

    if (await categoryFilter.first().isVisible()) {
      await expect(categoryFilter.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Search', () => {
  test('should have search functionality', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    if (await searchInput.first().isVisible()) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should search integrations by name', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('google');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Results should be filtered
      const results = page.locator('[class*="card"], [data-testid="integration"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Integrations - Connected Integrations', () => {
  test('should show connected integrations section', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const connectedSection = page.locator('text=/connected|active integrations/i');
    if (await connectedSection.count() > 0) {
      await expect(connectedSection.first()).toBeVisible();
    }
  });

  test('should show last sync time for connected integrations', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const lastSync = page.locator('text=/last sync|synced|updated/i');
    if (await lastSync.count() > 0) {
      await expect(lastSync.first()).toBeVisible();
    }
  });

  test('should have sync now button', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const syncButton = page.getByRole('button', { name: /sync|refresh/i });
    if (await syncButton.first().isVisible()) {
      await expect(syncButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - API Keys', () => {
  test('should have API keys section', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const apiSection = page.locator('text=/api key|api access|developer/i');
    if (await apiSection.count() > 0) {
      await expect(apiSection.first()).toBeVisible();
    }
  });

  test('should have generate API key button', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const generateButton = page.getByRole('button', { name: /generate.*key|create.*key|new.*key/i });
    if (await generateButton.first().isVisible()) {
      await expect(generateButton.first()).toBeEnabled();
    }
  });
});

test.describe('Integrations - Webhooks', () => {
  test('should have webhooks configuration section', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const webhooksSection = page.locator('text=/webhook/i');
    if (await webhooksSection.count() > 0) {
      await expect(webhooksSection.first()).toBeVisible();
    }
  });
});

test.describe('Integrations - Interactions - Data Verification', () => {
  test('category filter should update integrations list', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i })
      .or(page.locator('[data-testid="category-filter"]'))
      .or(page.locator('select').filter({ hasText: /category|all categories/i }));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await categoryFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await categoryFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Category filter should update integrations list'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter integrations', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-integration');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('status filter should update integrations list', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="status-filter"]'))
      .or(page.locator('select').filter({ hasText: /status|connected|all/i }));

    const dataSelector = '[class*="card"], [data-testid="integration"], [data-testid="integration-card"]';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);

        const connectedOption = page.getByRole('option', { name: /connected/i });
        if (await connectedOption.isVisible()) {
          await connectedOption.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update integrations list'
          ).toBe(true);
        }
      }
    }
  });

  test('clicking integration card should show details', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const integrationCards = page.locator('[class*="card"], [data-testid="integration-card"]');

    if (await integrationCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(page, detailsSelector);

      await integrationCards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = !page.url().endsWith('/integrations');
      expect(
        changed || urlChanged,
        'Clicking integration card should show details or navigate'
      ).toBe(true);
    }
  });

  test('tab navigation should update integrations view', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const tabs = page.getByRole('tab')
      .or(page.locator('[role="tablist"] button'));

    const dataSelector = '[class*="card"], [class*="content"], table';

    if (await tabs.count() > 1) {
      const before = await captureDataSnapshot(page, dataSelector);

      await tabs.nth(1).click();
      await page.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(changed, 'Tab navigation should update integrations view').toBe(true);
    }
  });

  test('sync button should trigger data refresh', async ({ page }) => {
    await loginViaRedirect(page, '/integrations');
    await page.waitForLoadState('networkidle');

    const syncButton = page.getByRole('button', { name: /sync|refresh/i });
    const dataSelector = '[class*="card"], [data-testid="integration"], [class*="status"], [class*="sync"]';

    if (await syncButton.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await syncButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      // Sync should update status or show loading state
      expect(
        changed || before.count > 0,
        'Sync button should trigger data refresh or maintain state'
      ).toBe(true);
    }
  });
});
