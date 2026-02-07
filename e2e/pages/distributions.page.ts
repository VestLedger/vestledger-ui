import { Page, Locator } from '@playwright/test';

export class DistributionsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createDistributionButton: Locator;
  readonly distributionsTable: Locator;
  readonly calendarView: Locator;
  readonly listView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.createDistributionButton = page.getByRole('button', { name: /create|new|add/i });
    this.distributionsTable = page.locator('table');
    this.calendarView = page.locator('[data-testid="calendar-view"]');
    this.listView = page.locator('[data-testid="list-view"]');
  }

  async goto() {
    await this.page.goto('/fund-admin/distributions/calendar');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoNewDistribution() {
    await this.page.goto('/fund-admin/distributions/new');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateNew() {
    await this.createDistributionButton.click();
  }

  async getDistributionRows() {
    return this.distributionsTable.locator('tbody tr');
  }
}

export class DistributionWizardPage {
  readonly page: Page;
  readonly wizardSteps: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wizardSteps = page.locator('[data-testid="wizard-steps"]');
    this.nextButton = page.getByRole('button', { name: /next|continue/i });
    this.backButton = page.getByRole('button', { name: /back|previous/i });
    this.submitButton = page.getByRole('button', { name: /submit|create|save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/fund-admin/distributions/new');
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentStep() {
    const activeStep = this.page.locator('[data-active="true"], [aria-current="step"]');
    return activeStep.textContent();
  }

  async goToNextStep() {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPreviousStep() {
    await this.backButton.click();
  }

  async fillEventDetails(data: { name?: string; date?: string; type?: string }) {
    if (data.name) {
      await this.page.getByLabel(/name|title/i).fill(data.name);
    }
    if (data.date) {
      await this.page.getByLabel(/date/i).fill(data.date);
    }
    if (data.type) {
      await this.page.getByLabel(/type/i).click();
      await this.page.getByRole('option', { name: new RegExp(data.type, 'i') }).click();
    }
  }

  async submitDistribution() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
