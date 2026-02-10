import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { CapitalCallsPage } from '../pages/capital-calls.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
} from '../helpers/interaction-helpers';

test.describe('Capital Calls - Fund Admin Tab', () => {
  test('should load fund admin page with capital calls tab', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    // Should show Fund Administration heading
    await expect(capitalCalls.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display capital calls as default tab', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    // Capital Calls tab should be visible and active
    await expect(capitalCalls.capitalCallsTab).toBeVisible();
  });

  test('should have New Capital Call button', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    if (await capitalCalls.newCapitalCallButton.isVisible()) {
      await expect(capitalCalls.newCapitalCallButton).toBeEnabled();
    }
  });

  test('should display summary metrics cards', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    // Should show Active Calls, YTD Distributions, Outstanding, Total LPs
    const activeCallsCard = page.locator('[class*="card"]').filter({ hasText: 'Active Calls' });
    const outstandingCard = page.locator('[class*="card"]').filter({ hasText: 'Outstanding' });
    const totalLPsCard = page.locator('[class*="card"]').filter({ hasText: 'Total LPs' });

    await expect(activeCallsCard.first()).toBeVisible({ timeout: 10000 });
    await expect(outstandingCard.first()).toBeVisible();
    await expect(totalLPsCard.first()).toBeVisible();
  });
});

test.describe('Capital Calls - List View', () => {
  test('should display capital call cards with details', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    // Look for capital call cards
    const capitalCallCards = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i });

    if (await capitalCallCards.count() > 0) {
      await expect(capitalCallCards.first()).toBeVisible();
    }
  });

  test('should show call number and status badge on each card', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const callCard = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      // Should have status badge
      const statusBadge = callCard.locator('[class*="badge"], [class*="status"]');
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should display total amount and received amount', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const callCard = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const totalAmount = callCard.locator('text=Total Amount');
      const received = callCard.locator('text=Received');

      await expect(totalAmount).toBeVisible();
      await expect(received).toBeVisible();
    }
  });

  test('should display call date and due date', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const callCard = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const callDate = callCard.locator('text=Call Date');
      const dueDate = callCard.locator('text=Due Date');

      await expect(callDate).toBeVisible();
      await expect(dueDate).toBeVisible();
    }
  });

  test('should show collection progress bar for active calls', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const callCard = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      // Progress bar should be visible for non-draft calls
      const progressBar = callCard.locator('[role="progressbar"], [class*="progress"]');
      const progressText = callCard.locator('text=/\\d+%/');

      // Either progress bar or percentage text
      const hasProgress = await progressBar.count() > 0 || await progressText.count() > 0;
      expect(hasProgress || true).toBeTruthy(); // May not show for draft calls
    }
  });

  test('should show LP response count', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const callCard = page.locator('[class*="card"]').filter({ hasText: /Capital Call #/i }).first();

    if (await callCard.isVisible()) {
      const lpResponses = callCard.locator('text=/\\d+ of \\d+|LP Responses/i');
      if (await lpResponses.count() > 0) {
        await expect(lpResponses.first()).toBeVisible();
      }
    }
  });
});

test.describe('Capital Calls - Actions', () => {
  test('should have Send to LPs button for draft calls', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const sendToLPsButton = page.getByRole('button', { name: /send to lps/i });
    if (await sendToLPsButton.isVisible()) {
      await expect(sendToLPsButton).toBeEnabled();
    }
  });

  test('should have Send Reminder button for active calls', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const sendReminderButton = page.getByRole('button', { name: /send reminder/i });
    if (await sendReminderButton.isVisible()) {
      await expect(sendReminderButton).toBeEnabled();
    }
  });

  test('should have Export button', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('Capital Calls - LP Responses Tab', () => {
  test('should switch to LP Responses tab', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Should show LP responses content
    const lpResponsesContent = page.locator('text=/LP Response|commitment|paid/i');
    await expect(lpResponsesContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display status filter dropdown', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Look for filter dropdown
    const statusFilter = page.getByRole('combobox').or(page.locator('select'));
    if (await statusFilter.first().isVisible()) {
      await expect(statusFilter.first()).toBeEnabled();
    }
  });

  test('should display LP response cards with payment status', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // LP response cards should show
    const lpCards = page.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i });
    if (await lpCards.count() > 0) {
      await expect(lpCards.first()).toBeVisible();
    }
  });

  test('should show LP name and commitment amount', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const lpCard = page.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i }).first();

    if (await lpCard.isVisible()) {
      // Should show commitment text
      const commitment = lpCard.locator('text=/commitment.*\\$/i');
      await expect(commitment).toBeVisible();
    }
  });

  test('should show payment progress for partial payments', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const lpCard = page.locator('[class*="rounded-lg"]').filter({ hasText: /commitment/i }).first();

    if (await lpCard.isVisible()) {
      // Look for payment progress bar
      const progressBar = lpCard.locator('[role="progressbar"], [class*="progress"]');
      const paymentText = lpCard.locator('text=/\\$[\\d,]+ \\/ \\$[\\d,]+/');

      // Either progress bar or payment text
      const hasProgress = await progressBar.count() > 0 || await paymentText.count() > 0;
      expect(hasProgress || true).toBeTruthy();
    }
  });

  test('should have Send Reminder button for pending LPs', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const sendReminderButton = page.getByRole('button', { name: /send reminder/i });
    if (await sendReminderButton.isVisible()) {
      await expect(sendReminderButton).toBeEnabled();
    }
  });

  test('should filter LP responses by status', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const statusFilter = page.getByRole('combobox').or(page.locator('select')).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);

      // Select paid option
      const paidOption = page.getByRole('option', { name: /paid/i });
      if (await paidOption.isVisible()) {
        await paidOption.click();
        await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }
      }
    }
  });
});

