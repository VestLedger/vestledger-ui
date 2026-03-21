import { Page, Locator } from "@playwright/test";
import { loginViaRedirect } from "../helpers/auth-helpers";

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

    const metricCard = (title: string) =>
      page
        .locator("p", { hasText: new RegExp(`^${title}$`, "i") })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    const panelByTitle = (title: string | RegExp) =>
      page.locator("div.rounded-lg").filter({ hasText: title }).first();

    // Header
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.statusBadge = page
      .locator('[class*="badge"]')
      .filter({
        hasText: /(draft|pending|approved|processing|completed|rejected)/i,
      })
      .first();
    this.eventDateBadge = page
      .locator('[class*="badge"]')
      .filter({ hasText: /\d{1,2}\/\d{1,2}\/\d{4}/ })
      .first();
    this.backToFundAdminButton = page.getByRole("button", {
      name: /back to fund admin/i,
    });
    this.calendarButton = page.getByRole("button", { name: /calendar/i });

    // Summary metrics
    this.grossProceedsMetric = metricCard("Gross Proceeds");
    this.netProceedsMetric = metricCard("Net Proceeds");
    this.distributedMetric = metricCard("Distributed");
    this.taxWithheldMetric = metricCard("Tax Withheld");

    // Distribution Overview
    this.overviewCard = panelByTitle(/distribution overview/i);
    this.fundName = page
      .locator("text=Fund")
      .locator("..")
      .locator("p.font-medium")
      .first();
    this.eventType = page
      .locator("text=Event Type")
      .locator("..")
      .locator("p.font-medium");
    this.eventDate = page
      .locator("text=Event Date")
      .locator("..")
      .locator("p.font-medium");
    this.paymentDate = page
      .locator("text=Payment Date")
      .locator("..")
      .locator("p.font-medium");
    this.waterfallScenario = page
      .locator("text=Waterfall Scenario")
      .locator("..")
      .locator("p.font-medium");
    this.currentApprover = page
      .locator("text=Current Approver")
      .locator("..")
      .locator("p.font-medium");

    // Approval Stepper
    this.approvalStepper = panelByTitle(/approval/i);
    this.approveButton = page.getByRole("button", { name: /approve/i });
    this.rejectButton = page.getByRole("button", { name: /reject/i });
    this.returnForRevisionButton = page.getByRole("button", {
      name: /return for revision/i,
    });

    // LP Allocations
    this.allocationsCard = panelByTitle(/lp allocation breakdown/i);
    this.allocationsTable = page
      .locator("table")
      .filter({ hasText: /LP.*Pro-Rata.*Gross/i });
    this.allocationsSearchInput = page.getByPlaceholder(/search lps/i);
    this.allocationsCount = page
      .locator('[class*="badge"]')
      .filter({ hasText: /\d+ allocations/ });

    // Lifecycle Timeline
    this.lifecycleTimeline = panelByTitle(/lifecycle timeline/i);

    // Statements
    this.statementsCard = panelByTitle(/statements\s*&\s*documents/i);
    this.generateStatementsButton = page.getByRole("button", {
      name: /generate/i,
    });
    this.statementsList = this.statementsCard.locator(
      'div.rounded-lg, [class*="list-item"]',
    );
    this.downloadPdfButtons = page.getByRole("button", {
      name: /download pdf/i,
    });

    // Internal Notes
    this.notesCard = panelByTitle(/internal notes/i);
    this.notesList = this.notesCard
      .locator('[class*="rounded-lg"]')
      .filter({ hasText: /\w+\s+-\s+\d/ });
  }

  async goto(distributionId: string) {
    await loginViaRedirect(
      this.page,
      `/fund-admin/distributions/${distributionId}`,
    );
  }

  async getDistributionStatus() {
    return this.statusBadge.textContent();
  }

  async getDistributionName() {
    return this.pageTitle.textContent();
  }

  // Metrics helpers
  async getGrossProceeds() {
    return this.extractMetricText(this.grossProceedsMetric);
  }

  async getNetProceeds() {
    return this.extractMetricText(this.netProceedsMetric);
  }

  async getDistributedAmount() {
    return this.extractMetricText(this.distributedMetric);
  }

  async getTaxWithheld() {
    return this.extractMetricText(this.taxWithheldMetric);
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
    await this.page.waitForLoadState("networkidle");
  }

  async rejectDistribution() {
    await this.rejectButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async returnForRevision() {
    await this.returnForRevisionButton.click();
    await this.page.waitForLoadState("networkidle");
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
    await this.page.waitForLoadState("networkidle");
  }

  async getAllocationRows() {
    return this.allocationsTable.locator("tbody tr");
  }

  async getAllocationForLP(lpName: string) {
    const row = this.allocationsTable.locator("tr").filter({ hasText: lpName });
    if (await row.isVisible()) {
      const cells = await row.locator("td").allTextContents();
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
    const items = this.lifecycleTimeline
      .locator('[class*="timeline-item"], div')
      .filter({ hasText: /(Draft|Submitted|Approved|Processing|Executed)/i });
    return items.allTextContents();
  }

  async isTimelineStepComplete(
    step: "Draft" | "Submitted" | "Approved" | "Processing" | "Executed",
  ) {
    const stepItem = this.lifecycleTimeline
      .locator("div")
      .filter({ hasText: step });
    const timestamp = await stepItem
      .locator("text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/")
      .count();
    return timestamp > 0;
  }

  // Statements helpers
  async getStatementsCount() {
    const text = await this.statementsCard
      .locator('[class*="badge"]')
      .filter({ hasText: /\d+ statements/ })
      .textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async downloadStatementForLP(lpName: string) {
    const statementCard = this.statementsCard
      .locator('div.rounded-lg, [class*="list-item"]')
      .filter({ hasText: lpName });
    await statementCard.getByRole("button", { name: /download pdf/i }).click();
  }

  // Notes helpers
  async getNotesCount() {
    return this.notesList.count();
  }

  async getNoteByIndex(index: number) {
    const note = this.notesList.nth(index);
    const author = await note.locator('[class*="text-xs"]').textContent();
    const content = await note.locator("div:last-child").textContent();
    return { author: author?.trim(), content: content?.trim() };
  }

  private async extractMetricText(
    metricCard: Locator,
  ): Promise<string | undefined> {
    const text = await metricCard
      .locator('p.text-2xl, p[class*="text-2xl"]')
      .first()
      .textContent();
    return text?.trim() || undefined;
  }

  // Navigation
  async goBackToFundAdmin() {
    await this.backToFundAdminButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async goToCalendar() {
    await this.calendarButton.click();
    await this.page.waitForLoadState("networkidle");
  }
}
