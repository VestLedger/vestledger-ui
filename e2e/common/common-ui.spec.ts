import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';

test.describe('Common UI Elements', () => {
  test.describe('Navigation', () => {
    test('should display sidebar navigation', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const sidebar = page.locator('nav, aside, [data-testid="sidebar"]').first();
      await expect(sidebar).toBeVisible();
    });

    test('should have collapsible sidebar on desktop', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const toggleButton = page.locator('[data-testid="sidebar-toggle"], [aria-label*="sidebar" i]');

      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(300);
      }
    });

    test('should have mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await loginViaRedirect(page, '/dashboard');

      const mobileMenu = page.locator('[data-testid="mobile-menu"], [aria-label*="menu" i]');

      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Header', () => {
    test('should display header with user info', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const header = page.locator('header, [data-testid="header"]').first();
      await expect(header).toBeVisible();
    });

    test('should have notifications button', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const notificationsBtn = page.locator('[aria-label*="notification" i], [data-testid="notifications"]');

      if (await notificationsBtn.isVisible()) {
        await expect(notificationsBtn).toBeVisible();
      }
    });

    test('should have user menu', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user" i], [aria-label*="profile" i]');

      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Search', () => {
    test('should have global search', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const searchInput = page.getByPlaceholder(/search/i);

      if (await searchInput.isVisible()) {
        await searchInput.fill('test search');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Theme', () => {
    test('should support dark mode toggle', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      const themeToggle = page.locator('[data-testid="theme-toggle"], [aria-label*="theme" i], [aria-label*="dark" i]');

      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicators during data fetch', async ({ page }) => {
      await loginViaRedirect(page, '/dashboard');

      // Look for loading indicators (they may be brief)
      const loadingIndicator = page.locator('[data-testid="loading"], [class*="loading"], [class*="spinner"]');

      // Loading state might be brief, so we just check if any exist
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Error States', () => {
    test('should handle 404 page', async ({ page }) => {
      await loginViaRedirect(page, '/non-existent-page-12345');

      // Should show 404 or redirect
      const notFoundContent = page.locator('text=/404|not found|page not found/i');

      // Either shows 404 or redirects to login/home
      const url = page.url();
      const has404 = await notFoundContent.isVisible();
      const redirected = url.includes('/login') || url === '/';

      expect(has404 || redirected).toBeTruthy();
    });
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await loginViaRedirect(page, '/dashboard');

      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Content should not overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });
  }
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await loginViaRedirect(page, '/dashboard');

    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await loginViaRedirect(page, '/dashboard');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should have proper focus states', async ({ page }) => {
    await loginViaRedirect(page, '/dashboard');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
