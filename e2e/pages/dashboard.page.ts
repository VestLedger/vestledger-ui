import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly mainContent: Locator;
  readonly userMenu: Locator;
  readonly notificationsButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('nav, aside').first();
    this.mainContent = page.locator('main');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.notificationsButton = page.locator('[aria-label*="notification" i]');
    this.searchInput = page.getByPlaceholder(/search/i);
  }

  async goto() {
    await loginViaRedirect(this.page, '/home');
  }

  async navigateTo(menuItem: string) {
    await this.sidebar.getByText(menuItem, { exact: false }).click();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getPageTitle() {
    return this.page.title();
  }

  async isLoaded() {
    await this.mainContent.waitFor({ state: 'visible' });
    return true;
  }
}