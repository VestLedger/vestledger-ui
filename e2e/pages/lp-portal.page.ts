import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class LPPortalPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly investmentsSummary: Locator;
  readonly documentsSection: Locator;
  readonly statementsSection: Locator;
  readonly portfolioValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.investmentsSummary = page.locator('[data-testid="investments-summary"]');
    this.documentsSection = page.locator('[data-testid="documents"]');
    this.statementsSection = page.locator('[data-testid="statements"]');
    this.portfolioValue = page.locator('[data-testid="portfolio-value"]');
  }

  async goto() {
    await loginViaRedirect(this.page, '/lp-portal');
  }

  async getInvestments() {
    return this.page.locator('[data-testid="investment-item"]');
  }

  async getInvestmentCount() {
    const investments = await this.getInvestments();
    return investments.count();
  }

  async viewInvestmentDetails(name: string) {
    await this.page.getByText(name).click();
  }

  async viewDocuments() {
    await this.documentsSection.click();
  }

  async viewStatements() {
    await this.statementsSection.click();
  }
}