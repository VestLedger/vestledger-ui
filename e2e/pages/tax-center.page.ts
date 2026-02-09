import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

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
    this.taxDocumentsTab = page.getByRole('tab', { name: /tax documents/i });
    this.k1GeneratorTab = page.getByRole('tab', { name: /k-1 generator/i });
    this.fundSummaryTab = page.getByRole('tab', { name: /fund summary/i });
    this.portfolioCompaniesTab = page.getByRole('tab', { name: /portfolio companies/i });
    this.lpCommunicationsTab = page.getByRole('tab', { name: /lp communications/i });

    // Summary metrics
    this.k1sIssuedMetric = page.locator('[class*="card"]').filter({ hasText: 'K-1s Issued' });
    this.form1099IssuedMetric = page.locator('[class*="card"]').filter({ hasText: '1099s Issued' });
    this.estTaxesPaidMetric = page.locator('[class*="card"]').filter({ hasText: 'Est. Taxes Paid' });
    this.filingDeadlineMetric = page.locator('[class*="card"]').filter({ hasText: 'Filing Deadline' });

    // Tax documents
    this.taxDocumentsList = page.locator('[class*="card"]').filter({ hasText: /K-1|1099|tax/i });
    this.documentCards = page.locator('[class*="card"]').filter({ hasText: /ready|sent|pending/i });

    // Filters
    this.searchInput = page.getByPlaceholder(/search/i);
    this.yearFilter = page.getByRole('combobox', { name: /year/i }).or(page.locator('select').filter({ hasText: /2024|2023/i }));
    this.statusFilter = page.getByRole('combobox', { name: /status/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/tax-center');
  }

  async selectTaxDocumentsTab() {
    await this.taxDocumentsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectK1GeneratorTab() {
    await this.k1GeneratorTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectFundSummaryTab() {
    await this.fundSummaryTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectPortfolioCompaniesTab() {
    await this.portfolioCompaniesTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getK1sIssuedCount() {
    const text = await this.k1sIssuedMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getFilingDeadline() {
    return this.filingDeadlineMetric.locator('[class*="font-bold"], [class*="text-lg"]').first().textContent();
  }

  async getDeadlineDaysRemaining() {
    const subtitle = await this.filingDeadlineMetric.locator('text=/\\d+ days remaining/i').textContent();
    const match = subtitle?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getDocumentCount() {
    return this.documentCards.count();
  }

  async clickGenerateK1s() {
    await this.generateK1sButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async downloadDocument(documentName: string) {
    const documentCard = this.page.locator('[class*="card"]').filter({ hasText: documentName });
    const downloadButton = documentCard.getByRole('button', { name: /download/i });
    await downloadButton.click();
  }

  async sendDocumentToLP(documentName: string) {
    const documentCard = this.page.locator('[class*="card"]').filter({ hasText: documentName });
    const sendButton = documentCard.getByRole('button', { name: /send/i });
    await sendButton.click();
  }

  async filterByYear(year: string) {
    await this.yearFilter.click();
    await this.page.getByRole('option', { name: year }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: 'ready' | 'sent' | 'pending') {
    await this.statusFilter.click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchDocuments(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }
}