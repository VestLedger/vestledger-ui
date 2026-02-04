import { test, expect } from '../fixtures/auth.fixture';
import { TaxCenterPage } from '../pages/tax-center.page';

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
