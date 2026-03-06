import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';
import { clickContextualTab, getContextualTab, openContextualMenu } from '../helpers/navigation-helpers';

export class CapitalCallsPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly newCapitalCallButton: Locator;
  readonly exportButton: Locator;
  readonly fundSelector: Locator;

  // Tabs
  readonly capitalCallsTab: Locator;
  readonly distributionsTab: Locator;
  readonly lpResponsesTab: Locator;

  // Summary metrics
  readonly activeCallsMetric: Locator;
  readonly ytdDistributionsMetric: Locator;
  readonly outstandingMetric: Locator;
  readonly totalLPsMetric: Locator;

  // Capital Calls list
  readonly capitalCallCards: Locator;

  // LP Responses
  readonly lpResponsesList: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { name: /fund administration/i });
    this.newCapitalCallButton = page.getByRole('button', { name: /new capital call/i });
    this.exportButton = page.getByRole('button', { name: /export activity/i });
    this.fundSelector = page.locator('[data-testid="fund-selector"]').or(page.getByRole('combobox', { name: /fund/i }));

    // Tabs
    this.capitalCallsTab = getContextualTab(page, /capital calls/i);
    this.distributionsTab = getContextualTab(page, /distributions/i);
    this.lpResponsesTab = getContextualTab(page, /lp responses/i);

    // Summary metrics - use text content matching
    this.activeCallsMetric = page.locator('text=Active Calls').locator('..').locator('..');
    this.ytdDistributionsMetric = page.locator('text=YTD Distributions').locator('..').locator('..');
    this.outstandingMetric = page.locator('text=Outstanding').locator('..').locator('..');
    this.totalLPsMetric = page.locator('text=Total LPs').locator('..').locator('..');

    // Capital Calls list - cards containing capital call info
    this.capitalCallCards = page.locator('div.rounded-lg').filter({ hasText: /Capital Call #/i });

    // LP Responses
    this.lpResponsesList = page.locator('[class*="rounded-lg"]').filter({ hasText: /Commitment:/i });
    this.statusFilter = page.getByRole('combobox', { name: /filter by status/i }).or(page.locator('select').filter({ hasText: /all statuses/i }));
  }

  async goto() {
    await loginViaRedirect(this.page, '/fund-admin');
    await openContextualMenu(this.page, /fund admin/i);
    await this.selectCapitalCallsTab();
  }

  async selectCapitalCallsTab() {
    await clickContextualTab(this.page, /capital calls/i);
  }

  async selectDistributionsTab() {
    await clickContextualTab(this.page, /distributions/i);
  }

  async selectLPResponsesTab() {
    await clickContextualTab(this.page, /lp responses/i);
  }

  async getCapitalCallCount() {
    return this.capitalCallCards.count();
  }

  async getCapitalCallByNumber(callNumber: number) {
    return this.page.locator('div.rounded-lg').filter({ hasText: new RegExp(`Capital Call #${callNumber}\\b`, 'i') }).first();
  }

  async getCapitalCallStatus(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    const statusBadge = card.locator('[class*="badge"], [class*="status"]');
    return statusBadge.textContent();
  }

  async clickSendToLPs(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    await card.getByRole('button', { name: /send to lps/i }).click();
  }

  async clickSendReminder(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    await card.getByRole('button', { name: /send reminder/i }).click();
  }

  async clickExportCapitalCall(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    await card.getByRole('button', { name: /export/i }).click();
  }

  async getCollectionProgress(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    const progressText = await card.locator('text=/\\d+%/').first().textContent();
    return progressText ? parseInt(progressText.replace('%', '')) : 0;
  }

  async getLPResponseCount(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    const responseText = await card.locator('text=/\\d+ of \\d+/').textContent();
    if (responseText) {
      const match = responseText.match(/(\d+) of (\d+)/);
      if (match) {
        return { responded: parseInt(match[1]), total: parseInt(match[2]) };
      }
    }
    return { responded: 0, total: 0 };
  }

  // LP Responses methods
  async filterLPResponsesByStatus(status: 'all' | 'paid' | 'partial' | 'pending' | 'overdue') {
    await this.statusFilter.click();
    const optionName = status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1);
    await this.page.getByRole('option', { name: new RegExp(optionName, 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLPResponsesCount() {
    return this.lpResponsesList.count();
  }

  async getLPResponse(lpName: string) {
    return this.page.locator('[class*="rounded-lg"]').filter({ hasText: lpName });
  }

  async getLPPaymentProgress(lpName: string) {
    const lpCard = await this.getLPResponse(lpName);
    const amountText = await lpCard.locator('text=/\\$[\\d,]+ \\/ \\$[\\d,]+/').textContent();
    return amountText;
  }

  async clickSendReminderToLP(lpName: string) {
    const lpCard = await this.getLPResponse(lpName);
    await lpCard.getByRole('button', { name: /send reminder/i }).click();
  }

  // Metric helpers
  async getActiveCallsCount() {
    if ((await this.activeCallsMetric.count()) === 0) return 0;
    const valueText = await this.activeCallsMetric.locator('.text-2xl, .text-3xl, [class*="font-"]').first().textContent();
    const normalized = valueText?.replace(/[^\d-]/g, '') ?? '';
    return normalized ? parseInt(normalized, 10) : 0;
  }

  async getOutstandingAmount() {
    if ((await this.outstandingMetric.count()) === 0) return '$0';
    const valueText = await this.outstandingMetric.locator('.text-2xl, .text-3xl, [class*="font-"]').first().textContent();
    return valueText?.trim() || '$0';
  }

  // Capital call card data extraction
  async getCapitalCallData(callNumber: number) {
    const card = await this.getCapitalCallByNumber(callNumber);
    const isVisible = await card.isVisible();
    if (!isVisible) return null;

    const fundName = await card.locator('text=/[A-Z].*Fund/i').first().textContent();
    const totalAmount = await card.locator('text=Total Amount').locator('..').locator('p.text-lg').textContent();
    const received = await card.locator('text=Received').locator('..').locator('p.text-lg').textContent();
    const callDate = await card.locator('text=Call Date').locator('..').locator('p.font-semibold').textContent();
    const dueDate = await card.locator('text=Due Date').locator('..').locator('p.font-semibold').textContent();

    return {
      fundName: fundName?.trim(),
      totalAmount: totalAmount?.trim(),
      received: received?.trim(),
      callDate: callDate?.trim(),
      dueDate: dueDate?.trim(),
    };
  }
}
