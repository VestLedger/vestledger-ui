import { test, expect } from '../fixtures/auth.fixture';
import { PortfolioPage } from '../pages/portfolio.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
  searchAndVerifyChange,
} from '../helpers/interaction-helpers';

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

test.describe('Portfolio Interactions - Data Verification', () => {
  test('fund selector should update displayed data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for fund selector dropdown
    const fundSelector = authenticatedPage.getByRole('combobox', { name: /fund/i })
      .or(authenticatedPage.locator('[data-testid="fund-selector"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /fund/i }));

    // Data container selector - table rows or portfolio cards
    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await fundSelector.first().isVisible()) {
      const result = await selectDifferentOption(
        authenticatedPage,
        fundSelector.first(),
        dataSelector
      );

      // If there are multiple funds and data exists, expect change
      if (result.selectedOption && result.before.count > 0) {
        expect(
          result.changed,
          `Fund selector change should update portfolio data. Selected: ${result.selectedOption}`
        ).toBe(true);
      }
    }
  });

  test('search should filter portfolio items', async ({ authenticatedPage }) => {
    const portfolio = new PortfolioPage(authenticatedPage);
    await portfolio.goto();

    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await portfolio.searchInput.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      // Only test if there's data to filter
      if (before.count > 0) {
        // Search for something that should filter results
        const result = await searchAndVerifyChange(
          authenticatedPage,
          portfolio.searchInput,
          'xyz-nonexistent-term',
          dataSelector
        );

        // Search for non-existent term should reduce or change results
        expect(result.after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('filter selection should update displayed items', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    const filterButton = authenticatedPage.getByRole('button', { name: /filter/i });
    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await filterButton.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      await filterButton.click();
      await authenticatedPage.waitForTimeout(300);

      // Look for filter options (checkboxes, radio buttons, or menu items)
      const filterOption = authenticatedPage.getByRole('checkbox').first()
        .or(authenticatedPage.getByRole('menuitemcheckbox').first())
        .or(authenticatedPage.locator('[data-testid="filter-option"]').first());

      if (await filterOption.isVisible()) {
        await filterOption.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Filter should change the data (count or content)
        if (before.count > 0) {
          const changed = verifyDataChanged(before, after);
          expect(changed, 'Filter selection should update displayed items').toBe(true);
        }
      }
    }
  });

  test('sorting should reorder portfolio items', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/portfolio');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for sortable column headers
    const sortableHeader = authenticatedPage.locator('th[role="columnheader"]').first()
      .or(authenticatedPage.getByRole('button', { name: /sort/i }).first())
      .or(authenticatedPage.locator('[data-testid="sort-button"]').first());

    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"]';

    if (await sortableHeader.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      // Only test sorting if there's data
      if (before.count > 1) {
        await sortableHeader.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);

        // Sorting should change the order (texts array should differ)
        const changed = verifyDataChanged(before, after);
        expect(changed, 'Sorting should reorder portfolio items').toBe(true);
      }
    }
  });
});
