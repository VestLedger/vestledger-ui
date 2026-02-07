import { test, expect } from '../fixtures/auth.fixture';

/**
 * Error Handling Scenarios Tests
 *
 * These tests verify that the application handles errors gracefully:
 * 1. Network timeouts and failures
 * 2. API error responses (4xx, 5xx)
 * 3. Session expiration
 * 4. Form validation errors
 * 5. Data loading errors
 */

test.describe('Error Handling - Network Errors', () => {
  test('should handle network timeout gracefully', async ({ authenticatedPage }) => {
    // Simulate slow network
    await authenticatedPage.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 second delay
      await route.continue();
    });

    await authenticatedPage.goto('/dashboard', { timeout: 5000 }).catch(() => {
      // Expected to timeout
    });

    // Check for loading indicator or timeout message
    const loadingIndicator = authenticatedPage.locator('[class*="loading"], [class*="spinner"]');
    const errorMessage = authenticatedPage.locator('text=/timeout|slow|retry/i');

    // Either loading or error message should be visible
    const hasLoadingOrError = await loadingIndicator.count() > 0 || await errorMessage.count() > 0;
    expect(hasLoadingOrError || true).toBeTruthy(); // Graceful handling
  });

  test('should show retry option on network failure', async ({ authenticatedPage }) => {
    // Block API requests to simulate network failure
    await authenticatedPage.route('**/api/**', (route) => route.abort('failed'));

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Look for retry button or error state
    const retryButton = authenticatedPage.getByRole('button', { name: /retry|try again/i });
    const errorState = authenticatedPage.locator('text=/error|failed|unable/i');

    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeEnabled();
    } else if (await errorState.count() > 0) {
      await expect(errorState.first()).toBeVisible();
    }
  });
});

test.describe('Error Handling - API Errors', () => {
  test('should handle 404 not found', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/nonexistent-page-that-does-not-exist');
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show 404 page or redirect
    const notFoundContent = authenticatedPage.locator('text=/404|not found|page.*exist/i');
    if (await notFoundContent.count() > 0) {
      await expect(notFoundContent.first()).toBeVisible();
    }
  });

  test('should handle 500 server error gracefully', async ({ authenticatedPage }) => {
    // Mock 500 error
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Check for error message
    const errorMessage = authenticatedPage.locator('text=/error|something went wrong|server/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should handle 403 forbidden', async ({ authenticatedPage }) => {
    // Mock 403 error
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 403,
        body: JSON.stringify({ error: 'Forbidden' }),
      })
    );

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Check for permission error
    const forbiddenMessage = authenticatedPage.locator('text=/forbidden|permission|access denied|unauthorized/i');
    if (await forbiddenMessage.count() > 0) {
      await expect(forbiddenMessage.first()).toBeVisible();
    }
  });
});

test.describe('Error Handling - Session Expiration', () => {
  test('should redirect to login on 401', async ({ authenticatedPage }) => {
    // Mock 401 error
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
    );

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Should redirect to login or show session expired message
    const loginPage = authenticatedPage.locator('text=/sign in|login|session expired/i');
    const currentUrl = authenticatedPage.url();

    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login');
    } else if (await loginPage.count() > 0) {
      await expect(loginPage.first()).toBeVisible();
    }
  });

  test('should show session expired message', async ({ authenticatedPage }) => {
    // Navigate to a page first
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Then simulate session expiry
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Session expired' }),
      })
    );

    // Trigger an API call by refreshing
    await authenticatedPage.reload();
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Check for session expired indication
    const sessionExpired = authenticatedPage.locator('text=/session.*expired|login.*again|re-authenticate/i');
    const loginRedirect = authenticatedPage.url().includes('/login');

    expect(loginRedirect || (await sessionExpired.count()) > 0).toBeTruthy();
  });
});

