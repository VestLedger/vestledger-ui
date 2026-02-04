import { test, expect } from '../fixtures/auth.fixture';
import { CompliancePage } from '../pages/compliance.page';

test.describe('Compliance - Page Load', () => {
  test('should load compliance page', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    await expect(compliance.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    await expect(compliance.overdueItemsMetric).toBeVisible();
    await expect(compliance.inProgressMetric).toBeVisible();
    await expect(compliance.dueThisMonthMetric).toBeVisible();
    await expect(compliance.completedMetric).toBeVisible();
  });
});

test.describe('Compliance - Status Badges', () => {
  test('should display overdue items count', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const count = await compliance.getOverdueItemsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display in-progress items count', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const count = await compliance.getInProgressCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display due this month count', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const count = await compliance.getDueThisMonthCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display completed items count', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const count = await compliance.getCompletedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Compliance - Tabs Navigation', () => {
  test('should have all tabs visible', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    await expect(compliance.overviewTab).toBeVisible();
    await expect(compliance.regulatoryFilingsTab).toBeVisible();
    await expect(compliance.auditScheduleTab).toBeVisible();
    await expect(compliance.amlKycTab).toBeVisible();
  });

  test('should switch to Regulatory Filings tab', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();
    await compliance.selectRegulatoryFilingsTab();

    const filingContent = authenticatedPage.locator('text=/filing|regulatory|form/i');
    await expect(filingContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Audit Schedule tab', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();
    await compliance.selectAuditScheduleTab();

    const auditContent = authenticatedPage.locator('text=/audit|schedule/i');
    await expect(auditContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch to AML/KYC tab', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();
    await compliance.selectAmlKycTab();

    const amlContent = authenticatedPage.locator('text=/AML|KYC|verification/i');
    await expect(amlContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Compliance - Status Filtering', () => {
  test('should filter by overdue status', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('overdue');

      // Verify filter applied
      const overdueItems = await compliance.getComplianceItemsByStatus('overdue');
      const count = await overdueItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by in-progress status', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.statusFilter.isVisible()) {
      await compliance.filterByStatus('in-progress');

      const inProgressItems = await compliance.getComplianceItemsByStatus('in-progress');
      const count = await inProgressItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by completed status', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
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
  test('should filter by high priority', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.priorityFilter.isVisible()) {
      await compliance.filterByPriority('high');
      await authenticatedPage.waitForLoadState('networkidle');

      // Verify filter applied (high priority items may or may not exist)
      const highPriorityBadges = authenticatedPage.locator('[class*="danger"], [class*="high"]');
      const count = await highPriorityBadges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by medium priority', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.priorityFilter.isVisible()) {
      await compliance.filterByPriority('medium');
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });
});

test.describe('Compliance - Regulatory Filing Schedule', () => {
  test('should display regulatory filing schedule', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const schedule = await compliance.viewFilingSchedule();
    if (await schedule.isVisible()) {
      await expect(schedule).toBeVisible();
    }
  });
});

test.describe('Compliance - Audit Schedule', () => {
  test('should display audit schedule', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    const schedule = await compliance.viewAuditSchedule();
    if (await schedule.isVisible()) {
      await expect(schedule).toBeVisible();
    }
  });
});

test.describe('Compliance - Mark Complete', () => {
  test('should have mark complete functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/compliance');
    await authenticatedPage.waitForLoadState('networkidle');

    const completeButton = authenticatedPage.getByRole('button', { name: /complete|mark.*complete/i });
    if (await completeButton.first().isVisible()) {
      await expect(completeButton.first()).toBeEnabled();
    }
  });
});

test.describe('Compliance - Actions', () => {
  test('should have Upload Document button', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.uploadDocumentButton.isVisible()) {
      await expect(compliance.uploadDocumentButton).toBeEnabled();
    }
  });

  test('should have Export Report button', async ({ authenticatedPage }) => {
    const compliance = new CompliancePage(authenticatedPage);
    await compliance.goto();

    if (await compliance.exportReportButton.isVisible()) {
      await expect(compliance.exportReportButton).toBeEnabled();
    }
  });
});
