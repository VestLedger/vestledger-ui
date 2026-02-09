import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

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
    this.pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /Deal Intelligence/i }).first();

    // Fund Analytics metrics
    this.activeDealsMetric = page.locator('[class*="card"]').filter({ hasText: 'Active Deals' }).filter({ hasText: /in due diligence/i });
    this.avgTimeInDDMetric = page.locator('[class*="card"]').filter({ hasText: 'Avg Time in DD' });
    this.ddToICRateMetric = page.locator('[class*="card"]').filter({ hasText: 'DD-to-IC Rate' });
    this.readyForICMetric = page.locator('[class*="card"]').filter({ hasText: 'Ready for IC' }).filter({ hasText: /deals$/i });

    // DD Status Summary
    this.readyForICCard = page.locator('[class*="card"]').filter({ hasText: 'Ready for IC' }).first();
    this.ddInProgressCard = page.locator('[class*="card"]').filter({ hasText: 'DD In Progress' });
    this.overdueDocumentsCard = page.locator('[class*="card"]').filter({ hasText: 'Overdue Documents' });
    this.pendingReviewsCard = page.locator('[class*="card"]').filter({ hasText: 'Pending Reviews' });

    // Deal Distribution
    this.dealsByStageSection = page.locator('[class*="card"]').filter({ hasText: 'Deals by Stage' });
    this.dealsBySectorSection = page.locator('[class*="card"]').filter({ hasText: 'Deals by Sector' });
    this.ddProgressOverview = page.locator('[class*="card"]').filter({ hasText: 'DD Progress Overview' });

    // AI Deal Sourcing
    this.companySearchSection = page.locator('text=AI Deal Sourcing').locator('..').locator('..');
    this.companySearchInput = page.getByPlaceholder(/search.*company|company.*search/i);

    // Active Deals
    this.uploadDocumentButton = page.getByRole('button', { name: /upload document/i });
    this.dealCards = page.locator('[class*="card"]').filter({ has: page.locator('text=/DD Progress/i') });

    // Per-Deal View
    this.backToFundViewButton = page.getByRole('button', { name: /back to fund view/i });
    this.dealHeader = page.locator('h2').filter({ hasText: /[A-Z]/ });
    this.dealProgressBar = page.locator('[role="progressbar"]').first();

    // Tabs (in per-deal view)
    this.overviewTab = page.getByRole('tab', { name: /overview|status/i });
    this.analyticsTab = page.getByRole('tab', { name: /analytics/i });
    this.documentsTab = page.getByRole('tab', { name: /documents/i });
    this.analysisTab = page.getByRole('tab', { name: /analysis|insights/i });
    this.icMaterialsTab = page.getByRole('tab', { name: /IC Materials/i });

    // Documents tab
    this.documentSearchInput = page.getByPlaceholder(/search documents/i);
    this.filterByCategoryButton = page.getByRole('button', { name: /filter by category/i });
    this.documentLibrary = page.locator('[class*="card"]').filter({ hasText: 'Document Library' });
    this.exportButton = page.getByRole('button', { name: /export/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/deal-intelligence');
  }

  async getActiveDealsCount(): Promise<number> {
    const text = await this.activeDealsMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getAvgTimeInDD(): Promise<number> {
    const text = await this.avgTimeInDDMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getDDToICRate(): Promise<number> {
    const text = await this.ddToICRateMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getReadyForICCount(): Promise<number> {
    const text = await this.readyForICCard.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getOverdueDocumentsCount(): Promise<number> {
    const text = await this.overdueDocumentsCard.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getPendingReviewsCount(): Promise<number> {
    const text = await this.pendingReviewsCard.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getDealCardCount(): Promise<number> {
    return this.dealCards.count();
  }

  async clickDeal(index: number = 0) {
    await this.dealCards.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectDealByName(name: string) {
    const deal = this.dealCards.filter({ hasText: name }).first();
    await deal.click();
    await this.page.waitForLoadState('networkidle');
  }

  async backToFundView() {
    await this.backToFundViewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectOverviewTab() {
    await this.overviewTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAnalyticsTab() {
    await this.analyticsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectDocumentsTab() {
    await this.documentsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAnalysisTab() {
    await this.analysisTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectICMaterialsTab() {
    await this.icMaterialsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchDocuments(query: string) {
    await this.documentSearchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async searchCompanies(query: string) {
    if (await this.companySearchInput.isVisible()) {
      await this.companySearchInput.fill(query);
      await this.page.waitForLoadState('networkidle');
    }
  }

  getDealsByICStatus(status: string): Locator {
    return this.dealCards.filter({ has: this.page.locator(`text=/${status}/i`) });
  }

  getCategoryProgress(category: string): Locator {
    return this.page.locator(`text=/${category}/i`).locator('..').locator('[role="progressbar"]');
  }

  getFinancialMetrics(): Locator {
    return this.page.locator('text=/Financial Metrics/i').locator('..').locator('[class*="card"]');
  }

  getMarketAnalytics(): Locator {
    return this.page.locator('text=/Market Analytics/i').locator('..').locator('[class*="card"]');
  }
}