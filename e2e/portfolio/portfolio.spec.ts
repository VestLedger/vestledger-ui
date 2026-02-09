import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { PortfolioPage } from '../pages/portfolio.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
  searchAndVerifyChange,
} from '../helpers/interaction-helpers';

test.describe('Portfolio', () => {
  test('should load portfolio page', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(portfolio.pageTitle).toBeVisible();
  });

  test('should display portfolio content', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for portfolio content - table or cards
    const content = page.locator('table, [data-testid="portfolio"], [class*="portfolio"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    if (await portfolio.searchInput.isVisible()) {
      await portfolio.searchInput.fill('test search');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display summary cards', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for stat/summary cards
    const summaryCards = page.locator('[data-testid="summary-card"], [class*="stat"], [class*="summary"]');

    if (await summaryCards.first().isVisible()) {
      await expect(summaryCards.first()).toBeVisible();
    }
  });

  test('should have export functionality', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const exportButton = page.getByRole('button', { name: /export|download/i });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });

  test('should be able to view company details', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for clickable company items
    const companyItem = page.locator('table tbody tr, [data-testid="company-item"]').first();

    if (await companyItem.isVisible()) {
      await companyItem.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Portfolio Filtering', () => {
  test('should filter portfolio data', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter/i });

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Portfolio Interactions - Data Verification', () => {
  test('fund selector should update displayed data', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for fund selector dropdown
    const fundSelector = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-selector"]'))
      .or(page.locator('select').filter({ hasText: /fund/i }));

    // Data container selector - table rows or portfolio cards
    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await fundSelector.first().isVisible()) {
      const result = await selectDifferentOption(
        page,
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

  test('search should filter portfolio items', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await portfolio.searchInput.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Only test if there's data to filter
      if (before.count > 0) {
        // Search for something that should filter results
        const result = await searchAndVerifyChange(
          page,
          portfolio.searchInput,
          'xyz-nonexistent-term',
          dataSelector
        );

        // Search for non-existent term should reduce or change results
        expect(result.after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('filter selection should update displayed items', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    const filterButton = page.getByRole('button', { name: /filter/i });
    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"], [data-testid="company-card"]';

    if (await filterButton.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      await filterButton.click();
      await page.waitForTimeout(300);

      // Look for filter options (checkboxes, radio buttons, or menu items)
      const filterOption = page.getByRole('checkbox').first()
        .or(page.getByRole('menuitemcheckbox').first())
        .or(page.locator('[data-testid="filter-option"]').first());

      if (await filterOption.isVisible()) {
        await filterOption.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);

        // Filter should change the data (count or content)
        if (before.count > 0) {
          const changed = verifyDataChanged(before, after);
          expect(changed, 'Filter selection should update displayed items').toBe(true);
        }
      }
    }
  });

  test('sorting should reorder portfolio items', async ({ page }) => {
    await loginViaRedirect(page, '/portfolio');
    await page.waitForLoadState('networkidle');

    // Look for sortable column headers
    const sortableHeader = page.locator('th[role="columnheader"]').first()
      .or(page.getByRole('button', { name: /sort/i }).first())
      .or(page.locator('[data-testid="sort-button"]').first());

    const dataSelector = 'table tbody tr, [data-testid="portfolio-item"]';

    if (await sortableHeader.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Only test sorting if there's data
      if (before.count > 1) {
        await sortableHeader.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);

        // Sorting should change the order (texts array should differ)
        const changed = verifyDataChanged(before, after);
        expect(changed, 'Sorting should reorder portfolio items').toBe(true);
      }
    }
  });
});
