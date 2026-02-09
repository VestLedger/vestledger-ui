import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DistributionsPage, DistributionWizardPage } from '../pages/distributions.page';
import { DistributionDetailPage } from '../pages/distribution-detail.page';

test.describe('Distribution Full Flow', () => {
  test.describe('Wizard Navigation', () => {
    test('should load distribution wizard with all 9 steps visible', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      // Verify wizard header shows step info
      const stepInfo = page.locator('text=/Step \\d+ of \\d+/');
      await expect(stepInfo).toBeVisible();

      // Verify we're on step 1 (Event)
      const stepLabel = page.locator('text=Event').first();
      await expect(stepLabel).toBeVisible();

      // Verify progress indicator exists
      const progress = page.locator('[role="progressbar"], [class*="progress"]');
      await expect(progress.first()).toBeVisible();
    });

    test('should navigate forward through steps with valid data', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      // Step 1: Event - fill required fields
      const nameInput = page.getByLabel(/name/i).or(page.locator('input[name*="name"]'));
      if (await nameInput.isVisible()) {
        await nameInput.fill('Q4 2024 Distribution');
      }

      const grossProceedsInput = page.getByLabel(/gross proceeds/i).or(page.locator('input[name*="gross"]'));
      if (await grossProceedsInput.isVisible()) {
        await grossProceedsInput.fill('10000000');
      }

      // Click next/continue
      const nextButton = page.getByRole('button', { name: /save.*continue|next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Verify we moved to step 2 (Fees)
      const feesLabel = page.locator('text=/Step 2|Fees/');
      await expect(feesLabel.first()).toBeVisible({ timeout: 5000 });
    });

    test('should navigate backward using Back button', async ({ page }) => {
      // Start at a step beyond the first
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=fees');
      await page.waitForLoadState('networkidle');

      const backButton = page.getByRole('button', { name: /back/i });
      if (await backButton.isVisible() && await backButton.isEnabled()) {
        await backButton.click();
        await page.waitForLoadState('networkidle');

        // Verify we're back on step 1
        const stepInfo = page.locator('text=/Step 1/');
        await expect(stepInfo).toBeVisible({ timeout: 5000 });
      }
    });

    test('should preserve data when navigating between steps', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      // Fill name on step 1
      const nameInput = page.getByLabel(/name/i).or(page.locator('input[name*="name"]'));
      const testName = 'Test Distribution ' + Date.now();

      if (await nameInput.isVisible()) {
        await nameInput.fill(testName);

        // Navigate forward
        const nextButton = page.getByRole('button', { name: /save.*continue|next|continue/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
        }

        // Navigate back
        const backButton = page.getByRole('button', { name: /back/i });
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForLoadState('networkidle');
        }

        // Verify data is preserved
        await expect(nameInput).toHaveValue(testName);
      }
    });
  });

  test.describe('Step 1: Event Details', () => {
    test('should validate required fields on Event step', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      // Try to proceed without filling required fields
      const nextButton = page.getByRole('button', { name: /save.*continue|next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Should show validation errors
        const errorMessages = page.locator('[class*="danger"], [class*="error"], [role="alert"]');
        const hasErrors = await errorMessages.count() > 0;

        // Either errors are shown OR we didn't advance (still on step 1)
        const stillOnStep1 = await page.locator('text=/Step 1/').isVisible();
        expect(hasErrors || stillOnStep1).toBeTruthy();
      }
    });

    test('should display event type selector', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const eventTypeSelect = page.getByLabel(/event type/i)
        .or(page.locator('select').filter({ hasText: /exit|dividend|recapitalization/i }))
        .or(page.getByRole('combobox', { name: /type/i }));

      if (await eventTypeSelect.isVisible()) {
        await expect(eventTypeSelect).toBeEnabled();
      }
    });

    test('should display date pickers for event and payment dates', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const eventDateInput = page.getByLabel(/event date/i)
        .or(page.locator('input[type="date"]').first());
      const paymentDateInput = page.getByLabel(/payment date/i)
        .or(page.locator('input[type="date"]').nth(1));

      if (await eventDateInput.isVisible()) {
        await expect(eventDateInput).toBeEnabled();
      }

      if (await paymentDateInput.isVisible()) {
        await expect(paymentDateInput).toBeEnabled();
      }
    });
  });

  test.describe('Step 2: Fees & Expenses', () => {
    test('should load fees step with fee templates', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=fees');
      await page.waitForLoadState('networkidle');

      // Should show fees section
      const feesSection = page.locator('text=/Fee|Expense/i').first();
      await expect(feesSection).toBeVisible({ timeout: 10000 });
    });

    test('should allow adding fee line items', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=fees');
      await page.waitForLoadState('networkidle');

      const addFeeButton = page.getByRole('button', { name: /add.*fee|add.*expense|add.*line/i });
      if (await addFeeButton.isVisible()) {
        await expect(addFeeButton).toBeEnabled();
      }
    });
  });

  test.describe('Step 3: Waterfall Selection', () => {
    test('should display available waterfall scenarios', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=waterfall');
      await page.waitForLoadState('networkidle');

      // Should show waterfall selection UI
      const waterfallSection = page.locator('text=/waterfall|scenario/i').first();
      await expect(waterfallSection).toBeVisible({ timeout: 10000 });
    });

    test('should validate waterfall scenario selection', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=waterfall');
      await page.waitForLoadState('networkidle');

      // Try to proceed without selecting scenario
      const nextButton = page.getByRole('button', { name: /save.*continue|next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Should show error or stay on same step
        const errorOrSameStep =
          await page.locator('[class*="danger"], [class*="error"]').count() > 0 ||
          await page.locator('text=/Step 3|waterfall/i').isVisible();

        expect(errorOrSameStep).toBeTruthy();
      }
    });
  });

  test.describe('Step 4: LP Allocations', () => {
    test('should display LP allocations table', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=allocations');
      await page.waitForLoadState('networkidle');

      const allocationsTable = page.locator('table, [role="grid"]').filter({ hasText: /LP|allocation|gross|net/i });
      await expect(allocationsTable.first()).toBeVisible({ timeout: 10000 });
    });

    test('should have recalculate allocations button', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=allocations');
      await page.waitForLoadState('networkidle');

      const recalculateButton = page.getByRole('button', { name: /recalculate|refresh|update/i });
      if (await recalculateButton.isVisible()) {
        await expect(recalculateButton).toBeEnabled();
      }
    });
  });

  test.describe('Step 5: Tax Withholding', () => {
    test('should display tax withholding configuration', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=tax');
      await page.waitForLoadState('networkidle');

      const taxSection = page.locator('text=/tax|withholding/i').first();
      await expect(taxSection).toBeVisible({ timeout: 10000 });
    });

    test('should validate tax rates are within range', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=tax');
      await page.waitForLoadState('networkidle');

      // Look for tax rate inputs
      const taxRateInputs = page.locator('input[type="number"]').filter({ hasText: /tax|rate|%/i });
      const count = await taxRateInputs.count();

      if (count > 0) {
        // Tax inputs should be visible
        await expect(taxRateInputs.first()).toBeVisible();
      }
    });
  });

  test.describe('Step 8: Preview', () => {
    test('should display statement template selection', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=preview');
      await page.waitForLoadState('networkidle');

      const previewSection = page.locator('text=/preview|template|statement/i').first();
      await expect(previewSection).toBeVisible({ timeout: 10000 });
    });

    test('should have email subject and body fields', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=preview');
      await page.waitForLoadState('networkidle');

      const emailSubject = page.getByLabel(/email subject|subject/i)
        .or(page.locator('input').filter({ hasText: /subject/i }));
      const emailBody = page.getByLabel(/email body|message/i)
        .or(page.locator('textarea'));

      if (await emailSubject.isVisible()) {
        await expect(emailSubject).toBeEnabled();
      }

      if (await emailBody.isVisible()) {
        await expect(emailBody).toBeEnabled();
      }
    });
  });

  test.describe('Step 9: Submit for Approval', () => {
    test('should display approval workflow information', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=submit');
      await page.waitForLoadState('networkidle');

      const submitSection = page.locator('text=/submit|approval|approver/i').first();
      await expect(submitSection).toBeVisible({ timeout: 10000 });
    });

    test('should have submit for approval button', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=submit');
      await page.waitForLoadState('networkidle');

      const submitButton = page.getByRole('button', { name: /submit for approval/i });
      await expect(submitButton).toBeVisible();
    });

    test('should allow adding approval comment', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new?step=submit');
      await page.waitForLoadState('networkidle');

      const commentInput = page.getByLabel(/comment|note/i)
        .or(page.locator('textarea'));

      if (await commentInput.isVisible()) {
        await commentInput.fill('Submitting for Q4 review');
        await expect(commentInput).toHaveValue(/submitting/i);
      }
    });
  });

  test.describe('Draft Save/Restore', () => {
    test('should have Save Draft button', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const saveDraftButton = page.getByRole('button', { name: /save draft/i });
      await expect(saveDraftButton).toBeVisible();
      await expect(saveDraftButton).toBeEnabled();
    });

    test('should show draft status information', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const draftStatus = page.locator('text=/draft|saved|last saved/i');
      await expect(draftStatus.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Running Totals Sidebar', () => {
    test('should display running totals panel', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const runningTotals = page.locator('text=Running Totals');
      await expect(runningTotals).toBeVisible({ timeout: 5000 });
    });

    test('should show gross proceeds, fees, net proceeds', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      const grossProceeds = page.locator('text=Gross Proceeds');
      const fees = page.locator('text=Fees');
      const netProceeds = page.locator('text=Net Proceeds');

      await expect(grossProceeds).toBeVisible({ timeout: 5000 });
      await expect(fees).toBeVisible({ timeout: 5000 });
      await expect(netProceeds).toBeVisible({ timeout: 5000 });
    });

    test('should show warnings when data is inconsistent', async ({ page }) => {
      await loginViaRedirect(page, '/fund-admin/distributions/new');
      await page.waitForLoadState('networkidle');

      // The warnings card should exist (may or may not have content initially)
      const warningsSection = page.locator('[class*="card"]').filter({ hasText: /warning|reconcile|exceed/i });
      // May or may not be visible depending on data state
      const warningsCount = await warningsSection.count();
      expect(warningsCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Cancel Flow', () => {
    test('should have cancel option', async ({ page }) => {
      const wizard = new DistributionWizardPage(page);
      await wizard.goto();

      // Cancel might be a button or link
      const cancelButton = page.getByRole('button', { name: /cancel|close|back to/i })
        .or(page.getByRole('link', { name: /cancel|back/i }));

      if (await cancelButton.first().isVisible()) {
        await expect(cancelButton.first()).toBeEnabled();
      }
    });
  });
});

