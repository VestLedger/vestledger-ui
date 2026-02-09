import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class Valuation409APage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly requestNewValuationButton: Locator;

  // Tabs
  readonly valuationsTab: Locator;
  readonly strikePricesTab: Locator;
  readonly historyTab: Locator;

  // Summary metrics
  readonly activeValuationsMetric: Locator;
  readonly expiringSoonMetric: Locator;
  readonly portfolioCompaniesMetric: Locator;
  readonly avgFmvMetric: Locator;

  // Valuations list
  readonly valuationCards: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { name: /409a valuation/i });
    this.requestNewValuationButton = page.getByRole('button', { name: /request new valuation/i });

    // Tabs
    this.valuationsTab = page.getByRole('tab', { name: /valuations/i }).first();
    this.strikePricesTab = page.getByRole('tab', { name: /strike prices/i });
    this.historyTab = page.getByRole('tab', { name: /valuation history/i });

    // Summary metrics
    this.activeValuationsMetric = page.locator('[class*="card"]').filter({ hasText: 'Active Valuations' });
    this.expiringSoonMetric = page.locator('[class*="card"]').filter({ hasText: 'Expiring Soon' });
    this.portfolioCompaniesMetric = page.locator('[class*="card"]').filter({ hasText: 'Portfolio Companies' });
    this.avgFmvMetric = page.locator('[class*="card"]').filter({ hasText: 'Avg. FMV' });

    // Valuations list
    this.valuationCards = page.locator('[class*="card"]').filter({ hasText: /fair market value|FMV|valuation date/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/409a-valuations');
  }

  async selectValuationsTab() {
    await this.valuationsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectStrikePricesTab() {
    await this.strikePricesTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectHistoryTab() {
    await this.historyTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getActiveValuationsCount() {
    const text = await this.activeValuationsMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getExpiringSoonCount() {
    const text = await this.expiringSoonMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getPortfolioCompaniesCount() {
    const text = await this.portfolioCompaniesMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getAvgFmv() {
    return this.avgFmvMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
  }

  async getValuationCount() {
    return this.valuationCards.count();
  }

  async clickRequestNewValuation() {
    await this.requestNewValuationButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getValuationByCompany(companyName: string) {
    return this.page.locator('[class*="card"]').filter({ hasText: companyName });
  }

  async getValuationStatus(companyName: string) {
    const card = await this.getValuationByCompany(companyName);
    const statusBadge = card.locator('[class*="badge"], [class*="status"]');
    return statusBadge.textContent();
  }

  async downloadValuationReport(companyName: string) {
    const card = await this.getValuationByCompany(companyName);
    const downloadButton = card.getByRole('button', { name: /download|report/i });
    if (await downloadButton.isVisible()) {
      await downloadButton.click();
    }
  }

  async getValuationDetails(companyName: string) {
    const card = await this.getValuationByCompany(companyName);
    if (await card.isVisible()) {
      const fmv = await card.locator('text=/\\$[\\d,]+/').first().textContent();
      const date = await card.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/').first().textContent();
      return { fmv, date };
    }
    return null;
  }

  async getExpiringValuations() {
    return this.page.locator('[class*="card"]').filter({ hasText: /expiring|expires/i });
  }
}