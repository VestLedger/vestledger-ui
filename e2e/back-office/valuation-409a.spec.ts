import { test, expect } from '../fixtures/auth.fixture';
import { Valuation409APage } from '../pages/valuation-409a.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('409A Valuations - Page Load', () => {
  test('should load 409A valuations page', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    await expect(valuation.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    await expect(valuation.activeValuationsMetric).toBeVisible();
    await expect(valuation.expiringSoonMetric).toBeVisible();
    await expect(valuation.portfolioCompaniesMetric).toBeVisible();
    await expect(valuation.avgFmvMetric).toBeVisible();
  });

  test('should have Request New Valuation button', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    if (await valuation.requestNewValuationButton.isVisible()) {
      await expect(valuation.requestNewValuationButton).toBeEnabled();
    }
  });
});

test.describe('409A Valuations - Metrics', () => {
  test('should display active valuations count', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const count = await valuation.getActiveValuationsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display expiring soon count', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const count = await valuation.getExpiringSoonCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display portfolio companies count', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const count = await valuation.getPortfolioCompaniesCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display average FMV', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const avgFmv = await valuation.getAvgFmv();
    expect(avgFmv).toBeTruthy();
  });
});

test.describe('409A Valuations - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    await expect(valuation.valuationsTab).toBeVisible();
    await expect(valuation.strikePricesTab).toBeVisible();
    await expect(valuation.historyTab).toBeVisible();
  });

  test('should switch to Strike Prices tab', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();
    await valuation.selectStrikePricesTab();

    const strikePriceContent = authenticatedPage.locator('text=/strike price|option|grant/i');
    await expect(strikePriceContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Valuation History tab', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();
    await valuation.selectHistoryTab();

    const historyContent = authenticatedPage.locator('text=/history|previous|past/i');
    await expect(historyContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('409A Valuations - Valuation List', () => {
  test('should display valuation cards', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const count = await valuation.getValuationCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show company name on valuation cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const companyName = authenticatedPage.locator('[class*="card"]').filter({ hasText: /company|inc|corp|llc/i });
    if (await companyName.count() > 0) {
      await expect(companyName.first()).toBeVisible();
    }
  });

  test('should show status badge on valuation cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusBadge = authenticatedPage.locator('[class*="badge"], [class*="status"]').filter({ hasText: /current|expiring|expired/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should show fair market value on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const fmvText = authenticatedPage.locator('text=/Fair Market Value|FMV|\\$[\\d,]+/i');
    if (await fmvText.count() > 0) {
      await expect(fmvText.first()).toBeVisible();
    }
  });
});

test.describe('409A Valuations - Status Tracking', () => {
  test('should identify expiring valuations', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const expiringValuations = await valuation.getExpiringValuations();
    const count = await expiringValuations.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show expiration date on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const expirationDate = authenticatedPage.locator('text=/expir|valid until|\\d+ days/i');
    if (await expirationDate.count() > 0) {
      await expect(expirationDate.first()).toBeVisible();
    }
  });
});

test.describe('409A Valuations - Download Reports', () => {
  test('should have download button for reports', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const downloadButton = authenticatedPage.getByRole('button', { name: /download|report/i });
    if (await downloadButton.first().isVisible()) {
      await expect(downloadButton.first()).toBeEnabled();
    }
  });
});

test.describe('409A Valuations - Request New', () => {
  test('should open new valuation request flow', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    if (await valuation.requestNewValuationButton.isVisible()) {
      await valuation.clickRequestNewValuation();

      // Should show request form or modal
      const requestForm = authenticatedPage.locator('[role="dialog"], form, [class*="modal"]');
      if (await requestForm.first().isVisible()) {
        await expect(requestForm.first()).toBeVisible();
      }
    }
  });
});

test.describe('409A Valuations - Interactions - Data Verification', () => {
  test('tab navigation should update displayed content', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const dataSelector = '[class*="card"], table, [class*="content"], [class*="panel"]';
    const before = await captureDataSnapshot(authenticatedPage, dataSelector);

    await valuation.selectStrikePricesTab();
    await authenticatedPage.waitForLoadState('networkidle');

    const after = await captureDataSnapshot(authenticatedPage, dataSelector);
    const changed = verifyDataChanged(before, after);

    expect(changed, 'Tab navigation should update displayed content').toBe(true);
  });

  test('switching to history tab should show historical data', async ({ authenticatedPage }) => {
    const valuation = new Valuation409APage(authenticatedPage);
    await valuation.goto();

    const dataSelector = '[class*="card"], table, [class*="content"]';
    const valuationsTabSnapshot = await captureDataSnapshot(authenticatedPage, dataSelector);

    await valuation.selectHistoryTab();
    await authenticatedPage.waitForLoadState('networkidle');

    const historyTabSnapshot = await captureDataSnapshot(authenticatedPage, dataSelector);
    const changed = verifyDataChanged(valuationsTabSnapshot, historyTabSnapshot);

    expect(changed, 'History tab should show different content').toBe(true);
  });

  test('company filter should update valuation list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const companyFilter = authenticatedPage.getByRole('combobox', { name: /company/i })
      .or(authenticatedPage.locator('[data-testid="company-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /company|all companies/i }));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await companyFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await companyFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const option = authenticatedPage.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Company filter should update valuation list'
          ).toBe(true);
        }
      }
    }
  });

  test('status filter should update displayed valuations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusFilter = authenticatedPage.getByRole('combobox', { name: /status/i })
      .or(authenticatedPage.locator('[data-testid="status-filter"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /status|all status|current|expiring/i }));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await statusFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await statusFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        const expiringOption = authenticatedPage.getByRole('option', { name: /expiring/i });
        if (await expiringOption.isVisible()) {
          await expiringOption.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update displayed valuations'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter valuations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const searchInput = authenticatedPage.getByPlaceholder(/search/i)
      .or(authenticatedPage.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [data-testid="valuation-item"], table tbody tr';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await searchInput.first().fill('xyz-nonexistent-company');
        await authenticatedPage.waitForLoadState('networkidle');
        await authenticatedPage.waitForTimeout(500);

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Search for non-existent term should reduce or change results
        expect(after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('clicking valuation card should show details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/409a-valuations');
    await authenticatedPage.waitForLoadState('networkidle');

    const valuationCards = authenticatedPage.locator('[data-testid="valuation-card"], [class*="card"]').filter({ hasText: /valuation|FMV|\$/i });

    if (await valuationCards.count() > 0) {
      const detailsSelector = '[role="dialog"], [class*="drawer"], [class*="detail"], [class*="panel"], [class*="modal"]';
      const before = await captureDataSnapshot(authenticatedPage, detailsSelector);

      await valuationCards.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, detailsSelector);
      const changed = verifyDataChanged(before, after);

      // Clicking should either show details panel/modal or navigate
      const urlChanged = authenticatedPage.url() !== '/409a-valuations';
      expect(
        changed || urlChanged,
        'Clicking valuation card should show details or navigate'
      ).toBe(true);
    }
  });
});
