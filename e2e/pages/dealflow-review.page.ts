import { Page, Locator } from '@playwright/test';

export class DealflowReviewPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // Header actions
  readonly startPresentationButton: Locator;
  readonly stopPresentationButton: Locator;
  readonly shareButton: Locator;
  readonly exportButton: Locator;

  // Deal selector
  readonly dealSelectorCard: Locator;
  readonly previousDealButton: Locator;
  readonly nextDealButton: Locator;
  readonly dealButtons: Locator;
  readonly currentDealIndicator: Locator;

  // Slide navigation
  readonly slidesPanel: Locator;
  readonly slideButtons: Locator;
  readonly addSlideButton: Locator;

  // Voting panel
  readonly votingPanel: Locator;
  readonly yesVoteButton: Locator;
  readonly maybeVoteButton: Locator;
  readonly noVoteButton: Locator;
  readonly votesCastSection: Locator;

  // Main slide display
  readonly slideCard: Locator;
  readonly slideNumber: Locator;
  readonly slideTitle: Locator;
  readonly slideContent: Locator;
  readonly editSlideButton: Locator;

  // Slide navigation controls
  readonly previousSlideButton: Locator;
  readonly nextSlideButton: Locator;
  readonly slideNavigationDots: Locator;

  // Discussion section
  readonly discussionSection: Locator;
  readonly discussionTextarea: Locator;

  // Partner scoring
  readonly partnerScoringSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /Dealflow Review/i }).first();

    // Header actions
    this.startPresentationButton = page.getByRole('button', { name: /start presentation/i });
    this.stopPresentationButton = page.getByRole('button', { name: /stop presenting/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.exportButton = page.getByRole('button', { name: /export/i });

    // Deal selector
    this.dealSelectorCard = page.locator('[class*="card"]').filter({ has: page.locator('text=/Reviewing deal \\d+ of \\d+/i') });
    this.previousDealButton = page.getByRole('button', { name: /previous/i }).first();
    this.nextDealButton = page.getByRole('button', { name: /next/i }).first();
    this.dealButtons = page.locator('button').filter({ has: page.locator('text=/•/') });
    this.currentDealIndicator = page.locator('text=/Reviewing deal \\d+ of \\d+/i');

    // Slide navigation
    this.slidesPanel = page.locator('[class*="card"]').filter({ hasText: 'Slides' }).first();
    this.slideButtons = this.slidesPanel.locator('button').filter({ has: page.locator('text=/Slide \\d+/i') });
    this.addSlideButton = page.getByRole('button', { name: /add slide/i });

    // Voting panel
    this.votingPanel = page.locator('[class*="card"]').filter({ hasText: /^Vote$/i }).or(
      page.locator('[class*="card"]').filter({ has: page.locator('text=/Yes.*Proceed/i') })
    );
    this.yesVoteButton = page.getByRole('button', { name: /yes.*proceed/i });
    this.maybeVoteButton = page.getByRole('button', { name: /maybe.*more dd/i });
    this.noVoteButton = page.getByRole('button', { name: /no.*pass/i });
    this.votesCastSection = page.locator('text=/Votes Cast/i').locator('..');

    // Main slide display
    this.slideCard = page.locator('[class*="card"]').filter({ has: page.locator('text=/Slide \\d+ of \\d+/i') }).first();
    this.slideNumber = page.locator('[class*="badge"]').filter({ hasText: /Slide \\d+ of \\d+/i });
    this.slideTitle = this.slideCard.locator('h3').first();
    this.slideContent = this.slideCard.locator('[class*="space-y"]').first();
    this.editSlideButton = page.getByRole('button', { name: /edit slide/i });

    // Slide navigation controls
    this.previousSlideButton = page.getByRole('button', { name: /previous/i }).last();
    this.nextSlideButton = page.getByRole('button', { name: /next/i }).last();
    this.slideNavigationDots = page.locator('[role="navigation"][aria-label*="Slide navigation"]').locator('button');

    // Discussion section
    this.discussionSection = page.locator('[class*="card"]').filter({ hasText: 'Discussion' });
    this.discussionTextarea = page.locator('textarea[aria-label*="Discussion"]').or(
      page.getByPlaceholder(/add your thoughts/i)
    );

    // Partner scoring
    this.partnerScoringSection = page.locator('[class*="card"]').filter({ hasText: 'Partner Scoring' });
  }

  async goto() {
    await this.page.goto('/dealflow-review');
    await this.page.waitForLoadState('networkidle');
  }

  async getSlideCount(): Promise<number> {
    return this.slideButtons.count();
  }

  async getCurrentSlideNumber(): Promise<number> {
    const text = await this.slideNumber.textContent();
    const match = text?.match(/Slide (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getTotalSlides(): Promise<number> {
    const text = await this.slideNumber.textContent();
    const match = text?.match(/of (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getCurrentDealIndex(): Promise<number> {
    const text = await this.currentDealIndicator.textContent();
    const match = text?.match(/deal (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getTotalDeals(): Promise<number> {
    const text = await this.currentDealIndicator.textContent();
    const match = text?.match(/of (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async selectSlide(index: number) {
    await this.slideButtons.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async nextSlide() {
    await this.nextSlideButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async previousSlide() {
    await this.previousSlideButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectDeal(index: number) {
    await this.dealButtons.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async nextDeal() {
    await this.nextDealButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async previousDeal() {
    await this.previousDealButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async voteYes() {
    await this.yesVoteButton.click();
  }

  async voteMaybe() {
    await this.maybeVoteButton.click();
  }

  async voteNo() {
    await this.noVoteButton.click();
  }

  async addComment(comment: string) {
    await this.discussionTextarea.fill(comment);
  }

  async startPresentation() {
    await this.startPresentationButton.click();
  }

  async stopPresentation() {
    await this.stopPresentationButton.click();
  }

  getSlideByType(type: string): Locator {
    return this.slideButtons.filter({ hasText: new RegExp(type, 'i') });
  }

  async getVotesCount(): Promise<number> {
    const votesSection = this.votesCastSection.locator('[class*="flex items-center justify-between"]');
    return votesSection.count();
  }

  getVotesByType(voteType: 'yes' | 'no' | 'maybe'): Locator {
    return this.votesCastSection.locator(`[class*="badge"]`).filter({ hasText: new RegExp(voteType, 'i') });
  }

  async getSlideTitle(): Promise<string | null> {
    return this.slideTitle.textContent();
  }

  // Slide content getters based on slide type
  getOverviewSlideContent(): Locator {
    return this.page.locator('text=/Founder|Location|Sector|Stage/i').locator('..');
  }

  getMarketSlideContent(): Locator {
    return this.page.locator('text=/TAM|SAM|SOM/i').locator('..');
  }

  getProductSlideContent(): Locator {
    return this.page.locator('text=/Key Differentiators/i').locator('..');
  }

  getFinancialsSlideContent(): Locator {
    return this.page.locator('text=/ARR|YoY Growth|Monthly Burn|Runway/i').locator('..');
  }

  getTeamSlideContent(): Locator {
    return this.page.locator('text=/Leadership Team/i').locator('..');
  }

  getAskSlideContent(): Locator {
    return this.page.locator('text=/Raising|Use of Funds/i').locator('..');
  }
}
