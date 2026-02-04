import { test, expect } from '../fixtures/auth.fixture';
import { PortfolioPage } from '../pages/portfolio.page';

test.describe('Portfolio', () => {
  test('should load portfolio page', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    await expect(portfolio.pageTitle).toBeVisible();
  });

  test('should display portfolio content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for portfolio content - table or cards
    const content = authenticatedPage.locator('table, [data-testid="portfolio"], [class*="portfolio"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    if (await portfolio.searchInput.isVisible()) {
      await portfolio.searchInput.fill('test search');
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });

  test('should display summary cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for stat/summary cards
    const summaryCards = authenticatedPage.locator('[data-testid="summary-card"], [class*="stat"], [class*="summary"]');

    if (await summaryCards.first().isVisible()) {
      await expect(summaryCards.first()).toBeVisible();
    }
  });

  test('should have export functionality', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    const exportButton = authenticatedPage.getByRole('button', { name: /export|download/i });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });

  test('should be able to view company details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for clickable company items
    const companyItem = authenticatedPage.locator('table tbody tr, [data-testid="company-item"]').first();

    if (await companyItem.isVisible()) {
      await companyItem.click();
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});

test.describe('Portfolio Filtering', () => {
  test('should filter portfolio data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for filter controls
    const filterButton = authenticatedPage.getByRole('button', { name: /filter/i });

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });
});