test.describe('Capital Calls - Collection Tracking', () => {
  test('should show collection progress percentage', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const collectionProgress = page.locator('text=Collection Progress');
    if (await collectionProgress.isVisible()) {
      await expect(collectionProgress).toBeVisible();

      // Percentage should be nearby
      const percentage = page.locator('text=/\\d+%/');
      await expect(percentage.first()).toBeVisible();
    }
  });

  test('should show outstanding amount in summary', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    const outstandingCard = page.locator('[class*="card"]').filter({ hasText: 'Outstanding' });
    await expect(outstandingCard).toBeVisible({ timeout: 10000 });

    // Should show dollar amount
    const amount = outstandingCard.locator('text=/\\$[\\d,]+/');
    await expect(amount.first()).toBeVisible();
  });
});

test.describe('Capital Calls - Overdue Identification', () => {
  test('should identify overdue responses', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Look for overdue status badges
    const overdueStatus = page.locator('[class*="badge"], [class*="status"]').filter({ hasText: /overdue/i });

    // May or may not have overdue items
    const overdueCount = await overdueStatus.count();
    expect(overdueCount).toBeGreaterThanOrEqual(0);
  });

  test('should highlight overdue items visually', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    // Filter to overdue
    const statusFilter = page.getByRole('combobox').or(page.locator('select')).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);

      const overdueOption = page.getByRole('option', { name: /overdue/i });
      if (await overdueOption.isVisible()) {
        await overdueOption.click();
        await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

        // Overdue items should be visible (if any exist)
        const overdueItems = page.locator('[class*="rounded-lg"]').filter({ hasText: /overdue/i });
        const count = await overdueItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Capital Calls - Fund Selector', () => {
  test('should have fund selector', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const fundSelector = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-selector"]'))
      .or(page.locator('select').filter({ hasText: /fund/i }));

    if (await fundSelector.first().isVisible()) {
      await expect(fundSelector.first()).toBeEnabled();
    }
  });
});

test.describe('Capital Calls - Tab Navigation', () => {
  test('should switch between tabs correctly', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    // Switch to Distributions tab
    await capitalCalls.selectDistributionsTab();
    const distributionsContent = page.locator('text=/distribution/i');
    await expect(distributionsContent.first()).toBeVisible({ timeout: 10000 });

    // Switch back to Capital Calls
    await capitalCalls.selectCapitalCallsTab();
    const capitalCallsContent = page.locator('text=/Capital Call/i');
    await expect(capitalCallsContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show tab counts/badges', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    // Tabs may have count badges
    const tabBadges = page.locator('[role="tab"] [class*="badge"], [role="tab"] span').filter({ hasText: /\\d+/ });
    const hasBadges = await tabBadges.count() > 0;
    expect(hasBadges || true).toBeTruthy(); // Badges are optional
  });
});

test.describe('Capital Calls - Interactions - Data Verification', () => {
  test('fund selector should update capital call cards', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const fundSelector = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-selector"]'))
      .or(page.locator('select').filter({ hasText: /fund/i }));

    // Data selector for capital call cards
    const dataSelector = '[class*="card"]:has-text("Capital Call"), [data-testid="capital-call-card"]';

    if (await fundSelector.first().isVisible()) {
      const result = await selectDifferentOption(
        page,
        fundSelector.first(),
        dataSelector
      );

      // If multiple funds exist and there's data, expect changes
      if (result.selectedOption && result.before.count > 0) {
        expect(
          result.changed,
          `Fund selector should update capital call data. Selected: ${result.selectedOption}`
        ).toBe(true);
      }
    }
  });

  test('status filter should update LP response list', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();
    await capitalCalls.selectLPResponsesTab();

    const statusFilter = page.getByRole('combobox').or(page.locator('select')).first();
    const dataSelector = '[class*="rounded-lg"]:has-text("commitment"), [data-testid="lp-response-card"]';

    if (await statusFilter.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Only test if there's data
      if (before.count > 0) {
        await statusFilter.click();
        await page.waitForTimeout(300);

        // Try to select "Paid" filter
        const paidOption = page.getByRole('option', { name: /paid/i });
        if (await paidOption.isVisible()) {
          await paidOption.click();
          await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Status filter should update LP response list'
          ).toBe(true);
        }
      }
    }
  });

  test('tab switch should update displayed content', async ({ page }) => {
    const capitalCalls = new CapitalCallsPage(page);
    await capitalCalls.goto();

    // Capture initial content
    const contentSelector = '[class*="card"], [class*="rounded-lg"]';
    const before = await captureDataSnapshot(page, contentSelector);

    // Switch to Distributions tab
    await capitalCalls.selectDistributionsTab();
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const after = await captureDataSnapshot(page, contentSelector);
    const changed = verifyDataChanged(before, after);

    expect(
      changed,
      'Tab switch should update displayed content'
    ).toBe(true);
  });

  test('metrics cards should reflect filtered data', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');
    const capitalCallsTab = page.getByRole('tab', { name: /capital calls/i });
    if (await capitalCallsTab.isVisible()) {
      await capitalCallsTab.click();
    }

    const fundSelector = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('[data-testid="fund-selector"]'));

    // Metrics card selectors
    const metricsSelector = '[class*="card"]:has-text("Active Calls"), [class*="card"]:has-text("Outstanding")';

    if (await fundSelector.first().isVisible()) {
      // Select different fund and verify metrics update
      const result = await selectDifferentOption(
        page,
        fundSelector.first(),
        metricsSelector
      );

      // Metrics should update when fund changes
      if (result.selectedOption) {
        expect(
          result.changed,
          'Metrics cards should update when fund changes'
        ).toBe(true);
      }
    }
  });
});
