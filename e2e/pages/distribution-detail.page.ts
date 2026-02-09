import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class DistributionDetailPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly statusBadge: Locator;
  readonly eventDateBadge: Locator;
  readonly backToFundAdminButton: Locator;
  readonly calendarButton: Locator;

  // Summary metrics
  readonly grossProceedsMetric: Locator;
  readonly netProceedsMetric: Locator;
  readonly distributedMetric: Locator;
  readonly taxWithheldMetric: Locator;

  // Distribution Overview card
  readonly overviewCard: Locator;
  readonly fundName: Locator;
  readonly eventType: Locator;
  readonly eventDate: Locator;
  readonly paymentDate: Locator;
  readonly waterfallScenario: Locator;
  readonly currentApprover: Locator;

  // Approval Stepper
  readonly approvalStepper: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly returnForRevisionButton: Locator;

  // LP Allocations table
  readonly allocationsCard: Locator;
  readonly allocationsTable: Locator;
  readonly allocationsSearchInput: Locator;
  readonly allocationsCount: Locator;

  // Lifecycle Timeline
  readonly lifecycleTimeline: Locator;

  // Statements
  readonly statementsCard: Locator;
  readonly generateStatementsButton: Locator;
  readonly statementsList: Locator;
  readonly downloadPdfButtons: Locator;

  // Internal Notes
  readonly notesCard: Locator;
  readonly notesList: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.statusBadge = page.locator('[class*="badge"]').filter({ hasText: /(draft|pending|approved|processing|completed|rejected)/i }).first();
    this.eventDateBadge = page.locator('[class*="badge"]').filter({ hasText: /\d{1,2}\/\d{1,2}\/\d{4}/ }).first();
    this.backToFundAdminButton = page.getByRole('button', { name: /back to fund admin/i });
    this.calendarButton = page.getByRole('button', { name: /calendar/i });

    // Summary metrics
    this.grossProceedsMetric = page.locator('[class*="card"]').filter({ hasText: 'Gross Proceeds' });
    this.netProceedsMetric = page.locator('[class*="card"]').filter({ hasText: 'Net Proceeds' });
    this.distributedMetric = page.locator('[class*="card"]').filter({ hasText: 'Distributed' });
    this.taxWithheldMetric = page.locator('[class*="card"]').filter({ hasText: 'Tax Withheld' });

    // Distribution Overview
    this.overviewCard = page.locator('[class*="card"]').filter({ hasText: 'Distribution Overview' });
    this.fundName = page.locator('text=Fund').locator('..').locator('p.font-medium').first();
    this.eventType = page.locator('text=Event Type').locator('..').locator('p.font-medium');
    this.eventDate = page.locator('text=Event Date').locator('..').locator('p.font-medium');
    this.paymentDate = page.locator('text=Payment Date').locator('..').locator('p.font-medium');
    this.waterfallScenario = page.locator('text=Waterfall Scenario').locator('..').locator('p.font-medium');
    this.currentApprover = page.locator('text=Current Approver').locator('..').locator('p.font-medium');

    // Approval Stepper
    this.approvalStepper = page.locator('[class*="card"]').filter({ hasText: /approval/i });
    this.approveButton = page.getByRole('button', { name: /approve/i });
    this.rejectButton = page.getByRole('button', { name: /reject/i });
    this.returnForRevisionButton = page.getByRole('button', { name: /return for revision/i });

    // LP Allocations
    this.allocationsCard = page.locator('[class*="card"]').filter({ hasText: 'LP Allocation Breakdown' });
    this.allocationsTable = page.locator('table').filter({ hasText: /LP.*Pro-Rata.*Gross/i });
    this.allocationsSearchInput = page.getByPlaceholder(/search lps/i);
    this.allocationsCount = page.locator('[class*="badge"]').filter({ hasText: /\d+ allocations/ });

    // Lifecycle Timeline
    this.lifecycleTimeline = page.locator('[class*="card"]').filter({ hasText: 'Lifecycle Timeline' });

    // Statements
    this.statementsCard = page.locator('[class*="card"]').filter({ hasText: 'Statements & Documents' });
    this.generateStatementsButton = page.getByRole('button', { name: /generate/i });
    this.statementsList = this.statementsCard.locator('[class*="card"], [class*="list-item"]');
    this.downloadPdfButtons = page.getByRole('button', { name: /download pdf/i });

    // Internal Notes
    this.notesCard = page.locator('[class*="card"]').filter({ hasText: 'Internal Notes' });
    this.notesList = this.notesCard.locator('[class*="rounded-lg"]').filter({ hasText: /\w+\s+-\s+\d/ });
  }

  async goto(distributionId: string) {
    await loginViaRedirect(this.page, `/fund-admin/distributions/${distributionId}`);
  }

  async getDistributionStatus() {
    return this.statusBadge.textContent();
  }

  async getDistributionName() {
    return this.pageTitle.textContent();
  }

  // Metrics helpers
  async getGrossProceeds() {
    const text = await this.grossProceedsMetric.locator('[class*="font-"]').first().textContent();
    return text?.trim();
  }

  async getNetProceeds() {
    const text = await this.netProceedsMetric.locator('[class*="font-"]').first().textContent();
    return text?.trim();
  }

  async getDistributedAmount() {
    const text = await this.distributedMetric.locator('[class*="font-"]').first().textContent();
    return text?.trim();
  }

  async getTaxWithheld() {
    const text = await this.taxWithheldMetric.locator('[class*="font-"]').first().textContent();
    return text?.trim();
  }

  // Overview helpers
  async getFundName() {
    return this.fundName.textContent();
  }

  async getEventType() {
    return this.eventType.textContent();
  }

  async getEventDate() {
    return this.eventDate.textContent();
  }

  async getPaymentDate() {
    return this.paymentDate.textContent();
  }

  async getWaterfallScenario() {
    return this.waterfallScenario.textContent();
  }

  async getCurrentApprover() {
    return this.currentApprover.textContent();
  }

  // Approval actions
  async approveDistribution() {
    await this.approveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async rejectDistribution() {
    await this.rejectButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async returnForRevision() {
    await this.returnForRevisionButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isApproveButtonVisible() {
    return this.approveButton.isVisible();
  }

  async isRejectButtonVisible() {
    return this.rejectButton.isVisible();
  }

  // Allocations helpers
  async getAllocationsCount() {
    const text = await this.allocationsCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async searchAllocations(query: string) {
    await this.allocationsSearchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async getAllocationRows() {
    return this.allocationsTable.locator('tbody tr');
  }

  async getAllocationForLP(lpName: string) {
    const row = this.allocationsTable.locator('tr').filter({ hasText: lpName });
    if (await row.isVisible()) {
      const cells = await row.locator('td').allTextContents();
      return {
        lpName: cells[0],
        proRata: cells[1],
        gross: cells[2],
        taxWithheld: cells[3],
        net: cells[4],
        status: cells[5],
      };
    }
    return null;
  }

  // Timeline helpers
  async getTimelineItems() {
    const items = this.lifecycleTimeline.locator('[class*="timeline-item"], div').filter({ hasText: /(Draft|Submitted|Approved|Processing|Executed)/i });
    return items.allTextContents();
  }

  async isTimelineStepComplete(step: 'Draft' | 'Submitted' | 'Approved' | 'Processing' | 'Executed') {
    const stepItem = this.lifecycleTimeline.locator('div').filter({ hasText: step });
    const timestamp = await stepItem.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/').count();
    return timestamp > 0;
  }

  // Statements helpers
  async getStatementsCount() {
    const text = await this.statementsCard.locator('[class*="badge"]').filter({ hasText: /\d+ statements/ }).textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async downloadStatementForLP(lpName: string) {
    const statementCard = this.statementsCard.locator('[class*="card"], [class*="list-item"]').filter({ hasText: lpName });
    await statementCard.getByRole('button', { name: /download pdf/i }).click();
  }

  // Notes helpers
  async getNotesCount() {
    return this.notesList.count();
  }

  async getNoteByIndex(index: number) {
    const note = this.notesList.nth(index);
    const author = await note.locator('[class*="text-xs"]').textContent();
    const content = await note.locator('div:last-child').textContent();
    return { author: author?.trim(), content: content?.trim() };
  }

  // Navigation
  async goBackToFundAdmin() {
    await this.backToFundAdminButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToCalendar() {
    await this.calendarButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}