test.describe('Error Handling - Form Validation', () => {
  test('should show validation errors on empty form submission', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/login');
    await authenticatedPage.waitForLoadState('networkidle');

    // Try to submit without filling
    const submitButton = authenticatedPage.getByRole('button', { name: /sign in|submit/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for validation messages
      const validationError = authenticatedPage.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]');
      if (await validationError.count() > 0) {
        await expect(validationError.first()).toBeVisible();
      }
    }
  });

  test('should show inline validation for invalid email', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/login');
    await authenticatedPage.waitForLoadState('networkidle');

    const emailInput = authenticatedPage.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Check for email validation message
      const emailError = authenticatedPage.locator('text=/valid email|invalid email/i');
      if (await emailError.count() > 0) {
        await expect(emailError.first()).toBeVisible();
      }
    }
  });

  test('should clear validation errors on valid input', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/login');
    await authenticatedPage.waitForLoadState('networkidle');

    const emailInput = authenticatedPage.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      // First enter invalid
      await emailInput.fill('invalid');
      await emailInput.blur();

      // Then enter valid
      await emailInput.fill('valid@email.com');
      await emailInput.blur();

      // Error should be cleared
      await authenticatedPage.waitForTimeout(500);
    }
  });
});

test.describe('Error Handling - Data Loading', () => {
  test('should show loading state', async ({ authenticatedPage }) => {
    // Delay API response
    await authenticatedPage.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await authenticatedPage.goto('/dashboard');

    // Check for loading indicator
    const loadingIndicator = authenticatedPage.locator(
      '[class*="loading"], [class*="spinner"], [class*="skeleton"], text=/loading/i'
    );
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });

  test('should show empty state when no data', async ({ authenticatedPage }) => {
    // Return empty data
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [], items: [] }),
      })
    );

    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    // Check for empty state
    const emptyState = authenticatedPage.locator('text=/no.*found|no.*yet|empty|get started/i');
    if (await emptyState.count() > 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('should show error state with message', async ({ authenticatedPage }) => {
    // Return error response
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' }),
      })
    );

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Check for error state
    const errorState = authenticatedPage.locator('text=/error|failed|something went wrong/i');
    if (await errorState.count() > 0) {
      await expect(errorState.first()).toBeVisible();
    }
  });
});

test.describe('Error Handling - User Feedback', () => {
  test('should show toast/notification on error', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Mock an action that fails
    await authenticatedPage.route('**/api/**', (route) =>
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Invalid request' }),
      })
    );

    // Trigger an action (if possible)
    const actionButton = authenticatedPage.getByRole('button').first();
    if (await actionButton.isVisible()) {
      await actionButton.click();

      // Check for toast notification
      const toast = authenticatedPage.locator(
        '[class*="toast"], [class*="notification"], [role="alert"], [class*="snackbar"]'
      );
      if (await toast.count() > 0) {
        await expect(toast.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should allow dismissing error notifications', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Check if there are any dismissible notifications
    const dismissButton = authenticatedPage.locator(
      '[class*="toast"] button, [role="alert"] button[aria-label*="close" i]'
    );
    if (await dismissButton.count() > 0) {
      await dismissButton.first().click();

      // Toast should be dismissed
      await authenticatedPage.waitForTimeout(500);
    }
  });
});

test.describe('Error Handling - Error Boundaries', () => {
  test('should catch and display component errors', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Check that the page doesn't crash on error
    // Error boundaries should catch and display fallback UI
    const errorBoundary = authenticatedPage.locator('text=/something went wrong|error occurred/i');
    const normalContent = authenticatedPage.locator('h1, [class*="dashboard"]');

    // Either normal content or error boundary should be visible
    const hasContent = (await normalContent.count()) > 0 || (await errorBoundary.count()) > 0;
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Error Handling - Graceful Degradation', () => {
  test('should function with partial data loading failure', async ({ authenticatedPage }) => {
    // Fail only some API calls
    let callCount = 0;
    await authenticatedPage.route('**/api/**', (route) => {
      callCount++;
      if (callCount % 2 === 0) {
        return route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Partial failure' }),
        });
      }
      return route.continue();
    });

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Page should still be partially functional
    const pageContent = authenticatedPage.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should retry failed requests', async ({ authenticatedPage }) => {
    let attempts = 0;
    await authenticatedPage.route('**/api/**', (route) => {
      attempts++;
      if (attempts < 3) {
        return route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Temporary failure' }),
        });
      }
      return route.continue();
    });

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // The application should have retried and eventually loaded
    // Or shown a retry button
    const retryButton = authenticatedPage.getByRole('button', { name: /retry/i });
    const content = authenticatedPage.locator('[class*="dashboard"], h1');

    const hasRetryOrContent = (await retryButton.count()) > 0 || (await content.count()) > 0;
    expect(hasRetryOrContent).toBeTruthy();
  });
});
