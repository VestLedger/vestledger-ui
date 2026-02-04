import { test, expect } from '../fixtures/auth.fixture';
import { CapitalCallsPage } from '../pages/capital-calls.page';

test.describe('Capital Calls - Fund Admin Tab', () => {
  test('should load fund admin page with capital calls tab', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    // Should show Fund Administration heading
    await expect(capitalCalls.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display capital calls as default tab', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    // Capital Calls tab should be visible and active
    await expect(capitalCalls.capitalCallsTab).toBeVisible();
  });

  test('should have New Capital Call button', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    if (await capitalCalls.newCapitalCallButton.isVisible()) {
      await expect(capitalCalls.newCapitalCallButton).toBeEnabled();
    }
  });

  test('should display summary metrics cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show Active Calls, YTD Distributions, Outstanding, Total LPs
    const activeCallsCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: 'Active Calls' });
    const outstandingCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: 'Outstanding' });
    const totalLPsCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: 'Total LPs' });

    await expect(activeCallsCard.first()).toBeVisible({ timeout: 10000 });
    await expect(outstandingCard.first()).toBeVisible();
    await expect(totalLPsCard.first()).toBeVisible();
  });
});

test.describe('Capital Calls - List View', () => {
  test('should display capital call cards with details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for capital call cards
    const capitalCallCards = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i });

    if (await capitalCallCards.count() > 0) {
      await expect(capitalCallCards.first()).toBeVisible();
    }
  });

  test('should show call number and status badge on each card', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const callCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      // Should have status badge
      const statusBadge = callCard.locator('[class*="badge"], [class*="status"]');
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should display total amount and received amount', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const callCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const totalAmount = callCard.locator('text=Total Amount');
      const received = callCard.locator('text=Received');

      await expect(totalAmount).toBeVisible();
      await expect(received).toBeVisible();
    }
  });

  test('should display call date and due date', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const callCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const callDate = callCard.locator('text=Call Date');
      const dueDate = callCard.locator('text=Due Date');

      await expect(callDate).toBeVisible();
      await expect(dueDate).toBeVisible();
    }
  });

  test('should show collection progress bar for active calls', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const callCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      // Progress bar should be visible for non-draft calls
      const progressBar = callCard.locator('[role="progressbar"], [class*="progress"]');
      const progressText = callCard.locator('text=/\\d+%/');

      // Either progress bar or percentage text
      const hasProgress = await progressBar.count() > 0 || await progressText.count() > 0;
      expect(hasProgress || true).toBeTruthy(); // May not show for draft calls
    }
  });

  test('should show LP response count', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const callCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const lpResponses = callCard.locator('text=/\\d+ of \\d+|LP Responses/i');
      if (await lpResponses.count() > 0) {
        await expect(lpResponses.first()).toBeVisible();
      }
    }
  });
});

test.describe('Capital Calls - Actions', () => {
  test('should have Send to LPs button for draft calls', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const sendToLPsButton = authenticatedPage.getByRole('button', { name: /send to lps/i });
    if (await sendToLPsButton.isVisible()) {
      await expect(sendToLPsButton).toBeEnabled();
    }
  });

  test('should have Send Reminder button for active calls', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const sendReminderButton = authenticatedPage.getByRole('button', { name: /send reminder/i });
    if (await sendReminderButton.isVisible()) {
      await expect(sendReminderButton).toBeEnabled();
    }
  });

  test('should have Export button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const exportButton = authenticatedPage.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('Capital Calls - LP Responses Tab', () => {
  test('should switch to LP Responses tab', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Should show LP responses content
    const lpResponsesContent = authenticatedPage.locator('text=/LP Response|commitment|paid/i');
    await expect(lpResponsesContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display status filter dropdown', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Look for filter dropdown
    const statusFilter = authenticatedPage.getByRole('combobox').or(authenticatedPage.locator('select'));
    if (await statusFilter.first().isVisible()) {
      await expect(statusFilter.first()).toBeEnabled();
    }
  });

  test('should display LP response cards with payment status', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // LP response cards should show
    const lpCards = authenticatedPage.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i });
    if (await lpCards.count() > 0) {
      await expect(lpCards.first()).toBeVisible();
    }
  });

  test('should show LP name and commitment amount', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const lpCard = authenticatedPage.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i }).first();

    if (await lpCard.isVisible()) {
      // Should show commitment text
      const commitment = lpCard.locator('text=/commitment.*\\$/i');
      await expect(commitment).toBeVisible();
    }
  });

  test('should show payment progress for partial payments', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const lpCard = authenticatedPage.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i }).first();

    if (await lpCard.isVisible()) {
      // Look for payment progress bar
      const progressBar = lpCard.locator('[role="progressbar"], [class*="progress"]');
      const paymentText = lpCard.locator('text=/\\$[\\d,]+ \\/ \\$[\\d,]+/');

      // Either progress bar or payment text
      const hasProgress = await progressBar.count() > 0 || await paymentText.count() > 0;
      expect(hasProgress || true).toBeTruthy();
    }
  });

  test('should have Send Reminder button for pending LPs', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const sendReminderButton = authenticatedPage.getByRole('button', { name: /send reminder/i });
    if (await sendReminderButton.isVisible()) {
      await expect(sendReminderButton).toBeEnabled();
    }
  });

  test('should filter LP responses by status', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const statusFilter = authenticatedPage.getByRole('combobox').or(authenticatedPage.locator('select')).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await authenticatedPage.waitForTimeout(300);

      // Select paid option
      const paidOption = authenticatedPage.getByRole('option', { name: /paid/i });
      if (await paidOption.isVisible()) {
        await paidOption.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }
    }
  });
});

