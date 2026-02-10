import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class FundAdminPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly fundsList: Locator;
  readonly createFundButton: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.fundsList = page.locator('[data-testid="funds-list"], table');
    this.createFundButton = page.getByRole('button', { name: /create|new|add/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterDropdown = page.getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="filter-dropdown"]'));
  }

  async goto() {
    await loginViaRedirect(this.page, '/fund-admin');
  }

  async getFundRows() {
    return this.page.locator('[data-testid="fund-item"], table tbody tr');
  }

  async getFundCount() {
    const rows = await this.getFundRows();
    return rows.count();
  }

  async searchFunds(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async clickFund(fundName: string) {
    await this.page.getByText(fundName).click();
  }

  async goToDistributions() {
    await this.page.getByText(/distributions/i).click();
  }
}
