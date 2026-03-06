import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';
import { clickContextualTab, getContextualTab, openContextualMenu } from '../helpers/navigation-helpers';

export class TaxCenterPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly generateK1sButton: Locator;
  readonly uploadDocumentsButton: Locator;

  // Tabs
  readonly taxDocumentsTab: Locator;
  readonly k1GeneratorTab: Locator;
  readonly fundSummaryTab: Locator;
  readonly portfolioCompaniesTab: Locator;
  readonly lpCommunicationsTab: Locator;

  // Summary metrics
  readonly k1sIssuedMetric: Locator;
  readonly form1099IssuedMetric: Locator;
  readonly estTaxesPaidMetric: Locator;
  readonly filingDeadlineMetric: Locator;

  // Tax documents
  readonly taxDocumentsList: Locator;
  readonly documentCards: Locator;

  // Filters and search
  readonly searchInput: Locator;
  readonly yearFilter: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { name: /tax center/i });
    this.generateK1sButton = page.getByRole('button', { name: /generate k-1s/i });
    this.uploadDocumentsButton = page.getByRole('button', { name: /upload documents/i });

    // Tabs
    this.taxDocumentsTab = getContextualTab(page, /tax documents/i);
    this.k1GeneratorTab = getContextualTab(page, /k-1 generator/i);
    this.fundSummaryTab = getContextualTab(page, /fund summary/i);
    this.portfolioCompaniesTab = getContextualTab(page, /portfolio companies/i);
    this.lpCommunicationsTab = getContextualTab(page, /lp communications/i);

    const metricCard = (title: string) =>
      page
        .locator('p', { hasText: new RegExp(`^${title}$`, 'i') })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    // Summary metrics
    this.k1sIssuedMetric = metricCard('K-1s Issued');
    this.form1099IssuedMetric = metricCard('1099s Issued');
    this.estTaxesPaidMetric = metricCard('Est. Taxes Paid');
    this.filingDeadlineMetric = metricCard('Filing Deadline');

    // Tax documents
    this.taxDocumentsList = page.locator('div.rounded-lg').filter({ hasText: /K-1|1099|tax/i });
    this.documentCards = page.locator('div.rounded-lg').filter({ hasText: /ready|sent|pending/i });

    // Filters
    this.searchInput = page.getByPlaceholder(/search/i);
    this.yearFilter = page.getByRole('combobox', { name: /year/i }).or(page.locator('select').filter({ hasText: /2024|2023/i }));
    this.statusFilter = page.getByRole('combobox', { name: /status/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/tax-center');
    await openContextualMenu(this.page, /tax center/i);
  }

  async selectTaxDocumentsTab() {
    await clickContextualTab(this.page, /tax documents/i);
  }

  async selectK1GeneratorTab() {
    await clickContextualTab(this.page, /k-1 generator/i);
  }

  async selectFundSummaryTab() {
    await clickContextualTab(this.page, /fund summary/i);
  }

  async selectPortfolioCompaniesTab() {
    await clickContextualTab(this.page, /portfolio companies/i);
  }

  async getK1sIssuedCount() {
    return this.extractMetricValue(this.k1sIssuedMetric);
  }

  async getFilingDeadline() {
    return this.filingDeadlineMetric.locator('p.text-2xl, p[class*="text-2xl"]').first().textContent();
  }

  async getDeadlineDaysRemaining() {
    const subtitle = await this.filingDeadlineMetric.locator('text=/\\d+\\s+days\\s+remaining/i').first().textContent();
    const match = subtitle?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getDocumentCount() {
    return this.documentCards.count();
  }

  async clickGenerateK1s() {
    await this.generateK1sButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async downloadDocument(documentName: string) {
    const documentCard = this.page.locator('div.rounded-lg').filter({ hasText: documentName });
    const downloadButton = documentCard.getByRole('button', { name: /download/i });
    await downloadButton.click();
  }

  async sendDocumentToLP(documentName: string) {
    const documentCard = this.page.locator('div.rounded-lg').filter({ hasText: documentName });
    const sendButton = documentCard.getByRole('button', { name: /send/i });
    await sendButton.click();
  }

  async filterByYear(year: string) {
    await this.yearFilter.click();
    await this.page.getByRole('option', { name: year }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async filterByStatus(status: 'ready' | 'sent' | 'pending') {
    await this.statusFilter.click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchDocuments(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async extractMetricValue(metricCard: Locator): Promise<number> {
    const text = await metricCard.locator('p.text-2xl, p[class*="text-2xl"]').first().textContent();
    if (!text) return 0;
    const normalized = text.replace(/[^\d-]/g, '');
    return normalized ? parseInt(normalized, 10) : 0;
  }
}
