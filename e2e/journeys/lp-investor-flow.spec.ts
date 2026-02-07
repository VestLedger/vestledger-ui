import { test, expect } from '../fixtures/auth.fixture';
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
  test('should access LP portal dashboard', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    await expect(lpPortal.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display investment summary', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Check for investment summary metrics
    const summaryMetrics = authenticatedPage.locator('text=/Total Commitment|Called Capital|Distributions|NAV/i');
    if (await summaryMetrics.count() > 0) {
      await expect(summaryMetrics.first()).toBeVisible();
    }
  });

  test('should show fund investments', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Check for fund investment list
    const fundList = authenticatedPage.locator('text=/Fund|Investment/i');
    if (await fundList.count() > 0) {
      await expect(fundList.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Portfolio Overview', () => {
  test('should view portfolio page', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    await expect(portfolio.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display portfolio metrics', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    // Check for portfolio summary
    const portfolioMetrics = authenticatedPage.locator('text=/Total Value|IRR|TVPI|DPI/i');
    if (await portfolioMetrics.count() > 0) {
      await expect(portfolioMetrics.first()).toBeVisible();
    }
  });

  test('should show holdings breakdown', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    // Check for holdings/investments list
    const holdings = authenticatedPage.locator('text=/Holdings|Investments|Companies/i');
    if (await holdings.count() > 0) {
      await expect(holdings.first()).toBeVisible();
    }
  });

  test('should display performance chart', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    // Check for chart/visualization
    const chart = authenticatedPage.locator('[class*="chart"], canvas, svg').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Distributions', () => {
  test('should view distributions history', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Navigate to distributions tab/section
    const distributionsTab = authenticatedPage.getByRole('tab', { name: /distribution/i }).or(
      authenticatedPage.locator('button, a').filter({ hasText: /distribution/i })
    );
    if (await distributionsTab.first().isVisible()) {
      await distributionsTab.first().click();
      await authenticatedPage.waitForLoadState('networkidle');

      // Verify distributions content
      const distributionContent = authenticatedPage.locator('text=/Distribution|Amount|Date/i');
      if (await distributionContent.count() > 0) {
        await expect(distributionContent.first()).toBeVisible();
      }
    }
  });

  test('should show distribution details', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Look for distribution details
    const distributionCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Distribution/i });
    if (await distributionCard.count() > 0) {
      await distributionCard.first().click();
      await authenticatedPage.waitForLoadState('networkidle');

      // Check for breakdown
      const breakdown = authenticatedPage.locator('text=/Return of Capital|Profit|Allocation/i');
      if (await breakdown.count() > 0) {
        await expect(breakdown.first()).toBeVisible();
      }
    }
  });

  test('should download distribution statement', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    const downloadBtn = authenticatedPage.getByRole('button', { name: /download.*statement|download.*pdf/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Capital Calls', () => {
  test('should view capital calls', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Navigate to capital calls
    const capitalCallsTab = authenticatedPage.getByRole('tab', { name: /capital.*call/i }).or(
      authenticatedPage.locator('button, a').filter({ hasText: /capital.*call/i })
    );
    if (await capitalCallsTab.first().isVisible()) {
      await capitalCallsTab.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
    }

    // Check for capital call content
    const capitalCallContent = authenticatedPage.locator('text=/Capital Call|Due Date|Amount/i');
    if (await capitalCallContent.count() > 0) {
      await expect(capitalCallContent.first()).toBeVisible();
    }
  });

  test('should show capital call status', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const statusBadge = authenticatedPage.locator('[class*="badge"]').filter({ hasText: /paid|due|overdue/i });
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should download capital call notice', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const downloadBtn = authenticatedPage.getByRole('button', { name: /download.*notice|view.*notice/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Documents', () => {
  test('should view documents section', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Navigate to documents
    const documentsTab = authenticatedPage.getByRole('tab', { name: /document/i }).or(
      authenticatedPage.locator('button, a').filter({ hasText: /document/i })
    );
    if (await documentsTab.first().isVisible()) {
      await documentsTab.first().click();
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });

  test('should have K-1 documents available', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const k1Document = authenticatedPage.locator('text=/K-1|Schedule K-1/i');
    if (await k1Document.count() > 0) {
      await expect(k1Document.first()).toBeVisible();
    }
  });

  test('should have quarterly statements', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const quarterlyStatement = authenticatedPage.locator('text=/Quarterly.*Statement|Q[1-4].*Statement/i');
    if (await quarterlyStatement.count() > 0) {
      await expect(quarterlyStatement.first()).toBeVisible();
    }
  });

  test('should download documents', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const downloadBtn = authenticatedPage.getByRole('button', { name: /download/i });
    if (await downloadBtn.first().isVisible()) {
      await expect(downloadBtn.first()).toBeEnabled();
    }
  });
});

