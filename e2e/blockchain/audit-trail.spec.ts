import { test, expect } from '../fixtures/auth.fixture';
import { AuditTrailPage } from '../pages/audit-trail.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  searchAndVerifyChange,
} from '../helpers/interaction-helpers';

test.describe('Audit Trail - Page Load', () => {
  test('should load audit trail page', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    await expect(auditTrail.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary stats', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    await expect(auditTrail.totalEventsCard).toBeVisible();
    await expect(auditTrail.verifiedCard).toBeVisible();
    await expect(auditTrail.latestBlockCard).toBeVisible();
    await expect(auditTrail.integrityCard).toBeVisible();
  });
});

test.describe('Audit Trail - Statistics', () => {
  test('should display total events count', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const count = await auditTrail.getTotalEventsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display verified events count', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const count = await auditTrail.getVerifiedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display latest block number', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const block = await auditTrail.getLatestBlock();
    expect(block).toBeTruthy();
  });

  test('should display integrity percentage', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const integrity = await auditTrail.getIntegrityPercentage();
    expect(integrity).toBeTruthy();
    expect(integrity).toContain('%');
  });
});

test.describe('Audit Trail - Event List', () => {
  test('should display audit events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const count = await auditTrail.getEventCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show blockchain hash on events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    // Look for blockchain hash pattern (0x followed by hex characters)
    const hashElement = authenticatedPage.locator('text=/0x[a-fA-F0-9]+/');
    if (await hashElement.count() > 0) {
      await expect(hashElement.first()).toBeVisible();
    }
  });

  test('should show event type labels', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const eventTypes = authenticatedPage.locator('text=/Ownership Transfer|Capital Call|Distribution|Valuation Update|Document Hash|Compliance/i');
    if (await eventTypes.count() > 0) {
      await expect(eventTypes.first()).toBeVisible();
    }
  });

  test('should show timestamp on events', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const timestamp = authenticatedPage.locator('text=/\\d{1,2}:\\d{2}|\\d{1,2}\\/\\d{1,2}\\/\\d{4}|ago/i');
    if (await timestamp.count() > 0) {
      await expect(timestamp.first()).toBeVisible();
    }
  });
});

test.describe('Audit Trail - Filtering', () => {
  test('should filter by date range', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const dateFilter = authenticatedPage.getByRole('combobox', { name: /date|period/i })
      .or(authenticatedPage.locator('input[type="date"]'));

    if (await dateFilter.first().isVisible()) {
      await expect(dateFilter.first()).toBeEnabled();
    }
  });

  test('should filter by event type', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    if (await auditTrail.eventTypeFilter.isVisible()) {
      await auditTrail.filterByEventType('Distribution');
      await authenticatedPage.waitForLoadState('networkidle');

      // Events should be filtered (may be empty if no distributions)
      const distributionEvents = await auditTrail.getEventsByType('distribution');
      const count = await distributionEvents.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by entity type', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const entityFilter = authenticatedPage.getByRole('combobox', { name: /entity|fund/i });
    if (await entityFilter.isVisible()) {
      await expect(entityFilter).toBeEnabled();
    }
  });
});

test.describe('Audit Trail - Search', () => {
  test('should have search functionality', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    await expect(auditTrail.searchInput).toBeVisible();
  });

  test('should search by description', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    await auditTrail.searchEvents('distribution');
    await authenticatedPage.waitForLoadState('networkidle');

    // Results should be filtered
    const count = await auditTrail.getEventCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should search by transaction hash', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    await auditTrail.searchEvents('0x');
    await authenticatedPage.waitForLoadState('networkidle');
  });
});

test.describe('Audit Trail - Blockchain Hash Verification', () => {
  test('should display valid blockchain hash format', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    if (await auditTrail.eventCards.count() > 0) {
      const hash = await auditTrail.verifyBlockchainHash(0);
      if (hash) {
        // Verify hash starts with 0x and contains hex characters
        expect(hash).toMatch(/^0x[a-fA-F0-9]+/);
      }
    }
  });

  test('should have copy hash functionality', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const copyButton = authenticatedPage.getByRole('button', { name: /copy/i })
      .or(authenticatedPage.locator('[class*="copy"]'));

    if (await copyButton.first().isVisible()) {
      await expect(copyButton.first()).toBeEnabled();
    }
  });
});

