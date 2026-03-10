import { Page, Locator } from "@playwright/test";
import { loginViaRedirect } from "../helpers/auth-helpers";

export class ContactsPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // Summary metrics
  readonly totalContactsMetric: Locator;
  readonly foundersMetric: Locator;
  readonly starredMetric: Locator;
  readonly followUpsDueMetric: Locator;

  // Actions
  readonly addContactButton: Locator;
  readonly networkViewButton: Locator;

  // Search and filters
  readonly searchInput: Locator;
  readonly roleFilter: Locator;

  // Smart Lists
  readonly smartListsPanel: Locator;
  readonly activeFilterBadge: Locator;
  readonly clearFilterButton: Locator;

  // Contact list
  readonly contactCards: Locator;
  readonly contactListContainer: Locator;

  // Contact detail drawer
  readonly contactDrawer: Locator;
  readonly drawerCloseButton: Locator;
  readonly overviewTab: Locator;
  readonly timelineTab: Locator;
  readonly emailTab: Locator;

  // Contact actions in drawer
  readonly starButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly sendEmailButton: Locator;
  readonly callButton: Locator;
  readonly scheduleMeetingButton: Locator;
  readonly addNoteButton: Locator;

  // Network Graph modal
  readonly networkGraphModal: Locator;
  readonly networkGraphCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", {
      level: 1,
      name: /contacts\s*&\s*crm|contacts/i,
    });

    const metricCard = (title: string) =>
      page
        .locator("p", { hasText: new RegExp(`^${title}$`, "i") })
        .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]')
        .first();

    // Summary metrics
    this.totalContactsMetric = metricCard("Total Contacts");
    this.foundersMetric = metricCard("Founders");
    this.starredMetric = metricCard("Starred");
    this.followUpsDueMetric = metricCard("Follow-ups Due");

    // Actions
    this.addContactButton = page.getByRole("button", { name: /add contact/i });
    this.networkViewButton = page.getByRole("button", {
      name: /network view/i,
    });

    // Search and filters
    this.searchInput = page.getByPlaceholder(/search contacts/i);
    this.roleFilter = page
      .getByRole("combobox")
      .or(page.locator("select"))
      .filter({ hasText: /role|all roles/i });

    // Smart Lists
    this.smartListsPanel = page
      .locator('[class*="smart-list"], [class*="SmartList"]')
      .or(page.locator("text=Smart Lists").locator("..").locator(".."));
    this.activeFilterBadge = page
      .locator('[class*="badge"]')
      .filter({ hasText: "Active Filter" });
    this.clearFilterButton = page.getByRole("button", { name: /clear/i });

    // Contact list
    this.contactListContainer = page
      .locator("div.max-h-\\[600px\\].overflow-y-auto")
      .or(
        page
          .locator("div")
          .filter({ has: page.locator("p.font-medium") })
          .locator(
            'xpath=ancestor::div[contains(@class,"overflow-y-auto")][1]',
          ),
      )
      .first();
    this.contactCards = this.contactListContainer
      .locator(":scope > div")
      .filter({ has: page.locator("p.font-medium") });

    // Contact detail drawer
    this.contactDrawer = page.locator(
      '[role="dialog"], [class*="drawer"], [class*="Drawer"]',
    );
    this.drawerCloseButton = page
      .locator(
        '[role="dialog"] button[aria-label*="close" i], [class*="drawer"] button',
      )
      .first();
    this.overviewTab = page
      .getByRole("tab", { name: /overview/i })
      .or(page.locator("button").filter({ hasText: /^Overview$/i }));
    this.timelineTab = page
      .getByRole("tab", { name: /timeline/i })
      .or(page.locator("button").filter({ hasText: /^Timeline$/i }));
    this.emailTab = page
      .getByRole("tab", { name: /email/i })
      .or(page.locator("button").filter({ hasText: /Email Settings/i }));

    // Contact actions in drawer
    this.starButton = page.getByRole("button", { name: /star|unstar/i });
    this.editButton = page.getByRole("button", { name: /edit/i });
    this.deleteButton = page.getByRole("button", { name: /delete/i });
    this.sendEmailButton = page.getByRole("button", { name: /send email/i });
    this.callButton = page.getByRole("button", { name: /^call$/i });
    this.scheduleMeetingButton = page.getByRole("button", {
      name: /schedule meeting/i,
    });
    this.addNoteButton = page.getByRole("button", { name: /add note/i });

    // Network Graph modal
    this.networkGraphModal = page
      .locator(".fixed.inset-0")
      .filter({ hasText: /Network Graph/i });
    this.networkGraphCloseButton = this.networkGraphModal.getByRole("button", {
      name: /close/i,
    });
  }

  async goto() {
    await loginViaRedirect(this.page, "/contacts");
  }

  async getTotalContactsCount(): Promise<number> {
    return this.extractMetricValue(this.totalContactsMetric);
  }

  async getFoundersCount(): Promise<number> {
    return this.extractMetricValue(this.foundersMetric);
  }

  async getStarredCount(): Promise<number> {
    return this.extractMetricValue(this.starredMetric);
  }

  async getFollowUpsDueCount(): Promise<number> {
    return this.extractMetricValue(this.followUpsDueMetric);
  }

  async searchContacts(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState("networkidle");
  }

  async filterByRole(role: string) {
    await this.roleFilter.click();
    await this.page
      .getByRole("option", { name: new RegExp(role, "i") })
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async getContactCount(): Promise<number> {
    return this.contactCards.count();
  }

  async clickContact(index: number = 0) {
    await this.contactCards.nth(index).click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectContactByName(name: string) {
    const contact = this.contactCards.filter({ hasText: name }).first();
    await contact.click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectOverviewTab() {
    await this.overviewTab.click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectTimelineTab() {
    await this.timelineTab.click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectEmailTab() {
    await this.emailTab.click();
    await this.page.waitForLoadState("networkidle");
  }

  async closeDrawer() {
    await this.drawerCloseButton.click();
  }

  async openNetworkGraph() {
    await this.networkViewButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async closeNetworkGraph() {
    await this.networkGraphCloseButton.click();
  }

  async toggleStar() {
    await this.starButton.click();
  }

  async getContactsByRole(role: string): Promise<Locator> {
    return this.page
      .locator('[class*="badge"]')
      .filter({ hasText: new RegExp(role, "i") });
  }

  async getRelationshipScore(): Promise<Locator> {
    return this.page.locator("text=/\\d+.*score|health|relationship/i");
  }

  getContactTags(): Locator {
    return this.page
      .locator('[class*="badge"]')
      .filter({ has: this.page.locator("svg") });
  }

  getLinkedDeals(): Locator {
    return this.page
      .locator("text=/Associated Deals/i")
      .locator("..")
      .locator('[class*="rounded-lg"]');
  }

  private async extractMetricValue(metricCard: Locator): Promise<number> {
    const text = await metricCard
      .locator('p.text-2xl, p[class*="text-2xl"]')
      .first()
      .textContent();
    if (!text) return 0;
    const normalized = text.replace(/[^\d-]/g, "");
    return normalized ? parseInt(normalized, 10) : 0;
  }
}