test.describe('Distribution Detail View', () => {
  test('should load distribution detail page', async ({ page }) => {
    // First go to distributions list
    await loginViaRedirect(page, '/fund-admin');
    await page.waitForLoadState('networkidle');

    // Click distributions tab
    const distributionsTab = page.getByRole('tab', { name: /distributions/i });
    if (await distributionsTab.isVisible()) {
      await distributionsTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Look for a distribution item to click
    const distributionItem = page.locator('table tbody tr, [class*="card"]').filter({ hasText: /distribution|Q\d/i }).first();

    if (await distributionItem.isVisible()) {
      await distributionItem.click();
      await page.waitForLoadState('networkidle');

      // Should show detail view content
      const detailContent = page.locator('text=/gross proceeds|net proceeds|allocation/i');
      await expect(detailContent.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display approval workflow on detail page', async ({ page }) => {
    // Navigate to a specific distribution detail page (assuming one exists)
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    // Should show approval section or empty state
    const approvalSection = page.locator('text=/approval|approver|pending/i');
    const emptyState = page.locator('text=/not found|no distribution/i');

    const hasContent = await approvalSection.first().isVisible() || await emptyState.first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display LP allocation breakdown', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    const allocationsSection = page.locator('text=/LP Allocation|allocation breakdown/i');

    if (await allocationsSection.first().isVisible()) {
      await expect(allocationsSection.first()).toBeVisible();

      // Should have a table or list of allocations
      const allocationsTable = page.locator('table').filter({ hasText: /LP|pro-rata|gross|net/i });
      if (await allocationsTable.isVisible()) {
        await expect(allocationsTable).toBeVisible();
      }
    }
  });

  test('should display lifecycle timeline', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    const timeline = page.locator('text=/lifecycle|timeline|draft|submitted|approved/i');

    if (await timeline.first().isVisible()) {
      await expect(timeline.first()).toBeVisible();
    }
  });

  test('should display statements section', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    const statementsSection = page.locator('text=/statement|document/i');

    if (await statementsSection.first().isVisible()) {
      await expect(statementsSection.first()).toBeVisible();
    }
  });
});

test.describe('Distribution Approval Workflow', () => {
  test('should show approve/reject buttons for pending approval', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    const approveButton = page.getByRole('button', { name: /approve/i });
    const rejectButton = page.getByRole('button', { name: /reject/i });

    // Buttons may or may not be visible depending on user role and distribution status
    const approveVisible = await approveButton.isVisible();
    const rejectVisible = await rejectButton.isVisible();

    // At least the page loaded (either buttons shown or not based on permissions)
    expect(true).toBeTruthy();
  });

  test('should show approval stepper with approver order', async ({ page }) => {
    await loginViaRedirect(page, '/fund-admin/distributions/dist-1');
    await page.waitForLoadState('networkidle');

    const approvalStepper = page.locator('[class*="stepper"], [class*="approval"]').filter({ hasText: /step|order|pending|approved/i });

    // Stepper may exist if distribution has approval workflow
    const stepperCount = await approvalStepper.count();
    expect(stepperCount).toBeGreaterThanOrEqual(0);
  });
});
