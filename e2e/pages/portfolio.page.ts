import { Page, Locator } from '@playwright/test';

export class PortfolioPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly portfolioTable: Locator;
  readonly summaryCards: Locator;
  readonly filterDropdown: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.portfolioTable = page.locator('table');
    this.summaryCards = page.locator('[data-testid="summary-card"]');
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]');
    this.searchInput = page.getByPlaceholder(/search/i);
    this.exportButton = page.getByRole('button', { name: /export/i });
  }

  async goto() {
    await this.page.goto('/portfolio');
    await this.page.waitForLoadState('networkidle');
  }

  async getPortfolioRows() {
    return this.portfolioTable.locator('tbody tr');
  }

  async getPortfolioCount() {
    const rows = await this.getPortfolioRows();
    return rows.count();
  }

  async searchPortfolio(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async viewCompanyDetails(companyName: string) {
    await this.page.getByText(companyName).click();
  }

  async exportData() {
    await this.exportButton.click();
  }
}
