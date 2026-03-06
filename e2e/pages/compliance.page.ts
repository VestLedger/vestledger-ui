import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';
import { clickContextualTab, getContextualTab, openContextualMenu } from '../helpers/navigation-helpers';

export class CompliancePage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly uploadDocumentButton: Locator;
  readonly exportReportButton: Locator;

  // Tabs
  readonly overviewTab: Locator;
  readonly regulatoryFilingsTab: Locator;
  readonly auditScheduleTab: Locator;
  readonly amlKycTab: Locator;
  readonly resourcesTab: Locator;

  // Summary metrics
  readonly overdueItemsMetric: Locator;
  readonly inProgressMetric: Locator;
  readonly dueThisMonthMetric: Locator;
  readonly completedMetric: Locator;

  // Compliance items list
  readonly complianceItemsList: Locator;
  readonly complianceItemCards: Locator;

  // Filters
  readonly statusFilter: Locator;
  readonly priorityFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { level: 1, name: /compliance\s*&\s*regulatory/i });
    this.uploadDocumentButton = page.getByRole('button', { name: /upload document/i });
    this.exportReportButton = page.getByRole('button', { name: /export report/i });

    // Tabs
    this.overviewTab = getContextualTab(page, /overview/i);
    this.regulatoryFilingsTab = getContextualTab(page, /regulatory filings/i);
    this.auditScheduleTab = getContextualTab(page, /audit schedule/i);
    this.amlKycTab = getContextualTab(page, /aml.*kyc/i);
    this.resourcesTab = getContextualTab(page, /resources/i);

    const metricCard = (title: string) =>
      page
        .locator('p', { hasText: new RegExp(`^${title}$`, 'i') })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    // Summary metrics
    this.overdueItemsMetric = metricCard('Overdue Items');
    this.inProgressMetric = metricCard('In Progress');
    this.dueThisMonthMetric = metricCard('Due This Month');
    this.completedMetric = metricCard('Completed');

    // Compliance items
    this.complianceItemsList = page.locator('div.rounded-lg').filter({ hasText: /overdue|in-progress|upcoming|completed/i });
    this.complianceItemCards = page.locator('div.rounded-lg').filter({ hasText: /compliance|filing|audit/i });

    // Filters
    this.statusFilter = page.getByRole('combobox', { name: /status/i }).or(page.locator('select').filter({ hasText: /status/i }));
    this.priorityFilter = page.getByRole('combobox', { name: /priority/i }).or(page.locator('select').filter({ hasText: /priority/i }));
  }

  async goto() {
    await loginViaRedirect(this.page, '/compliance');
    await openContextualMenu(this.page, /compliance/i);
  }

  async selectOverviewTab() {
    await clickContextualTab(this.page, /overview/i);
  }

  async selectRegulatoryFilingsTab() {
    await clickContextualTab(this.page, /regulatory filings/i);
  }

  async selectAuditScheduleTab() {
    await clickContextualTab(this.page, /audit schedule/i);
  }

  async selectAmlKycTab() {
    await clickContextualTab(this.page, /aml.*kyc/i);
  }

  async getOverdueItemsCount() {
    return this.extractMetricValue(this.overdueItemsMetric);
  }

  async getInProgressCount() {
    return this.extractMetricValue(this.inProgressMetric);
  }

  async getDueThisMonthCount() {
    return this.extractMetricValue(this.dueThisMonthMetric);
  }

  async getCompletedCount() {
    return this.extractMetricValue(this.completedMetric);
  }

  async filterByStatus(status: 'all' | 'overdue' | 'in-progress' | 'upcoming' | 'completed') {
    await this.statusFilter.click();
    await this.page.getByRole('option', { name: new RegExp(status.replace('-', ' '), 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async filterByPriority(priority: 'all' | 'high' | 'medium' | 'low') {
    await this.priorityFilter.click();
    await this.page.getByRole('option', { name: new RegExp(priority, 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getComplianceItemsByStatus(status: 'overdue' | 'in-progress' | 'upcoming' | 'completed') {
    return this.page.locator('[class*="badge"], [class*="status"]').filter({ hasText: new RegExp(status.replace('-', ' '), 'i') });
  }

  async markItemAsComplete(itemName: string) {
    const itemCard = this.page.locator('div.rounded-lg').filter({ hasText: itemName });
    const completeButton = itemCard.getByRole('button', { name: /complete|mark.*complete/i });
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async viewFilingSchedule() {
    await this.selectRegulatoryFilingsTab();
    const schedule = this.page.locator('text=/filing.*schedule|regulatory.*calendar/i');
    return schedule.first();
  }

  async viewAuditSchedule() {
    await this.selectAuditScheduleTab();
    const schedule = this.page.locator('text=/audit.*schedule|audit.*calendar/i');
    return schedule.first();
  }

  private async extractMetricValue(metricCard: Locator): Promise<number> {
    const text = await metricCard.locator('p.text-2xl, p[class*="text-2xl"]').first().textContent();
    if (!text) return 0;
    const normalized = text.replace(/[^\d-]/g, '');
    return normalized ? parseInt(normalized, 10) : 0;
  }
}
