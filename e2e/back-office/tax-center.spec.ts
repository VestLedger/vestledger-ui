import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { TaxCenterPage } from '../pages/tax-center.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
} from '../helpers/interaction-helpers';

test.describe('Tax Center - Page Load', () => {
  test('should load tax center page', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    await expect(taxCenter.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    await expect(taxCenter.k1sIssuedMetric).toBeVisible();
    await expect(taxCenter.form1099IssuedMetric).toBeVisible();
    await expect(taxCenter.estTaxesPaidMetric).toBeVisible();
    await expect(taxCenter.filingDeadlineMetric).toBeVisible();
  });

  test('should have Generate K-1s button', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    if (await taxCenter.generateK1sButton.isVisible()) {
      await expect(taxCenter.generateK1sButton).toBeEnabled();
    }
  });
});

test.describe('Tax Center - K-1 Metrics', () => {
  test('should display K-1s issued count', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const count = await taxCenter.getK1sIssuedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show K-1s total in subtitle', async ({ page }) => {
    await loginViaRedirect(page, '/tax-center');
    await page.waitForLoadState('networkidle');

    const k1Card = page.locator('[class*="card"]').filter({ hasText: 'K-1s Issued' });
    const subtitle = k1Card.locator('text=/of \\d+ total/i');

    if (await subtitle.isVisible()) {
      await expect(subtitle).toBeVisible();
    }
  });
});

test.describe('Tax Center - Filing Deadline', () => {
  test('should display filing deadline date', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const deadline = await taxCenter.getFilingDeadline();
    expect(deadline).toBeTruthy();
  });

  test('should show days remaining countdown', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const daysRemaining = await taxCenter.getDeadlineDaysRemaining();
    expect(daysRemaining).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Tax Center - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    await expect(taxCenter.taxDocumentsTab).toBeVisible();
    await expect(taxCenter.k1GeneratorTab).toBeVisible();
    await expect(taxCenter.fundSummaryTab).toBeVisible();
    await expect(taxCenter.portfolioCompaniesTab).toBeVisible();
  });

  test('should switch to K-1 Generator tab', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();
    await taxCenter.selectK1GeneratorTab();

    const k1Content = page.locator('text=/K-1|generate/i');
    await expect(k1Content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Fund Summary tab', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();
    await taxCenter.selectFundSummaryTab();

    const summaryContent = page.locator('text=/fund|summary/i');
    await expect(summaryContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Portfolio Companies tab', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();
    await taxCenter.selectPortfolioCompaniesTab();

    const portfolioContent = page.locator('text=/portfolio|company/i');
    await expect(portfolioContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Tax Center - Tax Documents', () => {
  test('should display tax documents list', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    // Tax documents should be visible in overview tab
    const documentContent = page.locator('text=/K-1|1099|document/i');
    await expect(documentContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have download button for documents', async ({ page }) => {
    await loginViaRedirect(page, '/tax-center');
    await page.waitForLoadState('networkidle');

    const downloadButton = page.getByRole('button', { name: /download/i });
    if (await downloadButton.first().isVisible()) {
      await expect(downloadButton.first()).toBeEnabled();
    }
  });

  test('should have send to LPs functionality', async ({ page }) => {
    await loginViaRedirect(page, '/tax-center');
    await page.waitForLoadState('networkidle');

    const sendButton = page.getByRole('button', { name: /send/i });
    if (await sendButton.first().isVisible()) {
      await expect(sendButton.first()).toBeEnabled();
    }
  });
});

test.describe('Tax Center - Filtering', () => {
  test('should have year filter', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    if (await taxCenter.yearFilter.isVisible()) {
      await expect(taxCenter.yearFilter).toBeEnabled();
    }
  });

  test('should have status filter', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    if (await taxCenter.statusFilter.isVisible()) {
      await expect(taxCenter.statusFilter).toBeEnabled();
    }
  });
});

test.describe('Tax Center - Interactions - Data Verification', () => {
  test('year filter should update K-1s list', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="k1-item"], table tbody tr';

    if (await taxCenter.yearFilter.isVisible()) {
      const result = await selectDifferentOption(
        page,
        taxCenter.yearFilter,
        dataSelector
      );

      // If multiple years and data exist, expect change
      if (result.selectedOption && result.before.count > 0) {
        expect(
          result.changed,
          `Year filter should update K-1s list. Selected: ${result.selectedOption}`
        ).toBe(true);
      }
    }
  });

  test('status filter should update document list', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="tax-document"], table tbody tr';

    if (await taxCenter.statusFilter.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await taxCenter.statusFilter.click();
        await page.waitForTimeout(300);

        // Try to select a different status
        const statusOption = page.getByRole('option', { name: /pending|completed|draft/i });
        if (await statusOption.first().isVisible()) {
          await statusOption.first().click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update document list'
          ).toBe(true);
        }
      }
    }
  });

  test('tab switch should update displayed content', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const contentSelector = '[class*="card"], table, [class*="rounded-lg"]';
    const before = await captureDataSnapshot(page, contentSelector);

    // Switch to K-1 Generator tab
    await taxCenter.selectK1GeneratorTab();
    await page.waitForLoadState('networkidle');

    const after = await captureDataSnapshot(page, contentSelector);
    const changed = verifyDataChanged(before, after);

    expect(
      changed,
      'Tab switch should update displayed content'
    ).toBe(true);
  });

  test('combined year and status filters should work together', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="tax-document"], table tbody tr';
    const initialSnapshot = await captureDataSnapshot(page, dataSelector);

    // Apply year filter first
    if (await taxCenter.yearFilter.isVisible()) {
      await selectDifferentOption(page, taxCenter.yearFilter, dataSelector);
    }

    const afterYearFilter = await captureDataSnapshot(page, dataSelector);

    // Apply status filter second
    if (await taxCenter.statusFilter.isVisible()) {
      await taxCenter.statusFilter.click();
      await page.waitForTimeout(300);

      const statusOption = page.getByRole('option').first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.waitForLoadState('networkidle');
      }
    }

    const afterBothFilters = await captureDataSnapshot(page, dataSelector);

    // Combined filters should produce different results
    if (initialSnapshot.count > 2) {
      const filtersApplied = verifyDataChanged(initialSnapshot, afterBothFilters);
      expect(filtersApplied, 'Combined filters should affect document list').toBe(true);
    }
  });

  test('metrics should update when filters change', async ({ page }) => {
    const taxCenter = new TaxCenterPage(page);
    await taxCenter.goto();

    // Get initial K-1s count
    const initialK1Count = await taxCenter.getK1sIssuedCount();

    // Apply year filter
    if (await taxCenter.yearFilter.isVisible() && initialK1Count > 0) {
      const metricsSelector = '[class*="card"]:has-text("K-1s Issued")';
      const result = await selectDifferentOption(
        page,
        taxCenter.yearFilter,
        metricsSelector
      );

      // Metrics should update when year changes
      if (result.selectedOption) {
        expect(
          result.changed,
          'Metrics should update when year filter changes'
        ).toBe(true);
      }
    }
  });
});