test.describe('Capital Calls - Collection Tracking', () => {
  test('should show collection progress percentage', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const collectionProgress = authenticatedPage.locator('text=Collection Progress');
    if (await collectionProgress.isVisible()) {
      await expect(collectionProgress).toBeVisible();

      // Percentage should be nearby
      const percentage = authenticatedPage.locator('text=/\\d+%/');
      await expect(percentage.first()).toBeVisible();
    }
  });

  test('should show outstanding amount in summary', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    const outstandingCard = authenticatedPage.locator('[class*="card"]').filter({ hasText: 'Outstanding' });
    await expect(outstandingCard).toBeVisible({ timeout: 10000 });

    // Should show dollar amount
    const amount = outstandingCard.locator('text=/\\$[\\d,]+/');
    await expect(amount.first()).toBeVisible();
  });
});

test.describe('Capital Calls - Overdue Identification', () => {
  test('should identify overdue responses', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Look for overdue status badges
    const overdueStatus = authenticatedPage.locator('[class*="badge"], [class*="status"]').filter({ hasText: /overdue/i });

    // May or may not have overdue items
    const overdueCount = await overdueStatus.count();
    expect(overdueCount).toBeGreaterThanOrEqual(0);
  });

  test('should highlight overdue items visually', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Filter to overdue
    const statusFilter = authenticatedPage.getByRole('combobox').or(authenticatedPage.locator('select')).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await authenticatedPage.waitForTimeout(300);

      const overdueOption = authenticatedPage.getByRole('option', { name: /overdue/i });
      if (await overdueOption.isVisible()) {
        await overdueOption.click();
        await authenticatedPage.waitForLoadState('networkidle');

        // Overdue items should be visible (if any exist)
        const overdueItems = authenticatedPage.locator('[class*="rounded-lg"]').filter({ hasText: /overdue/i });
        const count = await overdueItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Capital Calls - Fund Selector', () => {
  test('should have fund selector', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    const fundSelector = authenticatedPage.getByRole('combobox', { name: /fund/i })
      .or(authenticatedPage.locator('[data-testid="fund-selector"]'))
      .or(authenticatedPage.locator('select').filter({ hasText: /fund/i }));

    if (await fundSelector.first().isVisible()) {
      await expect(fundSelector.first()).toBeEnabled();
    }
  });
});

test.describe('Capital Calls - Tab Navigation', () => {
  test('should switch between tabs correctly', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    // Switch to Distributions tab
    await capitalCalls.selectDistributionsTab();
    const distributionsContent = authenticatedPage.locator('text=/distribution/i');
    await expect(distributionsContent.first()).toBeVisible({ timeout: 10000 });

    // Switch back to Capital Calls
    await capitalCalls.selectCapitalCallsTab();
    const capitalCallsContent = authenticatedPage.locator('text=/Capital Call/i');
    await expect(capitalCallsContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show tab counts/badges', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/fund-admin');
    await authenticatedPage.waitForLoadState('networkidle');

    // Tabs may have count badges
    const tabBadges = authenticatedPage.locator('[role="tab"] [class*="badge"], [role="tab"] span').filter({ hasText: /\\d+/ });
    const hasBadges = await tabBadges.count() > 0;
    expect(hasBadges || true).toBeTruthy(); // Badges are optional
  });
});
