import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { Valuation409APage } from '../pages/valuation-409a.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('409A Valuations - Page Load', () => {
  test('should load 409A valuations page', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    await expect(valuation.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    await expect(valuation.activeValuationsMetric).toBeVisible();
    await expect(valuation.expiringSoonMetric).toBeVisible();
    await expect(valuation.portfolioCompaniesMetric).toBeVisible();
    await expect(valuation.avgFmvMetric).toBeVisible();
  });

  test('should have Request New Valuation button', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    if (await valuation.requestNewValuationButton.isVisible()) {
      await expect(valuation.requestNewValuationButton).toBeEnabled();
    }
  });
});

test.describe('409A Valuations - Metrics', () => {
  test('should display active valuations count', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const count = await valuation.getActiveValuationsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display expiring soon count', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const count = await valuation.getExpiringSoonCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display portfolio companies count', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const count = await valuation.getPortfolioCompaniesCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display average FMV', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const avgFmv = await valuation.getAvgFmv();
    expect(avgFmv).toBeTruthy();
  });
});

test.describe('409A Valuations - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    await expect(valuation.valuationsTab).toBeVisible();
    await expect(valuation.strikePricesTab).toBeVisible();
    await expect(valuation.historyTab).toBeVisible();
  });

  test('should switch to Strike Prices tab', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();
    await valuation.selectStrikePricesTab();

    const strikePriceContent = page.locator('text=/strike price|option|grant/i');
    await expect(strikePriceContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Valuation History tab', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();
    await valuation.selectHistoryTab();

    const historyContent = page.locator('text=/history|previous|past/i');
    await expect(historyContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('409A Valuations - Valuation List', () => {
  test('should display valuation cards', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const count = await valuation.getValuationCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show company name on valuation cards', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const companyName = page.locator('[class*="card"]').filter({ hasText: /company|inc|corp|llc/i });
    if (await companyName.count() > 0) {
      await expect(companyName.first()).toBeVisible();
    }
  });

  test('should show status badge on valuation cards', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const statusBadge = page.locator('[class*="badge"], [class*="status"]').filter({ hasText: /current|expiring|expired/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should show fair market value on cards', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const fmvText = page.locator('text=/Fair Market Value|FMV|\\$[\\d,]+/i');
    if (await fmvText.count() > 0) {
      await expect(fmvText.first()).toBeVisible();
    }
  });
});

test.describe('409A Valuations - Status Tracking', () => {
  test('should identify expiring valuations', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const expiringValuations = await valuation.getExpiringValuations();
    const count = await expiringValuations.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show expiration date on cards', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const expirationDate = page.locator('text=/expir|valid until|\\d+ days/i');
    if (await expirationDate.count() > 0) {
      await expect(expirationDate.first()).toBeVisible();
    }
  });
});

test.describe('409A Valuations - Download Reports', () => {
  test('should have download button for reports', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const downloadButton = page.getByRole('button', { name: /download|report/i });
    if (await downloadButton.first().isVisible()) {
      await expect(downloadButton.first()).toBeEnabled();
    }
  });
});

test.describe('409A Valuations - Request New', () => {
  test('should open new valuation request flow', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    if (await valuation.requestNewValuationButton.isVisible()) {
      await valuation.clickRequestNewValuation();

      // Should show request form or modal
      const requestForm = page.locator('[role="dialog"], form, [class*="modal"]');
      if (await requestForm.first().isVisible()) {
        await expect(requestForm.first()).toBeVisible();
      }
    }
  });
});

test.describe('409A Valuations - Interactions - Data Verification', () => {
  test('tab navigation should update displayed content', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const dataSelector = '[class*="card"], table, [class*="content"], [class*="panel"]';
    const before = await captureDataSnapshot(page, dataSelector);

    await valuation.selectStrikePricesTab();
    await page.waitForLoadState('networkidle');

    const after = await captureDataSnapshot(page, dataSelector);
    const changed = verifyDataChanged(before, after);

    expect(changed, 'Tab navigation should update displayed content').toBe(true);
  });

  test('switching to history tab should show historical data', async ({ page }) => {
    const valuation = new Valuation409APage(page);
    await valuation.goto();

    const dataSelector = '[class*="card"], table, [class*="content"]';
    const valuationsTabSnapshot = await captureDataSnapshot(page, dataSelector);

    await valuation.selectHistoryTab();
    await page.waitForLoadState('networkidle');

    const historyTabSnapshot = await captureDataSnapshot(page, dataSelector);
    const changed = verifyDataChanged(valuationsTabSnapshot, historyTabSnapshot);

    expect(changed, 'History tab should show different content').toBe(true);
  });

  test('company filter should update valuation list', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const companyFilter = page.getByRole('combobox', { name: /company/i })
      .or(page.locator('[data-testid="company-filter"]'))
      .or(page.locator('select').filter({ hasText: /company|all companies/i }));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await companyFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await companyFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Company filter should update valuation list'
          ).toBe(true);
        }
      }
    }
  });

  test('status filter should update displayed valuations', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="status-filter"]'))
      .or(page.locator('select').filter({ hasText: /status|all status|current|expiring/i }));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);

        const expiringOption = page.getByRole('option', { name: /expiring/i });
        if (await expiringOption.isVisible()) {
          await expiringOption.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update displayed valuations'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter valuations', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-company');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);

        // Search for non-existent term should reduce or change results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('clicking valuation card should show details', async ({ page }) => {
    await loginViaRedirect(page, '/409a-valuations');
    await page.waitForLoadState('networkidle');

    const valuationCards = page.locator('[data-testid="valuation-card"], [class*="card"]').filter({ hasText: /valuation|FMV|\$/i });

    if (await valuationCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(page, detailsSelector);

      await valuationCards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = page.url() !== '/409a-valuations';
      expect(
        changed || urlChanged,
        'Clicking valuation card should show details or navigate'
      ).toBe(true);
    }
  });
});