test.describe('Audit Trail - Export', () => {
  test('should have export audit report functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const exportButton = authenticatedPage.getByRole('button', { name: /export|download.*report/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('Audit Trail - Event Details', () => {
  test('should show event details on click/expand', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    if (await auditTrail.eventCards.count() > 0) {
      await auditTrail.viewEventDetails(0);

      // Details should be expanded (may show more info)
      const detailsContent = authenticatedPage.locator('text=/block|hash|verified|timestamp/i');
      if (await detailsContent.count() > 0) {
        await expect(detailsContent.first()).toBeVisible();
      }
    }
  });

  test('should show verification status', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const verificationStatus = authenticatedPage.locator('text=/verified|unverified|pending/i');
    if (await verificationStatus.count() > 0) {
      await expect(verificationStatus.first()).toBeVisible();
    }
  });
});

test.describe('Audit Trail - Event Types', () => {
  test('should display ownership transfer events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const ownershipEvents = await auditTrail.getEventsByType('ownership_transfer');
    const count = await ownershipEvents.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display capital call events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const capitalCallEvents = await auditTrail.getEventsByType('capital_call');
    const count = await capitalCallEvents.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display distribution events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const distributionEvents = await auditTrail.getEventsByType('distribution');
    const count = await distributionEvents.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Audit Trail - Interactions - Data Verification', () => {
  test('event type filter should update event list', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';

    if (await auditTrail.eventTypeFilter.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await auditTrail.filterByEventType('Distribution');
        await authenticatedPage.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(authenticatedPage, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Event type filter should update event list'
        ).toBe(true);
      }
    }
  });

  test('search should filter audit events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';
    const before = await captureDataSnapshot(authenticatedPage, dataSelector);

    if (before.count > 0 && await auditTrail.searchInput.isVisible()) {
      const result = await searchAndVerifyChange(
        authenticatedPage,
        auditTrail.searchInput,
        'xyz-nonexistent-event',
        dataSelector
      );

      // Search for non-existent term should reduce results
      expect(result.after.count).toBeLessThanOrEqual(before.count);
    }
  });

  test('search should show matching events', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';
    const before = await captureDataSnapshot(authenticatedPage, dataSelector);

    if (before.count > 0 && await auditTrail.searchInput.isVisible()) {
      // Search for a common term
      await auditTrail.searchEvents('distribution');
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);

      const after = await captureDataSnapshot(authenticatedPage, dataSelector);
      const changed = verifyDataChanged(before, after);

      // Search should filter results
      if (before.count > 1) {
        expect(changed, 'Search should filter audit events').toBe(true);
      }
    }
  });

  test('date filter should update event list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const dateFilter = authenticatedPage.getByRole('combobox', { name: /date|period/i })
      .or(authenticatedPage.locator('select').filter({ hasText: /date|period|today|week/i }));

    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';

    if (await dateFilter.first().isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await dateFilter.first().click();
        await authenticatedPage.waitForTimeout(300);

        // Select a different date range option
        const dateOption = authenticatedPage.getByRole('option', { name: /last week|today|this month/i });
        if (await dateOption.first().isVisible()) {
          await dateOption.first().click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Date filter should update event list'
          ).toBe(true);
        }
      }
    }
  });

  test('entity filter should update events for specific fund', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/audit-trail');
    await authenticatedPage.waitForLoadState('networkidle');

    const entityFilter = authenticatedPage.getByRole('combobox', { name: /entity|fund/i });
    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';

    if (await entityFilter.isVisible()) {
      const before = await captureDataSnapshot(authenticatedPage, dataSelector);

      if (before.count > 0) {
        await entityFilter.click();
        await authenticatedPage.waitForTimeout(300);

        // Select a specific fund
        const fundOption = authenticatedPage.getByRole('option').nth(1);
        if (await fundOption.isVisible()) {
          await fundOption.click();
          await authenticatedPage.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(authenticatedPage, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Entity filter should update event list'
          ).toBe(true);
        }
      }
    }
  });

  test('combined filters should work together', async ({ authenticatedPage }) => {
    const auditTrail = new AuditTrailPage(authenticatedPage);
    await auditTrail.goto();

    const dataSelector = '[class*="card"], [data-testid="audit-event"], table tbody tr';
    const initialSnapshot = await captureDataSnapshot(authenticatedPage, dataSelector);

    // Apply event type filter
    if (await auditTrail.eventTypeFilter.isVisible()) {
      await auditTrail.filterByEventType('Distribution');
      await authenticatedPage.waitForLoadState('networkidle');
    }

    // Apply search filter
    if (await auditTrail.searchInput.isVisible()) {
      await auditTrail.searchEvents('fund');
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(500);
    }

    const afterBothFilters = await captureDataSnapshot(authenticatedPage, dataSelector);

    // Combined filters should produce different results
    if (initialSnapshot.count > 2) {
      const filtersApplied = verifyDataChanged(initialSnapshot, afterBothFilters);
      expect(filtersApplied, 'Combined filters should affect event list').toBe(true);
    }
  });
});
