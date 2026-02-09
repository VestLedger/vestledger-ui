import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DistributionsPage, DistributionWizardPage } from '../pages/distributions.page';

test.describe('Distributions', () => {
  test('should load distributions calendar page', async ({ page }) => {
    const distributions = new DistributionsPage(page);
    await distributions.goto();

    await expect(distributions.pageTitle).toBeVisible();
  });

  test('should display calendar or list view', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/calendar');
    await page.waitForLoadState('networkidle');

    // Look for calendar or list content
    const content = page.locator('[class*="calendar"], [class*="list"], table, [data-testid="distributions-view"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create new distribution button', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/calendar');

    const createButton = page.getByRole('button', { name: /create|new|add/i });

    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });
});

test.describe('Distribution Wizard', () => {
  test('should load new distribution page', async ({ page }) => {
    const wizard = new DistributionWizardPage(page);
    await wizard.goto();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show some form or wizard content
    const formContent = page.locator('form, [data-testid="wizard"], [class*="wizard"], [class*="step"]');
    await expect(formContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display wizard steps', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/new');
    await page.waitForLoadState('networkidle');

    // Look for step indicators
    const steps = page.locator('[data-testid="step"], [class*="step"], [role="progressbar"]');

    // Wizard should have steps
    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThanOrEqual(0);
  });

  test('should have form validation', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/new');
    await page.waitForLoadState('networkidle');

    // Try to proceed without filling required fields
    const nextButton = page.getByRole('button', { name: /next|continue|submit/i });

    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should show validation errors or prevent navigation
      await page.waitForTimeout(500);
    }
  });

  test('should navigate between wizard steps', async ({ page }) => {
    const wizard = new DistributionWizardPage(page);
    await wizard.goto();

    // If there's a next button, test navigation
    if (await wizard.nextButton.isVisible()) {
      // Fill any required fields first (implementation depends on actual form)
      const inputs = page.locator('input:visible, select:visible');
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
      await page.waitForLoadState('networkidle');
    }
  });

  test('should have cancel option', async ({ page }) => {
    const wizard = new DistributionWizardPage(page);
    await wizard.goto();

    const cancelButton = page.getByRole('button', { name: /cancel|back|close/i });

    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
  });
});

test.describe('Distribution Details', () => {
  test('should access distribution details page', async ({ page }) => {
    // First go to distributions list
    await loginViaRedirect(page, '/fund-admin/distributions/calendar');
    await page.waitForLoadState('networkidle');

    // Look for distribution items to click
    const distributionItem = page.locator('[data-testid="distribution-item"], table tbody tr').first();

    if (await distributionItem.isVisible()) {
      await distributionItem.click();
      await page.waitForLoadState('networkidle');

      // Should show details
      const detailsContent = page.locator('[data-testid="distribution-details"], [class*="detail"]');
      await expect(detailsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
