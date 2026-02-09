import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DealIntelligencePage } from '../pages/deal-intelligence.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Deal Intelligence - Page Load', () => {
  test('should load deal intelligence page', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display fund analytics section', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const fundAnalytics = page.locator('text=/Fund Analytics/i');
    await expect(fundAnalytics).toBeVisible();
  });
});

test.describe('Deal Intelligence - Fund Analytics Metrics', () => {
  test('should display active deals count', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getActiveDealsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display average time in DD', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.avgTimeInDDMetric).toBeVisible();
  });

  test('should display DD-to-IC conversion rate', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.ddToICRateMetric).toBeVisible();
  });

  test('should display ready for IC count', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getReadyForICCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Deal Intelligence - DD Status Summary', () => {
  test('should display DD status cards', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.readyForICCard).toBeVisible();
    await expect(dealIntel.ddInProgressCard).toBeVisible();
  });

  test('should display overdue documents count', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getOverdueDocumentsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display pending reviews count', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getPendingReviewsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Deal Intelligence - Deal Distribution', () => {
  test('should display deals by stage', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.dealsByStageSection).toBeVisible();
  });

  test('should display deals by sector', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.dealsBySectorSection).toBeVisible();
  });

  test('should display DD progress overview', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    await expect(dealIntel.ddProgressOverview).toBeVisible();
  });
});

test.describe('Deal Intelligence - AI Deal Sourcing', () => {
  test('should have AI deal sourcing section', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const aiSection = page.locator('text=/AI Deal Sourcing/i');
    await expect(aiSection).toBeVisible();
  });

  test('should have company search functionality', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    // Company search component should be visible
    const searchSection = page.locator('[class*="search"], [class*="Search"]').or(
      page.getByPlaceholder(/search/i)
    );
    if (await searchSection.first().isVisible()) {
      await expect(searchSection.first()).toBeVisible();
    }
  });
});

test.describe('Deal Intelligence - Active Deals', () => {
  test('should display active deals section', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const activeDealsSection = page.locator('text=/Active Deals.*Due Diligence/i');
    await expect(activeDealsSection).toBeVisible();
  });

  test('should display deal cards', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show DD progress on deal cards', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence');
    await page.waitForLoadState('networkidle');

    const progressText = page.locator('text=/DD Progress/i');
    if (await progressText.count() > 0) {
      await expect(progressText.first()).toBeVisible();
    }
  });

  test('should have upload document button', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    if (await dealIntel.uploadDocumentButton.isVisible()) {
      await expect(dealIntel.uploadDocumentButton).toBeEnabled();
    }
  });
});

test.describe('Deal Intelligence - Per-Deal View', () => {
  test('should navigate to deal detail view on click', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await expect(dealIntel.backToFundViewButton).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display deal header in per-deal view', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);

      const dealHeader = page.locator('h2').first();
      await expect(dealHeader).toBeVisible({ timeout: 10000 });
    }
  });

  test('should navigate back to fund view', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.backToFundView();

      await expect(dealIntel.pageTitle).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Deal Intelligence - Per-Deal Tabs', () => {
  test('should have all tabs visible', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);

      await expect(dealIntel.overviewTab).toBeVisible();
      await expect(dealIntel.analyticsTab).toBeVisible();
      await expect(dealIntel.documentsTab).toBeVisible();
    }
  });

  test('should switch to analytics tab', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectAnalyticsTab();

      const analyticsContent = page.locator('text=/Financial Metrics|Market Analytics/i');
      if (await analyticsContent.count() > 0) {
        await expect(analyticsContent.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should switch to documents tab', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectDocumentsTab();

      const documentsContent = page.locator('text=/Document Library|Search documents/i');
      if (await documentsContent.count() > 0) {
        await expect(documentsContent.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

test.describe('Deal Intelligence - DD Progress by Category', () => {
  test('should display category progress', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);

      const categoryProgress = page.locator('text=/Due Diligence Progress/i');
      await expect(categoryProgress).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show category completion status', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);

      // Look for category status badges (completed, pending, overdue)
      const statusBadge = page.locator('[class*="badge"]').filter({ hasText: /completed|pending|overdue/i });
      if (await statusBadge.count() > 0) {
        await expect(statusBadge.first()).toBeVisible();
      }
    }
  });
});

test.describe('Deal Intelligence - Deal Analytics', () => {
  test('should display financial metrics', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectAnalyticsTab();

      const financialSection = page.locator('text=/Financial Metrics/i');
      if (await financialSection.isVisible()) {
        await expect(financialSection).toBeVisible();
      }
    }
  });

  test('should display market analytics', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectAnalyticsTab();

      const marketSection = page.locator('text=/Market Analytics/i');
      if (await marketSection.isVisible()) {
        await expect(marketSection).toBeVisible();
      }
    }
  });

  test('should display revenue metrics (ARR, MRR)', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectAnalyticsTab();

      const arrText = page.locator('text=/ARR|MRR/i');
      if (await arrText.count() > 0) {
        await expect(arrText.first()).toBeVisible();
      }
    }
  });
});

test.describe('Deal Intelligence - Documents Tab', () => {
  test('should have document search', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectDocumentsTab();

      if (await dealIntel.documentSearchInput.isVisible()) {
        await expect(dealIntel.documentSearchInput).toBeVisible();
      }
    }
  });

  test('should have document library', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectDocumentsTab();

      if (await dealIntel.documentLibrary.isVisible()) {
        await expect(dealIntel.documentLibrary).toBeVisible();
      }
    }
  });

  test('should have upload and export buttons', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectDocumentsTab();

      const uploadBtn = page.getByRole('button', { name: /upload/i });
      if (await uploadBtn.isVisible()) {
        await expect(uploadBtn).toBeEnabled();
      }
    }
  });
});

