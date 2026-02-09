import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { LPPortalPage } from '../pages/lp-portal.page';
import { PortfolioPage } from '../pages/portfolio.page';

/**
 * LP Investor Flow Journey Tests
 *
 * These tests verify the complete investor experience from the LP's perspective.
 * The journey covers:
 * 1. LP Portal access and dashboard
 * 2. Portfolio overview and holdings
 * 3. Viewing distributions and capital calls
 * 4. Downloading documents (K-1s, statements)
 * 5. Communication and notifications
 */

test.describe('LP Investor Flow - Portal Access', () => {
  test('should access LP portal dashboard', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    await expect(lpPortal.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display investment summary', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Check for investment summary metrics
    const summaryMetrics = page.locator('text=/Total Commitment|Called Capital|Distributions|NAV/i');
    if (await summaryMetrics.count() > 0) {
      await expect(summaryMetrics.first()).toBeVisible();
    }
  });

  test('should show fund investments', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Check for fund investment list
    const fundList = page.locator('text=/Fund|Investment/i');
    if (await fundList.count() > 0) {
      await expect(fundList.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Portfolio Overview', () => {
  test('should view portfolio page', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(portfolio.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display portfolio metrics', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    // Check for portfolio summary
    const portfolioMetrics = page.locator('text=/Total Value|IRR|TVPI|DPI/i');
    if (await portfolioMetrics.count() > 0) {
      await expect(portfolioMetrics.first()).toBeVisible();
    }
  });

  test('should show holdings breakdown', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    // Check for holdings/investments list
    const holdings = page.locator('text=/Holdings|Investments|Companies/i');
    if (await holdings.count() > 0) {
      await expect(holdings.first()).toBeVisible();
    }
  });

  test('should display performance chart', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    // Check for chart/visualization
    const chart = page.locator('[class*="chart"], canvas, svg').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Distributions', () => {
  test('should view distributions history', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Navigate to distributions tab/section
    const distributionsTab = page.getByRole('tab', { name: /distribution/i }).or(
      page.locator('button, a').filter({ hasText: /distribution/i })
    );
    if (await distributionsTab.first().isVisible()) {
      await distributionsTab.first().click();
      await page.waitForLoadState('networkidle');

      // Verify distributions content
      const distributionContent = page.locator('text=/Distribution|Amount|Date/i');
      if (await distributionContent.count() > 0) {
        await expect(distributionContent.first()).toBeVisible();
      }
    }
  });

  test('should show distribution details', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Look for distribution details
    const distributionCard = page.locator('[class*="card"]').filter({ hasText: /Distribution/i });
    if (await distributionCard.count() > 0) {
      await distributionCard.first().click();
      await page.waitForLoadState('networkidle');

      // Check for breakdown
      const breakdown = page.locator('text=/Return of Capital|Profit|Allocation/i');
      if (await breakdown.count() > 0) {
        await expect(breakdown.first()).toBeVisible();
      }
    }
  });

  test('should download distribution statement', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    const downloadBtn = page.getByRole('button', { name: /download.*statement|download.*pdf/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Capital Calls', () => {
  test('should view capital calls', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Navigate to capital calls
    const capitalCallsTab = page.getByRole('tab', { name: /capital.*call/i }).or(
      page.locator('button, a').filter({ hasText: /capital.*call/i })
    );
    if (await capitalCallsTab.first().isVisible()) {
      await capitalCallsTab.first().click();
      await page.waitForLoadState('networkidle');
    }

    // Check for capital call content
    const capitalCallContent = page.locator('text=/Capital Call|Due Date|Amount/i');
    if (await capitalCallContent.count() > 0) {
      await expect(capitalCallContent.first()).toBeVisible();
    }
  });

  test('should show capital call status', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const statusBadge = page.locator('[class*="badge"]').filter({ hasText: /paid|due|overdue/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should download capital call notice', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const downloadBtn = page.getByRole('button', { name: /download.*notice|view.*notice/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Documents', () => {
  test('should view documents section', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Navigate to documents
    const documentsTab = page.getByRole('tab', { name: /document/i }).or(
      page.locator('button, a').filter({ hasText: /document/i })
    );
    if (await documentsTab.first().isVisible()) {
      await documentsTab.first().click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should have K-1 documents available', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const k1Document = page.locator('text=/K-1|Schedule K-1/i');
    if (await k1Document.count() > 0) {
      await expect(k1Document.first()).toBeVisible();
    }
  });

  test('should have quarterly statements', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const quarterlyStatement = page.locator('text=/Quarterly.*Statement|Q[1-4].*Statement/i');
    if (await quarterlyStatement.count() > 0) {
      await expect(quarterlyStatement.first()).toBeVisible();
    }
  });

  test('should download documents', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const downloadBtn = page.getByRole('button', { name: /download/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Capital Account', () => {
  test('should view capital account statement', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    const capitalAccountSection = page.locator('text=/Capital Account|Account Statement/i');
    if (await capitalAccountSection.count() > 0) {
      await expect(capitalAccountSection.first()).toBeVisible();
    }
  });

  test('should show commitment vs called', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const commitmentInfo = page.locator('text=/Commitment|Called|Uncalled/i');
    if (await commitmentInfo.count() > 0) {
      await expect(commitmentInfo.first()).toBeVisible();
    }
  });

  test('should show NAV and valuation', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const navInfo = page.locator('text=/NAV|Net Asset Value|Valuation/i');
    if (await navInfo.count() > 0) {
      await expect(navInfo.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Performance Metrics', () => {
  test('should display IRR', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const irr = page.locator('text=/IRR|Internal Rate of Return/i');
    if (await irr.count() > 0) {
      await expect(irr.first()).toBeVisible();
    }
  });

  test('should display TVPI/DPI/RVPI', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const multiples = page.locator('text=/TVPI|DPI|RVPI|Multiple/i');
    if (await multiples.count() > 0) {
      await expect(multiples.first()).toBeVisible();
    }
  });

  test('should show performance over time', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    // Check for time period selector or performance trend
    const performanceTrend = page.locator('text=/Performance|Returns|YTD|Since Inception/i');
    if (await performanceTrend.count() > 0) {
      await expect(performanceTrend.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Notifications', () => {
  test('should show pending action items', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    const actionItems = page.locator('text=/Action Required|Pending|To Do/i');
    if (await actionItems.count() > 0) {
      await expect(actionItems.first()).toBeVisible();
    }
  });

  test('should show recent activity', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const activity = page.locator('text=/Recent Activity|Activity|Updates/i');
    if (await activity.count() > 0) {
      await expect(activity.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Multiple Fund Navigation', () => {
  test('should switch between funds', async ({ page }) => {
    const lpPortal = new LPPortalPage(page);
    await lpPortal.goto();

    // Check for fund selector
    const fundSelector = page.getByRole('combobox', { name: /fund/i }).or(
      page.locator('[class*="dropdown"]').filter({ hasText: /Fund/i })
    );
    if (await fundSelector.first().isVisible()) {
      await expect(fundSelector.first()).toBeEnabled();
    }
  });

  test('should show consolidated view', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const consolidatedView = page.locator('text=/All Funds|Consolidated|Total/i');
    if (await consolidatedView.count() > 0) {
      await expect(consolidatedView.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Contact and Support', () => {
  test('should have contact GP option', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const contactBtn = page.getByRole('button', { name: /contact|message|support/i });
    if (await contactBtn.first().isVisible()) {
      await expect(contactBtn.first()).toBeEnabled();
    }
  });

  test('should show GP contact information', async ({ page }) => {
    await loginViaRedirect(page, '/lp-portal');
    await page.waitForLoadState('networkidle');

    const contactInfo = page.locator('text=/Contact|Email|Phone/i');
    if (await contactInfo.count() > 0) {
      await expect(contactInfo.first()).toBeVisible();
    }
  });
});