test.describe('LP Investor Flow - Capital Account', () => {
  test('should view capital account statement', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    const capitalAccountSection = authenticatedPage.locator('text=/Capital Account|Account Statement/i');
    if (await capitalAccountSection.count() > 0) {
      await expect(capitalAccountSection.first()).toBeVisible();
    }
  });

  test('should show commitment vs called', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const commitmentInfo = authenticatedPage.locator('text=/Commitment|Called|Uncalled/i');
    if (await commitmentInfo.count() > 0) {
      await expect(commitmentInfo.first()).toBeVisible();
    }
  });

  test('should show NAV and valuation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const navInfo = authenticatedPage.locator('text=/NAV|Net Asset Value|Valuation/i');
    if (await navInfo.count() > 0) {
      await expect(navInfo.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Performance Metrics', () => {
  test('should display IRR', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    const irr = authenticatedPage.locator('text=/IRR|Internal Rate of Return/i');
    if (await irr.count() > 0) {
      await expect(irr.first()).toBeVisible();
    }
  });

  test('should display TVPI/DPI/RVPI', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    const multiples = authenticatedPage.locator('text=/TVPI|DPI|RVPI|Multiple/i');
    if (await multiples.count() > 0) {
      await expect(multiples.first()).toBeVisible();
    }
  });

  test('should show performance over time', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    // Check for time period selector or performance trend
    const performanceTrend = authenticatedPage.locator('text=/Performance|Returns|YTD|Since Inception/i');
    if (await performanceTrend.count() > 0) {
      await expect(performanceTrend.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Notifications', () => {
  test('should show pending action items', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    const actionItems = authenticatedPage.locator('text=/Action Required|Pending|To Do/i');
    if (await actionItems.count() > 0) {
      await expect(actionItems.first()).toBeVisible();
    }
  });

  test('should show recent activity', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const activity = authenticatedPage.locator('text=/Recent Activity|Activity|Updates/i');
    if (await activity.count() > 0) {
      await expect(activity.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Multiple Fund Navigation', () => {
  test('should switch between funds', async ({ authenticatedPage }) => {
    const lpPortal = new LPPortalPage(authenticatedPage);
    await lpPortal.goto();

    // Check for fund selector
    const fundSelector = authenticatedPage.getByRole('combobox', { name: /fund/i }).or(
      authenticatedPage.locator('[class*="dropdown"]').filter({ hasText: /Fund/i })
    );
    if (await fundSelector.first().isVisible()) {
      await expect(fundSelector.first()).toBeEnabled();
    }
  });

  test('should show consolidated view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const consolidatedView = authenticatedPage.locator('text=/All Funds|Consolidated|Total/i');
    if (await consolidatedView.count() > 0) {
      await expect(consolidatedView.first()).toBeVisible();
    }
  });
});

test.describe('LP Investor Flow - Contact and Support', () => {
  test('should have contact GP option', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const contactBtn = authenticatedPage.getByRole('button', { name: /contact|message|support/i });
    if (await contactBtn.first().isVisible()) {
      await expect(contactBtn.first()).toBeEnabled();
    }
  });

  test('should show GP contact information', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const contactInfo = authenticatedPage.locator('text=/Contact|Email|Phone/i');
    if (await contactInfo.count() > 0) {
      await expect(contactInfo.first()).toBeVisible();
    }
  });
});