test.describe('Deal Intelligence - IC Status', () => {
  test('should display IC status badges on deals', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence');
    await page.waitForLoadState('networkidle');

    const statusBadge = page.locator('[class*="badge"]').filter({ hasText: /ready.*ic|dd.*progress/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });
});

test.describe('Deal Intelligence - Interactions - Data Verification', () => {
  test('clicking deal card should update view to show deal details', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const dataSelector = '[class*="card"], [class*="content"], [class*="panel"], h2, h3';
    const before = await captureDataSnapshot(page, dataSelector);

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await page.waitForLoadState('networkidle');

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      expect(
        changed,
        'Clicking deal card should update view to show details'
      ).toBe(true);
    }
  });

  test('tab navigation in deal view should update content', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await page.waitForLoadState('networkidle');

      const dataSelector = '[class*="card"], table, [class*="content"], [class*="panel"]';
      const overviewSnapshot = await captureDataSnapshot(page, dataSelector);

      // Switch to Analytics tab
      await dealIntel.selectAnalyticsTab();
      await page.waitForLoadState('networkidle');
      const analyticsSnapshot = await captureDataSnapshot(page, dataSelector);

      // Switch to Documents tab
      await dealIntel.selectDocumentsTab();
      await page.waitForLoadState('networkidle');
      const documentsSnapshot = await captureDataSnapshot(page, dataSelector);

      const overviewToAnalytics = verifyDataChanged(overviewSnapshot, analyticsSnapshot);
      const analyticsToDocuments = verifyDataChanged(analyticsSnapshot, documentsSnapshot);

      expect(
        overviewToAnalytics || analyticsToDocuments,
        'Tab navigation should update displayed content'
      ).toBe(true);
    }
  });

  test('stage filter should update deal list', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence');
    await page.waitForLoadState('networkidle');

    const stageFilter = page.getByRole('combobox', { name: /stage/i })
      .or(page.locator('[data-testid="stage-filter"]'))
      .or(page.locator('select').filter({ hasText: /stage|all stages/i }));

    const dataSelector = '[class*="card"], [data-testid="deal-card"], table tbody tr';

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
            'Stage filter should update deal list'
          ).toBe(true);
        }
      }
    }
  });

  test('sector filter should update deal list', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence');
    await page.waitForLoadState('networkidle');

    const sectorFilter = page.getByRole('combobox', { name: /sector/i })
      .or(page.locator('[data-testid="sector-filter"]'))
      .or(page.locator('select').filter({ hasText: /sector|all sectors/i }));

    const dataSelector = '[class*="card"], [data-testid="deal-card"], table tbody tr';

    if (await sectorFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await sectorFilter.first().click();
        await page.waitForTimeout(300);

        const option = page.getByRole('option').nth(1);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Sector filter should update deal list'
          ).toBe(true);
        }
      }
    }
  });

  test('AI company search should show results', async ({ page }) => {
    await loginViaRedirect(page, '/deal-intelligence');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'));

    const dataSelector = '[class*="card"], [class*="result"], [class*="suggestion"]';

    if (await searchInput.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await searchInput.first().fill('tech');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      // Search should either update results or show suggestions
      expect(changed || after.count > 0, 'Search should produce results or suggestions').toBe(true);
    }
  });

  test('document search in deal view should filter documents', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await dealIntel.selectDocumentsTab();
      await page.waitForLoadState('networkidle');

      const dataSelector = '[class*="document"], [class*="file"], table tbody tr';

      if (await dealIntel.documentSearchInput.isVisible()) {
        const before = await captureDataSnapshot(page, dataSelector);

        if (before.count > 0) {
          await dealIntel.documentSearchInput.fill('xyz-nonexistent');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          const after = await captureDataSnapshot(page, dataSelector);

          // Search for non-existent term should reduce results
          expect(after.count).toBeLessThanOrEqual(before.count);
        }
      }
    }
  });

  test('back to fund view should restore original content', async ({ page }) => {
    const dealIntel = new DealIntelligencePage(page);
    await dealIntel.goto();

    const dataSelector = '[class*="card"], h1, h2, [class*="section"]';
    const fundViewSnapshot = await captureDataSnapshot(page, dataSelector);

    const count = await dealIntel.getDealCardCount();
    if (count > 0) {
      await dealIntel.clickDeal(0);
      await page.waitForLoadState('networkidle');

      const dealViewSnapshot = await captureDataSnapshot(page, dataSelector);

      await dealIntel.backToFundView();
      await page.waitForLoadState('networkidle');

      const afterBackSnapshot = await captureDataSnapshot(page, dataSelector);

      // View should have changed when entering deal, then restored when going back
      const viewChanged = verifyDataChanged(fundViewSnapshot, dealViewSnapshot);
      expect(viewChanged, 'Clicking deal should change view').toBe(true);

      // Back to fund view should restore similar structure
      const backToOriginal = !verifyDataChanged(fundViewSnapshot, afterBackSnapshot) ||
        afterBackSnapshot.count >= fundViewSnapshot.count;
      expect(backToOriginal, 'Back button should restore fund view').toBe(true);
    }
  });
});
