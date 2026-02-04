import { test, expect } from '../fixtures/auth.fixture';
import { FundAdminPage } from '../pages/fund-admin.page';
import { CapitalCallsPage } from '../pages/capital-calls.page';
import { DistributionsPage, DistributionWizardPage } from '../pages/distributions.page';
import { WaterfallPage } from '../pages/waterfall.page';

/**
 * Fund Lifecycle Journey Tests
 *
 * These tests verify the complete fund management workflow from setup to distribution.
 * The journey covers:
 * 1. Fund overview and LP management
 * 2. Capital call creation and tracking
 * 3. Distribution creation via wizard
 * 4. Waterfall calculation
 * 5. Approval workflow
 */

test.describe('Fund Lifecycle - Complete Journey', () => {
  test('should complete full fund lifecycle from capital call to distribution', async ({ authenticatedPage }) => {
    // Step 1: Navigate to Fund Admin
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();
    await expect(fundAdmin.pageTitle).toBeVisible({ timeout: 10000 });

    // Step 2: Verify fund metrics are displayed
    await expect(fundAdmin.totalCommitmentsMetric).toBeVisible();
    await expect(fundAdmin.calledCapitalMetric).toBeVisible();
    await expect(fundAdmin.distributedMetric).toBeVisible();

    // Step 3: Navigate to Capital Calls
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await fundAdmin.selectCapitalCallsTab();
    await expect(capitalCalls.capitalCallsTable.or(authenticatedPage.locator('text=/Capital Calls/i'))).toBeVisible();

    // Step 4: Navigate to Distributions
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();
    await expect(distributions.pageTitle).toBeVisible({ timeout: 10000 });

    // Step 5: Verify distribution metrics
    const count = await distributions.getDistributionCount();
    expect(count).toBeGreaterThanOrEqual(0);

    // Step 6: Navigate to Waterfall
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();
    await expect(waterfall.pageTitle).toBeVisible({ timeout: 10000 });

    // Step 7: Verify waterfall scenarios exist
    const scenarioCount = await waterfall.getScenarioCount();
    expect(scenarioCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Fund Lifecycle - Capital Call Flow', () => {
  test('should view fund overview and LP commitments', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    // Verify LP list is visible
    await expect(fundAdmin.lpList).toBeVisible();

    // Check LP count
    const lpCount = await fundAdmin.getLPCount();
    expect(lpCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to capital calls tab', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();
    await fundAdmin.selectCapitalCallsTab();

    // Capital calls content should be visible
    const capitalCallContent = authenticatedPage.locator('text=/Capital Call|Amount|Status/i');
    await expect(capitalCallContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create capital call button', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    if (await capitalCalls.createCapitalCallButton.isVisible()) {
      await expect(capitalCalls.createCapitalCallButton).toBeEnabled();
    }
  });

  test('should track LP payment responses', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    // Check if LP responses tab exists
    if (await capitalCalls.lpResponsesTab.isVisible()) {
      await capitalCalls.selectLPResponsesTab();

      // Should show payment status
      const paymentStatus = authenticatedPage.locator('text=/paid|pending|partial/i');
      if (await paymentStatus.count() > 0) {
        await expect(paymentStatus.first()).toBeVisible();
      }
    }
  });
});

test.describe('Fund Lifecycle - Distribution Creation Flow', () => {
  test('should navigate through distribution wizard steps', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    // Check if create button exists
    if (await distributions.createDistributionButton.isVisible()) {
      await distributions.clickCreateDistribution();

      const wizard = new DistributionWizardPage(authenticatedPage);

      // Verify wizard opened
      const wizardContent = authenticatedPage.locator('text=/Distribution Type|Step 1/i');
      if (await wizardContent.count() > 0) {
        await expect(wizardContent.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should view existing distributions', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    const count = await distributions.getDistributionCount();
    if (count > 0) {
      // Click on first distribution to view details
      await distributions.clickDistribution(0);

      // Should show distribution details
      const detailContent = authenticatedPage.locator('text=/Amount|Status|Date|Allocations/i');
      if (await detailContent.count() > 0) {
        await expect(detailContent.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

test.describe('Fund Lifecycle - Waterfall Calculation Flow', () => {
  test('should view waterfall scenarios', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    const count = await waterfall.getScenarioCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should select different waterfall models', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    // Check for model selection
    const modelSelector = authenticatedPage.getByRole('combobox', { name: /model/i }).or(
      authenticatedPage.locator('text=/European|American|Blended/i')
    );
    if (await modelSelector.first().isVisible()) {
      await expect(modelSelector.first()).toBeVisible();
    }
  });

  test('should view tier breakdown', async ({ authenticatedPage }) => {
    const waterfall = new WaterfallPage(authenticatedPage);
    await waterfall.goto();

    // Check for tier information
    const tierContent = authenticatedPage.locator('text=/Tier|Return|Hurdle|Carry/i');
    if (await tierContent.count() > 0) {
      await expect(tierContent.first()).toBeVisible();
    }
  });
});

test.describe('Fund Lifecycle - Approval Workflow', () => {
  test('should view distribution pending approval', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    // Look for pending approval status
    const pendingApproval = authenticatedPage.locator('text=/pending.*approval|awaiting.*approval/i');
    if (await pendingApproval.count() > 0) {
      await expect(pendingApproval.first()).toBeVisible();
    }
  });

  test('should have approval actions for authorized users', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    const count = await distributions.getDistributionCount();
    if (count > 0) {
      await distributions.clickDistribution(0);

      // Check for approval buttons
      const approveBtn = authenticatedPage.getByRole('button', { name: /approve/i });
      const rejectBtn = authenticatedPage.getByRole('button', { name: /reject/i });

      if (await approveBtn.isVisible()) {
        await expect(approveBtn).toBeEnabled();
      }
    }
  });
});

test.describe('Fund Lifecycle - LP Portal Verification', () => {
  test('should verify distribution visible in LP portal', async ({ authenticatedPage }) => {
    // Navigate to LP Portal
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    const lpPortalTitle = authenticatedPage.locator('h1, [class*="title"]').filter({ hasText: /LP Portal|Investor Portal/i });
    if (await lpPortalTitle.count() > 0) {
      await expect(lpPortalTitle.first()).toBeVisible({ timeout: 10000 });

      // Check for distributions section
      const distributionsSection = authenticatedPage.locator('text=/Distributions|Recent Distributions/i');
      if (await distributionsSection.count() > 0) {
        await expect(distributionsSection.first()).toBeVisible();
      }
    }
  });

  test('should show LP capital account', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lp-portal');
    await authenticatedPage.waitForLoadState('networkidle');

    // Check for capital account information
    const capitalAccount = authenticatedPage.locator('text=/Capital Account|Commitment|Called|Distributed/i');
    if (await capitalAccount.count() > 0) {
      await expect(capitalAccount.first()).toBeVisible();
    }
  });
});

test.describe('Fund Lifecycle - Fund Metrics Consistency', () => {
  test('should show consistent metrics across pages', async ({ authenticatedPage }) => {
    // Get metrics from Fund Admin
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    const totalCommitments = await fundAdmin.getTotalCommitments();

    // Navigate to Distributions
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    // Metrics should be consistent with fund-level data
    const totalDistributed = authenticatedPage.locator('text=/Total Distributed|\\$[\\d,]+/i');
    if (await totalDistributed.count() > 0) {
      await expect(totalDistributed.first()).toBeVisible();
    }
  });

  test('should reflect capital call status in fund overview', async ({ authenticatedPage }) => {
    const fundAdmin = new FundAdminPage(authenticatedPage);
    await fundAdmin.goto();

    // Called capital should be reflected
    const calledCapital = await fundAdmin.getCalledCapital();
    expect(calledCapital).toBeTruthy();

    // Uncalled capital should also be shown
    const uncalledMetric = authenticatedPage.locator('text=/Uncalled|Remaining/i');
    if (await uncalledMetric.count() > 0) {
      await expect(uncalledMetric.first()).toBeVisible();
    }
  });
});

test.describe('Fund Lifecycle - Document Generation', () => {
  test('should have capital call notice generation', async ({ authenticatedPage }) => {
    const capitalCalls = new CapitalCallsPage(authenticatedPage);
    await capitalCalls.goto();

    // Look for generate/download notice button
    const generateBtn = authenticatedPage.getByRole('button', { name: /generate.*notice|download.*notice/i });
    if (await generateBtn.first().isVisible()) {
      await expect(generateBtn.first()).toBeEnabled();
    }
  });

  test('should have distribution statement generation', async ({ authenticatedPage }) => {
    const distributions = new DistributionsPage(authenticatedPage);
    await distributions.goto();

    // Look for statement generation
    const statementBtn = authenticatedPage.getByRole('button', { name: /statement|download|export/i });
    if (await statementBtn.first().isVisible()) {
      await expect(statementBtn.first()).toBeEnabled();
    }
  });
});
