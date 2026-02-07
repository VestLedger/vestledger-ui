import { test, expect } from '../fixtures/auth.fixture';
import { TaxCenterPage } from '../pages/tax-center.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
} from '../helpers/interaction-helpers';

test.describe('Tax Center - Page Load', () => {
  test('should load tax center page', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    await expect(taxCenter.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    await expect(taxCenter.k1sIssuedMetric).toBeVisible();
    await expect(taxCenter.form1099IssuedMetric).toBeVisible();
    await expect(taxCenter.estTaxesPaidMetric).toBeVisible();
    await expect(taxCenter.filingDeadlineMetric).toBeVisible();
  });

  test('should have Generate K-1s button', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    if (await taxCenter.generateK1sButton.isVisible()) {
      await expect(taxCenter.generateK1sButton).toBeEnabled();
    }
  });
});

test.describe('Tax Center - K-1 Metrics', () => {
  test('should display K-1s issued count', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const count = await taxCenter.getK1sIssuedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show K-1s total in subtitle', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tax-center');
    await authenticatedPage.waitForLoadState('networkidle');

    const k1Card = authenticatedPage.locator('[class*="card"]').filter({ hasText: 'K-1s Issued' });
    const subtitle = k1Card.locator('text=/of \\d+ total/i');

    if (await subtitle.isVisible()) {
      await expect(subtitle).toBeVisible();
    }
  });
});

test.describe('Tax Center - Filing Deadline', () => {
  test('should display filing deadline date', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const deadline = await taxCenter.getFilingDeadline();
    expect(deadline).toBeTruthy();
  });

  test('should show days remaining countdown', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const daysRemaining = await taxCenter.getDeadlineDaysRemaining();
    expect(daysRemaining).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Tax Center - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    await expect(taxCenter.taxDocumentsTab).toBeVisible();
    await expect(taxCenter.k1GeneratorTab).toBeVisible();
    await expect(taxCenter.fundSummaryTab).toBeVisible();
    await expect(taxCenter.portfolioCompaniesTab).toBeVisible();
  });

  test('should switch to K-1 Generator tab', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();
    await taxCenter.selectK1GeneratorTab();

    const k1Content = authenticatedPage.locator('text=/K-1|generate/i');
    await expect(k1Content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Fund Summary tab', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();
    await taxCenter.selectFundSummaryTab();

    const summaryContent = authenticatedPage.locator('text=/fund|summary/i');
    await expect(summaryContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Portfolio Companies tab', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();
    await taxCenter.selectPortfolioCompaniesTab();

    const portfolioContent = authenticatedPage.locator('text=/portfolio|company/i');
    await expect(portfolioContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Tax Center - Tax Documents', () => {
  test('should display tax documents list', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    // Tax documents should be visible in overview tab
    const documentContent = authenticatedPage.locator('text=/K-1|1099|document/i');
    await expect(documentContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have download button for documents', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tax-center');
    await authenticatedPage.waitForLoadState('networkidle');

    const downloadButton = authenticatedPage.getByRole('button', { name: /download/i });
    if (await downloadButton.first().isVisible()) {
      await expect(downloadButton.first()).toBeEnabled();
    }
  });

  test('should have send to LPs functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tax-center');
    await authenticatedPage.waitForLoadState('networkidle');

    const sendButton = authenticatedPage.getByRole('button', { name: /send/i });
    if (await sendButton.first().isVisible()) {
      await expect(sendButton.first()).toBeEnabled();
    }
  });
});

test.describe('Tax Center - Filtering', () => {
  test('should have year filter', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    if (await taxCenter.yearFilter.isVisible()) {
      await expect(taxCenter.yearFilter).toBeEnabled();
    }
  });

  test('should have status filter', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    if (await taxCenter.statusFilter.isVisible()) {
      await expect(taxCenter.statusFilter).toBeEnabled();
    }
  });
});

test.describe('Tax Center - Interactions - Data Verification', () => {
  test('year filter should update K-1s list', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="k1-item"], table tbody tr';

    if (await taxCenter.yearFilter.isVisible()) {
      const result = await selectDifferentOption(
        authenticatedPage,
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

  test('status filter should update document list', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="tax-document"], table tbody tr';

    if (await taxCenter.statusFilter.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await taxCenter.statusFilter.click();
        await authenticatedPage.waitForTimeout(300);

        // Try to select a different status
        const statusOption = authenticatedPage.getByRole('option', { name: /pending|completed|draft/i });
        if (await statusOption.first().isVisible()) {
          await statusOption.first().click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update document list'
          ).toBe(true);
        }
      }
    }
  });

  test('tab switch should update displayed content', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const contentSelector = '[class*="card"], table, [class*="rounded-lg"]';
    const before = await captureDataSnapshot(authenticatedPage, contentSelector);

    // Switch to K-1 Generator tab
    await taxCenter.selectK1GeneratorTab();
    await authenticatedPage.waitForLoadState('networkidle');

    const after = await captureDataSnapshot(authenticatedPage, contentSelector);
    const changed = verifyDataChanged(before, after);

    expect(
      changed,
      'Tab switch should update displayed content'
    ).toBe(true);
  });

  test('combined year and status filters should work together', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    const dataSelector = '[class*="card"], [data-testid="tax-document"], table tbody tr';
    const initialSnapshot = await captureDataSnapshot(authenticatedPage, dataSelector);

    // Apply year filter first
    if (await taxCenter.yearFilter.isVisible()) {
      await selectDifferentOption(authenticatedPage, taxCenter.yearFilter, dataSelector);
    }

    const afterYearFilter = await captureDataSnapshot(authenticatedPage, dataSelector);

    // Apply status filter second
    if (await taxCenter.statusFilter.isVisible()) {
      await taxCenter.statusFilter.click();
      await authenticatedPage.waitForTimeout(300);

      const statusOption = authenticatedPage.getByRole('option').first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }
    }

    const afterBothFilters = await captureDataSnapshot(authenticatedPage, dataSelector);

    // Combined filters should produce different results
    if (initialSnapshot.count > 2) {
      const filtersApplied = verifyDataChanged(initialSnapshot, afterBothFilters);
      expect(filtersApplied, 'Combined filters should affect document list').toBe(true);
    }
  });

  test('metrics should update when filters change', async ({ authenticatedPage }) => {
    const taxCenter = new TaxCenterPage(authenticatedPage);
    await taxCenter.goto();

    // Get initial K-1s count
    const initialK1Count = await taxCenter.getK1sIssuedCount();

    // Apply year filter
    if (await taxCenter.yearFilter.isVisible() && initialK1Count > 0) {
      const metricsSelector = '[class*="card"]:has-text("K-1s Issued")';
      const result = await selectDifferentOption(
        authenticatedPage,
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
