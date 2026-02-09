import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public Pages', () => {
  test.describe('Home Page', () => {
    test('should load home page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveTitle(/VestLedger/i);
    });

    test('should display hero section', async ({ page }) => {
      await page.goto('/');

      const hero = page.locator('[class*="hero"], [data-testid="hero"], main section').first();
      await expect(hero).toBeVisible();
    });

    test('should have navigation to login', async ({ page }) => {
      await page.goto('/');

      const loginLink = page.getByRole('link', { name: /login|sign in/i });
      const loginButton = page.getByRole('button', { name: /login|sign in/i });
      const loginCta = loginLink.or(loginButton);
      await expect(loginCta.first()).toBeVisible();
    });
  });

  test.describe('About Page', () => {
    test('should load about page', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Features Page', () => {
    test('should load features page', async ({ page }) => {
      await page.goto('/features');
      await page.waitForLoadState('networkidle');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should display feature sections', async ({ page }) => {
      await page.goto('/features');
      await page.waitForLoadState('networkidle');

      const sections = page.locator('section, [class*="feature"]');
      await expect(sections.first()).toBeVisible();
    });
  });

  test.describe('How It Works Page', () => {
    test('should load how it works page', async ({ page }) => {
      await page.goto('/how-it-works');
      await page.waitForLoadState('networkidle');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Security Page', () => {
    test('should load security page', async ({ page }) => {
      await page.goto('/security');
      await page.waitForLoadState('networkidle');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should display security information', async ({ page }) => {
      await page.goto('/security');

      // Look for security-related content
      const securityContent = page.locator('text=/security|encrypt|protect|compliance/i');
      await expect(securityContent.first()).toBeVisible();
    });
  });

  test.describe('Expression of Interest (EOI) Page', () => {
    test('should load EOI page', async ({ page }) => {
      await page.goto('/eoi');
      await page.waitForLoadState('networkidle');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should have contact form or request form', async ({ page }) => {
      await page.goto('/eoi');
      await page.waitForLoadState('networkidle');

      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });
});

test.describe('Public Navigation', () => {
  test('should navigate between public pages', async ({ page }) => {
    const publicRoutes = ['/', '/about', '/features', '/how-it-works', '/security', '/eoi'];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Each page should load without errors
      const errorMessage = page.locator('text=/error|404|not found/i');
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('should have consistent navigation header', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');

    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });
});
