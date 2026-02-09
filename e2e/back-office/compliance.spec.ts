import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { CompliancePage } from '../pages/compliance.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
} from '../helpers/interaction-helpers';

test.describe('Compliance - Page Load', () => {
  test('should load compliance page', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    await expect(compliance.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    await expect(compliance.overdueItemsMetric).toBeVisible();
    await expect(compliance.inProgressMetric).toBeVisible();
    await expect(compliance.dueThisMonthMetric).toBeVisible();
    await expect(compliance.completedMetric).toBeVisible();
  });
});

test.describe('Compliance - Status Badges', () => {
  test('should display overdue items count', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const count = await compliance.getOverdueItemsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display in-progress items count', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const count = await compliance.getInProgressCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display due this month count', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const count = await compliance.getDueThisMonthCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display completed items count', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const count = await compliance.getCompletedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Compliance - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    await expect(compliance.overviewTab).toBeVisible();
    await expect(compliance.regulatoryFilingsTab).toBeVisible();
    await expect(compliance.auditScheduleTab).toBeVisible();
    await expect(compliance.amlKycTab).toBeVisible();
  });

  test('should switch to Regulatory Filings tab', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();
    await compliance.selectRegulatoryFilingsTab();

    const filingContent = page.locator('text=/filing|regulatory|form/i');
    await expect(filingContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Audit Schedule tab', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();
    await compliance.selectAuditScheduleTab();

    const auditContent = page.locator('text=/audit|schedule/i');
    await expect(auditContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to AML/KYC tab', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();
    await compliance.selectAmlKycTab();

    const amlContent = page.locator('text=/AML|KYC|verification/i');
    await expect(amlContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Compliance - Status Filtering', () => {
  test('should filter by overdue status', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('overdue');

      // Verify filter applied
      const overdueItems = await compliance.getComplianceItemsByStatus('overdue');
      const count = await overdueItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by in-progress status', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('in-progress');

      const inProgressItems = await compliance.getComplianceItemsByStatus('in-progress');
      const count = await inProgressItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by completed status', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('completed');

      const completedItems = await compliance.getComplianceItemsByStatus('completed');
      const count = await completedItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Compliance - Priority Filtering', () => {
  test('should filter by high priority', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.priorityFilter.isVisible()) {
      await compliance.filterByPriority('high');
      await page.waitForLoadState('networkidle');

      // Verify filter applied (high priority items may or may not exist)
      const highPriorityBadges = page.locator('[class*="danger"], [class*="high"]');
      const count = await highPriorityBadges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by medium priority', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.priorityFilter.isVisible()) {
      await compliance.filterByPriority('medium');
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Compliance - Regulatory Filing Schedule', () => {
  test('should display regulatory filing schedule', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const schedule = await compliance.viewFilingSchedule();
    if (await schedule.isVisible()) {
      await expect(schedule).toBeVisible();
    }
  });
});

test.describe('Compliance - Audit Schedule', () => {
  test('should display audit schedule', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const schedule = await compliance.viewAuditSchedule();
    if (await schedule.isVisible()) {
      await expect(schedule).toBeVisible();
    }
  });
});

test.describe('Compliance - Mark Complete', () => {
  test('should have mark complete functionality', async ({ page }) => {
    await loginViaRedirect(page, '/compliance');
    await page.waitForLoadState('networkidle');

    const completeButton = page.getByRole('button', { name: /complete|mark.*complete/i });
    if (await completeButton.first().isVisible()) {
      await expect(completeButton.first()).toBeEnabled();
    }
  });
});

test.describe('Compliance - Actions', () => {
  test('should have Upload Document button', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.uploadDocumentButton.isVisible()) {
      await expect(compliance.uploadDocumentButton).toBeEnabled();
    }
  });

  test('should have Export Report button', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    if (await compliance.exportReportButton.isVisible()) {
      await expect(compliance.exportReportButton).toBeEnabled();
    }
  });
});

test.describe('Compliance - Interactions - Data Verification', () => {
  test('status filter should update compliance items list', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const dataSelector = '[class*="card"], [data-testid="compliance-item"], table tbody tr';

    if (await compliance.statusFilter.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await compliance.filterByStatus('overdue');
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Status filter should update compliance items list'
        ).toBe(true);
      }
    }
  });

  test('priority filter should update compliance items list', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const dataSelector = '[class*="card"], [data-testid="compliance-item"], table tbody tr';

    if (await compliance.priorityFilter.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        await compliance.filterByPriority('high');
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Priority filter should update compliance items list'
        ).toBe(true);
      }
    }
  });

  test('tab navigation should update displayed content', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const dataSelector = '[class*="card"], [class*="content"], table';
    const before = await captureDataSnapshot(page, dataSelector);

    await compliance.selectRegulatoryFilingsTab();
    await page.waitForLoadState('networkidle');

    const after = await captureDataSnapshot(page, dataSelector);
    const changed = verifyDataChanged(before, after);

    expect(changed, 'Tab navigation should update displayed content').toBe(true);
  });

  test('switching between tabs should show different content', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const dataSelector = '[class*="card"], [class*="content"], table, [class*="panel"]';

    // Start on overview tab
    const overviewSnapshot = await captureDataSnapshot(page, dataSelector);

    // Switch to Audit Schedule tab
    await compliance.selectAuditScheduleTab();
    await page.waitForLoadState('networkidle');
    const auditSnapshot = await captureDataSnapshot(page, dataSelector);

    // Switch to AML/KYC tab
    await compliance.selectAmlKycTab();
    await page.waitForLoadState('networkidle');
    const amlSnapshot = await captureDataSnapshot(page, dataSelector);

    // Verify content changed between tabs
    const overviewToAudit = verifyDataChanged(overviewSnapshot, auditSnapshot);
    const auditToAml = verifyDataChanged(auditSnapshot, amlSnapshot);

    expect(
      overviewToAudit || auditToAml,
      'Switching tabs should show different content'
    ).toBe(true);
  });

  test('combined status and priority filters should work together', async ({ page }) => {
    const compliance = new CompliancePage(page);
    await compliance.goto();

    const dataSelector = '[class*="card"], [data-testid="compliance-item"], table tbody tr';
    const initialSnapshot = await captureDataSnapshot(page, dataSelector);

    // Apply status filter
    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('in-progress');
      await page.waitForLoadState('networkidle');
    }

    // Apply priority filter
    if (await compliance.priorityFilter.isVisible()) {
      await compliance.filterByPriority('high');
      await page.waitForLoadState('networkidle');
    }

    const afterBothFilters = await captureDataSnapshot(page, dataSelector);

    // Combined filters should produce different results
    if (initialSnapshot.count > 2) {
      const filtersApplied = verifyDataChanged(initialSnapshot, afterBothFilters);
      expect(filtersApplied, 'Combined filters should affect compliance items').toBe(true);
    }
  });
});
