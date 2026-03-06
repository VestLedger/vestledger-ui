import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';
import { clickContextualTab, getContextualTab, openContextualMenu } from '../helpers/navigation-helpers';

export class DealIntelligencePage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // Fund Analytics metrics
  readonly activeDealsMetric: Locator;
  readonly avgTimeInDDMetric: Locator;
  readonly ddToICRateMetric: Locator;
  readonly readyForICMetric: Locator;

  // DD Status Summary
  readonly readyForICCard: Locator;
  readonly ddInProgressCard: Locator;
  readonly overdueDocumentsCard: Locator;
  readonly pendingReviewsCard: Locator;

  // Deal Distribution
  readonly dealsByStageSection: Locator;
  readonly dealsBySectorSection: Locator;
  readonly ddProgressOverview: Locator;

  // AI Deal Sourcing
  readonly companySearchSection: Locator;
  readonly companySearchInput: Locator;

  // Active Deals
  readonly uploadDocumentButton: Locator;
  readonly dealCards: Locator;

  // Per-Deal View
  readonly backToFundViewButton: Locator;
  readonly dealHeader: Locator;
  readonly dealProgressBar: Locator;

  // Tabs (in per-deal view)
  readonly overviewTab: Locator;
  readonly analyticsTab: Locator;
  readonly documentsTab: Locator;
  readonly analysisTab: Locator;
  readonly icMaterialsTab: Locator;

  // Documents tab
  readonly documentSearchInput: Locator;
  readonly filterByCategoryButton: Locator;
  readonly documentLibrary: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1, name: /deal intelligence/i });

    const metricCard = (title: string) =>
      page
        .locator('div', { hasText: new RegExp(`^${title}$`, 'i') })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    // Fund Analytics metrics
    this.activeDealsMetric = metricCard('Active Deals');
    this.avgTimeInDDMetric = metricCard('Avg Time in DD');
    this.ddToICRateMetric = metricCard('DD-to-IC Rate');
    this.readyForICMetric = metricCard('Ready for IC');

    // DD Status Summary
    this.readyForICCard = page.locator('div.rounded-lg').filter({ hasText: /ready for ic/i }).first();
    this.ddInProgressCard = page.locator('div.rounded-lg').filter({ hasText: /dd in progress/i }).first();
    this.overdueDocumentsCard = page.locator('div.rounded-lg').filter({ hasText: /overdue documents/i }).first();
    this.pendingReviewsCard = page.locator('div.rounded-lg').filter({ hasText: /pending reviews/i }).first();

    // Deal Distribution
    this.dealsByStageSection = page.locator('div.rounded-lg').filter({ hasText: /deals by stage/i }).first();
    this.dealsBySectorSection = page.locator('div.rounded-lg').filter({ hasText: /deals by sector/i }).first();
    this.ddProgressOverview = page.locator('div.rounded-lg').filter({ hasText: /dd progress overview/i }).first();

    // AI Deal Sourcing
    this.companySearchSection = page.locator('text=AI Deal Sourcing').locator('..').locator('..');
    this.companySearchInput = page.getByPlaceholder(/search.*company|company.*search/i);

    // Active Deals
    this.uploadDocumentButton = page.getByRole('button', { name: /upload document/i });
    this.dealCards = page.locator('div.rounded-lg').filter({ hasText: /document completion:/i });

    // Per-Deal View
    this.backToFundViewButton = page.getByRole('button', { name: /back to fund view/i });
    this.dealHeader = page.locator('h2').filter({ hasText: /[A-Z]/ });
    this.dealProgressBar = page.locator('[role="progressbar"]').first();

    // Tabs (in per-deal view)
    this.overviewTab = getContextualTab(page, /overview.*status/i);
    this.analyticsTab = getContextualTab(page, /deal analytics/i);
    this.documentsTab = getContextualTab(page, /dd documents/i);
    this.analysisTab = getContextualTab(page, /analysis.*insights/i);
    this.icMaterialsTab = getContextualTab(page, /ic materials/i);

    // Documents tab
    this.documentSearchInput = page.getByPlaceholder(/search documents/i);
    this.filterByCategoryButton = page.getByRole('button', { name: /filter by category/i });
    this.documentLibrary = page.locator('div.rounded-lg').filter({ hasText: /document library/i }).first();
    this.exportButton = page.getByRole('button', { name: /export/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/deal-intelligence');
    await openContextualMenu(this.page, /deal intelligence/i);
  }

  async getActiveDealsCount(): Promise<number> {
    return this.extractCardNumber(this.activeDealsMetric);
  }

  async getAvgTimeInDD(): Promise<number> {
    return this.extractCardNumber(this.avgTimeInDDMetric);
  }

  async getDDToICRate(): Promise<number> {
    return this.extractCardNumber(this.ddToICRateMetric);
  }

  async getReadyForICCount(): Promise<number> {
    return this.extractCardNumber(this.readyForICCard);
  }

  async getOverdueDocumentsCount(): Promise<number> {
    return this.extractCardNumber(this.overdueDocumentsCard);
  }

  async getPendingReviewsCount(): Promise<number> {
    return this.extractCardNumber(this.pendingReviewsCard);
  }

  async getDealCardCount(): Promise<number> {
    return this.dealCards.count();
  }

  async clickDeal(index: number = 0) {
    await this.dealCards.nth(index).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectDealByName(name: string) {
    const deal = this.dealCards.filter({ hasText: name }).first();
    await deal.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async backToFundView() {
    await this.backToFundViewButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectOverviewTab() {
    await clickContextualTab(this.page, /overview.*status/i);
  }

  async selectAnalyticsTab() {
    await clickContextualTab(this.page, /deal analytics/i);
  }

  async selectDocumentsTab() {
    await clickContextualTab(this.page, /dd documents/i);
  }

  async selectAnalysisTab() {
    await clickContextualTab(this.page, /analysis.*insights/i);
  }

  async selectICMaterialsTab() {
    await clickContextualTab(this.page, /ic materials/i);
  }

  async searchDocuments(query: string) {
    await this.documentSearchInput.fill(query);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchCompanies(query: string) {
    if (await this.companySearchInput.isVisible()) {
      await this.companySearchInput.fill(query);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  getDealsByICStatus(status: string): Locator {
    return this.dealCards.filter({ has: this.page.locator(`text=/${status}/i`) });
  }

  getCategoryProgress(category: string): Locator {
    return this.page.locator(`text=/${category}/i`).locator('..').locator('[role="progressbar"]');
  }

  getFinancialMetrics(): Locator {
    return this.page
      .locator('text=/Financial Metrics/i')
      .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
  }

  getMarketAnalytics(): Locator {
    return this.page
      .locator('text=/Market Analytics/i')
      .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
  }

  private async extractCardNumber(card: Locator): Promise<number> {
    const text = await card
      .locator('.text-3xl, .text-2xl, p.text-2xl, div.text-2xl, text=/\\d+/')
      .first()
      .textContent();
    if (!text) return 0;
    const normalized = text.replace(/[^\d-]/g, '');
    return normalized ? parseInt(normalized, 10) : 0;
  }
}
