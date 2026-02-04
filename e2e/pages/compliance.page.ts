import { Page, Locator } from '@playwright/test';

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
    this.pageTitle = page.getByRole('heading', { name: /compliance|regulatory/i });
    this.uploadDocumentButton = page.getByRole('button', { name: /upload document/i });
    this.exportReportButton = page.getByRole('button', { name: /export report/i });

    // Tabs
    this.overviewTab = page.getByRole('tab', { name: /overview/i });
    this.regulatoryFilingsTab = page.getByRole('tab', { name: /regulatory filings/i });
    this.auditScheduleTab = page.getByRole('tab', { name: /audit schedule/i });
    this.amlKycTab = page.getByRole('tab', { name: /aml.*kyc/i });
    this.resourcesTab = page.getByRole('tab', { name: /resources/i });

    // Summary metrics
    this.overdueItemsMetric = page.locator('[class*="card"]').filter({ hasText: 'Overdue Items' });
    this.inProgressMetric = page.locator('[class*="card"]').filter({ hasText: 'In Progress' });
    this.dueThisMonthMetric = page.locator('[class*="card"]').filter({ hasText: 'Due This Month' });
    this.completedMetric = page.locator('[class*="card"]').filter({ hasText: 'Completed' });

    // Compliance items
    this.complianceItemsList = page.locator('[class*="card"]').filter({ hasText: /overdue|in-progress|upcoming|completed/i });
    this.complianceItemCards = page.locator('[class*="card"]').filter({ hasText: /compliance|filing|audit/i });

    // Filters
    this.statusFilter = page.getByRole('combobox', { name: /status/i }).or(page.locator('select').filter({ hasText: /status/i }));
    this.priorityFilter = page.getByRole('combobox', { name: /priority/i }).or(page.locator('select').filter({ hasText: /priority/i }));
  }

  async goto() {
    await this.page.goto('/compliance');
    await this.page.waitForLoadState('networkidle');
  }

  async selectOverviewTab() {
    await this.overviewTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectRegulatoryFilingsTab() {
    await this.regulatoryFilingsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAuditScheduleTab() {
    await this.auditScheduleTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAmlKycTab() {
    await this.amlKycTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getOverdueItemsCount() {
    const text = await this.overdueItemsMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getInProgressCount() {
    const text = await this.inProgressMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getDueThisMonthCount() {
    const text = await this.dueThisMonthMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getCompletedCount() {
    const text = await this.completedMetric.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async filterByStatus(status: 'all' | 'overdue' | 'in-progress' | 'upcoming' | 'completed') {
    await this.statusFilter.click();
    await this.page.getByRole('option', { name: new RegExp(status.replace('-', ' '), 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPriority(priority: 'all' | 'high' | 'medium' | 'low') {
    await this.priorityFilter.click();
    await this.page.getByRole('option', { name: new RegExp(priority, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getComplianceItemsByStatus(status: 'overdue' | 'in-progress' | 'upcoming' | 'completed') {
    return this.page.locator('[class*="badge"], [class*="status"]').filter({ hasText: new RegExp(status.replace('-', ' '), 'i') });
  }

  async markItemAsComplete(itemName: string) {
    const itemCard = this.page.locator('[class*="card"]').filter({ hasText: itemName });
    const completeButton = itemCard.getByRole('button', { name: /complete|mark.*complete/i });
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await this.page.waitForLoadState('networkidle');
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
}
