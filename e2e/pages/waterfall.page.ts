import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class WaterfallPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly tiersContainer: Locator;
  readonly addTierButton: Locator;
  readonly calculateButton: Locator;
  readonly timelineView: Locator;
  readonly summaryPanel: Locator;
  readonly scenarioItems: Locator;
  readonly lockedBadges: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.tiersContainer = page.locator('[data-testid="tiers-container"]');
    this.addTierButton = page.getByRole('button', { name: /add tier|new tier/i });
    this.calculateButton = page.getByRole('button', { name: /calculate|run/i });
    this.timelineView = page.locator('[data-testid="timeline"]');
    this.summaryPanel = page.locator('[data-testid="summary"]');
    this.scenarioItems = page.locator('[class*="ListItemCard"]');
    this.lockedBadges = page.getByText('Locked', { exact: true });
  }

  async goto() {
    await loginViaRedirect(this.page, '/waterfall');
  }

  async getTierCount() {
    const tiers = this.page.locator('[data-testid="tier-item"]');
    return tiers.count();
  }

  async addTier() {
    await this.addTierButton.click();
  }

  async editTier(index: number) {
    const tier = this.page.locator('[data-testid="tier-item"]').nth(index);
    await tier.click();
  }

  async runCalculation() {
    await this.calculateButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isTimelineVisible() {
    return this.timelineView.isVisible();
  }

  getScenarioDeleteButton(scenarioItem: Locator) {
    return scenarioItem.getByRole('button', { name: /delete scenario/i });
  }

  getScenarioArchiveButton(scenarioItem: Locator) {
    return scenarioItem.getByRole('button', { name: /archive scenario/i });
  }

  getScenarioDuplicateButton(scenarioItem: Locator) {
    return scenarioItem.getByRole('button', { name: /duplicate scenario/i });
  }

  getScenarioFavoriteButton(scenarioItem: Locator) {
    return scenarioItem.getByRole('button', { name: /favorite/i });
  }
}