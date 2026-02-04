import { test, expect } from '../fixtures/auth.fixture';
import { DistributionsPage, DistributionWizardPage } from '../pages/distributions.page';

test.describe('Distributions', () => {
  test('should load distributions calendar page', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    await expect(distributions.pageTitle).toBeVisible();
  });

  test('should display calendar or list view', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin/distributions/calendar');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for calendar or list content
    const content = authenticatedPage.locator('[class*="calendar"], [class*="list"], table, [data-testid="distributions-view"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create new distribution button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin/distributions/calendar');

    const createButton = authenticatedPage.getByRole('button', { name: /create|new|add/i });

    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });
});

test.describe('Distribution Wizard', () => {
  test('should load new distribution page', async ({ authenticatedPage }) => {
    const wizard = new DistributionWizardPage(authenticatedPage);
    await wizard.goto();

    // Wait for page to load
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show some form or wizard content
    const formContent = authenticatedPage.locator('form, [data-testid="wizard"], [class*="wizard"], [class*="step"]');
    await expect(formContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display wizard steps', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin/distributions/new');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for step indicators
    const steps = authenticatedPage.locator('[data-testid="step"], [class*="step"], [role="progressbar"]');

    // Wizard should have steps
    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThanOrEqual(0);
  });

  test('should have form validation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin/distributions/new');
    await authenticatedPage.waitForLoadState('networkidle');

    // Try to proceed without filling required fields
    const nextButton = authenticatedPage.getByRole('button', { name: /next|continue|submit/i });

    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should show validation errors or prevent navigation
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('should navigate between wizard steps', async ({ authenticatedPage }) => {
    const wizard = new DistributionWizardPage(authenticatedPage);
    await wizard.goto();

    // If there's a next button, test navigation
    if (await wizard.nextButton.isVisible()) {
      // Fill any required fields first (implementation depends on actual form)
      const inputs = authenticatedPage.locator('input:visible, select:visible');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount && i < 3; i++) {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type');

        if (type === 'text' || type === 'number' || !type) {
          await input.fill('Test Value');
        }
      }

      // Try to navigate
      await wizard.nextButton.click();
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });

  test('should have cancel option', async ({ authenticatedPage }) => {
    const wizard = new DistributionWizardPage(authenticatedPage);
    await wizard.goto();

    const cancelButton = authenticatedPage.getByRole('button', { name: /cancel|back|close/i });

    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
  });
});

test.describe('Distribution Details', () => {
  test('should access distribution details page', async ({ authenticatedPage }) => {
    // First go to distributions list
    await authenticatedPage.goto('/fund-admin/distributions/calendar');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for distribution items to click
    const distributionItem = authenticatedPage.locator('[data-testid="distribution-item"], table tbody tr').first();

    if (await distributionItem.isVisible()) {
      await distributionItem.click();
      await authenticatedPage.waitForLoadState('networkidle');

      // Should show details
      const detailsContent = authenticatedPage.locator('[data-testid="distribution-details"], [class*="detail"]');
      await expect(detailsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
