import { Page, Locator } from '@playwright/test';

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
    this.pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /Contacts|CRM/i }).first();

    // Summary metrics
    this.totalContactsMetric = page.locator('[class*="card"]').filter({ hasText: 'Total Contacts' });
    this.foundersMetric = page.locator('[class*="card"]').filter({ hasText: 'Founders' });
    this.starredMetric = page.locator('[class*="card"]').filter({ hasText: 'Starred' });
    this.followUpsDueMetric = page.locator('[class*="card"]').filter({ hasText: 'Follow-ups Due' });

    // Actions
    this.addContactButton = page.getByRole('button', { name: /add contact/i });
    this.networkViewButton = page.getByRole('button', { name: /network view/i });

    // Search and filters
    this.searchInput = page.getByPlaceholder(/search contacts/i);
    this.roleFilter = page.getByRole('combobox').or(page.locator('select')).filter({ hasText: /role|all roles/i });

    // Smart Lists
    this.smartListsPanel = page.locator('[class*="smart-list"], [class*="SmartList"]').or(
      page.locator('text=Smart Lists').locator('..').locator('..')
    );
    this.activeFilterBadge = page.locator('[class*="badge"]').filter({ hasText: 'Active Filter' });
    this.clearFilterButton = page.getByRole('button', { name: /clear/i });

    // Contact list
    this.contactCards = page.locator('[class*="card"]').filter({ has: page.locator('[class*="rounded-full"]') });
    this.contactListContainer = page.locator('.max-h-\\[600px\\]').or(page.locator('[class*="overflow-y-auto"]'));

    // Contact detail drawer
    this.contactDrawer = page.locator('[role="dialog"], [class*="drawer"], [class*="Drawer"]');
    this.drawerCloseButton = page.locator('[role="dialog"] button[aria-label*="close" i], [class*="drawer"] button').first();
    this.overviewTab = page.getByRole('tab', { name: /overview/i }).or(page.locator('button').filter({ hasText: /^Overview$/i }));
    this.timelineTab = page.getByRole('tab', { name: /timeline/i }).or(page.locator('button').filter({ hasText: /^Timeline$/i }));
    this.emailTab = page.getByRole('tab', { name: /email/i }).or(page.locator('button').filter({ hasText: /Email Settings/i }));

    // Contact actions in drawer
    this.starButton = page.getByRole('button', { name: /star|unstar/i });
    this.editButton = page.getByRole('button', { name: /edit/i });
    this.deleteButton = page.getByRole('button', { name: /delete/i });
    this.sendEmailButton = page.getByRole('button', { name: /send email/i });
    this.callButton = page.getByRole('button', { name: /^call$/i });
    this.scheduleMeetingButton = page.getByRole('button', { name: /schedule meeting/i });
    this.addNoteButton = page.getByRole('button', { name: /add note/i });

    // Network Graph modal
    this.networkGraphModal = page.locator('.fixed.inset-0').filter({ hasText: /Network Graph/i });
    this.networkGraphCloseButton = this.networkGraphModal.getByRole('button', { name: /close/i });
  }

  async goto() {
    await this.page.goto('/contacts');
    await this.page.waitForLoadState('networkidle');
  }

  async getTotalContactsCount(): Promise<number> {
    const text = await this.totalContactsMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getFoundersCount(): Promise<number> {
    const text = await this.foundersMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getStarredCount(): Promise<number> {
    const text = await this.starredMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async getFollowUpsDueCount(): Promise<number> {
    const text = await this.followUpsDueMetric.locator('text=/\\d+/').first().textContent();
    return parseInt(text || '0', 10);
  }

  async searchContacts(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByRole(role: string) {
    await this.roleFilter.click();
    await this.page.getByRole('option', { name: new RegExp(role, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getContactCount(): Promise<number> {
    return this.contactCards.count();
  }

  async clickContact(index: number = 0) {
    await this.contactCards.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectContactByName(name: string) {
    const contact = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await contact.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectOverviewTab() {
    await this.overviewTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectTimelineTab() {
    await this.timelineTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectEmailTab() {
    await this.emailTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async closeDrawer() {
    await this.drawerCloseButton.click();
  }

  async openNetworkGraph() {
    await this.networkViewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async closeNetworkGraph() {
    await this.networkGraphCloseButton.click();
  }

  async toggleStar() {
    await this.starButton.click();
  }

  async getContactsByRole(role: string): Promise<Locator> {
    return this.page.locator('[class*="badge"]').filter({ hasText: new RegExp(role, 'i') });
  }

  async getRelationshipScore(): Promise<Locator> {
    return this.page.locator('text=/\\d+.*score|health|relationship/i');
  }

  getContactTags(): Locator {
    return this.page.locator('[class*="badge"]').filter({ has: this.page.locator('svg') });
  }

  getLinkedDeals(): Locator {
    return this.page.locator('text=/Associated Deals/i').locator('..').locator('[class*="rounded-lg"]');
  }
}
