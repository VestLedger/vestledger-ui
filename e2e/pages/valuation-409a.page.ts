import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';
import { clickContextualTab, getContextualTab, openContextualMenu } from '../helpers/navigation-helpers';

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
    this.pageTitle = page.getByRole('heading', { level: 1, name: /409a valuations?/i });
    this.requestNewValuationButton = page.getByRole('button', { name: /request new valuation/i });

    // Tabs
    this.valuationsTab = getContextualTab(page, /valuations/i).first();
    this.strikePricesTab = getContextualTab(page, /strike prices/i);
    this.historyTab = getContextualTab(page, /valuation history/i);

    const metricCard = (title: string) =>
      page
        .locator('p', { hasText: new RegExp(`^${title}$`, 'i') })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    // Summary metrics
    this.activeValuationsMetric = metricCard('Active Valuations');
    this.expiringSoonMetric = metricCard('Expiring Soon');
    this.portfolioCompaniesMetric = metricCard('Portfolio Companies');
    this.avgFmvMetric = metricCard('Avg. FMV');

    // Valuations list
    this.valuationCards = page.locator('div.rounded-lg').filter({ hasText: /fair market value|FMV|valuation date/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/409a-valuations');
    await openContextualMenu(this.page, /409A valuations/i);
  }

  async selectValuationsTab() {
    await clickContextualTab(this.page, /valuations/i);
  }

  async selectStrikePricesTab() {
    await clickContextualTab(this.page, /strike prices/i);
  }

  async selectHistoryTab() {
    await clickContextualTab(this.page, /valuation history/i);
  }

  async getActiveValuationsCount() {
    return this.extractMetricValue(this.activeValuationsMetric);
  }

  async getExpiringSoonCount() {
    return this.extractMetricValue(this.expiringSoonMetric);
  }

  async getPortfolioCompaniesCount() {
    return this.extractMetricValue(this.portfolioCompaniesMetric);
  }

  async getAvgFmv() {
    return this.avgFmvMetric.locator('p.text-2xl, p[class*="text-2xl"]').first().textContent();
  }

  async getValuationCount() {
    return this.valuationCards.count();
  }

  async clickRequestNewValuation() {
    await this.requestNewValuationButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getValuationByCompany(companyName: string) {
    return this.page.locator('div.rounded-lg').filter({ hasText: companyName });
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
    return this.page.locator('div.rounded-lg').filter({ hasText: /expiring|expires/i });
  }

  private async extractMetricValue(metricCard: Locator): Promise<number> {
    const text = await metricCard.locator('p.text-2xl, p[class*="text-2xl"]').first().textContent();
    if (!text) return 0;
    const normalized = text.replace(/[^\d-]/g, '');
    return normalized ? parseInt(normalized, 10) : 0;
  }
}
