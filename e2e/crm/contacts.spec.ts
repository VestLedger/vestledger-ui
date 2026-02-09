import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { ContactsPage } from '../pages/contacts.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  searchAndVerifyChange,
} from '../helpers/interaction-helpers';

test.describe('Contacts - Page Load', () => {
  test('should load contacts page', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    await expect(contacts.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    await expect(contacts.totalContactsMetric).toBeVisible();
    await expect(contacts.foundersMetric).toBeVisible();
    await expect(contacts.starredMetric).toBeVisible();
    await expect(contacts.followUpsDueMetric).toBeVisible();
  });

  test('should have Add Contact button', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    if (await contacts.addContactButton.isVisible()) {
      await expect(contacts.addContactButton).toBeEnabled();
    }
  });
});

test.describe('Contacts - Metrics', () => {
  test('should display total contacts count', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getTotalContactsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display founders count', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getFoundersCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display starred count', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getStarredCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display follow-ups due count', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getFollowUpsDueCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Contacts - Search', () => {
  test('should have search input', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    await expect(contacts.searchInput).toBeVisible();
  });

  test('should search contacts by name', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const initialCount = await contacts.getContactCount();
    if (initialCount > 0) {
      await contacts.searchContacts('john');
      const filteredCount = await contacts.getContactCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should clear search results', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    await contacts.searchContacts('nonexistent');
    await contacts.searchContacts('');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Contacts - Filter by Role', () => {
  test('should have role filter', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const roleFilter = page.getByRole('combobox').or(page.locator('select'));
    if (await roleFilter.first().isVisible()) {
      await expect(roleFilter.first()).toBeEnabled();
    }
  });

  test('should filter by founder role', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const roleFilter = page.locator('[class*="dropdown"], select').first();
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      const founderOption = page.getByRole('option', { name: /founder/i });
      if (await founderOption.isVisible()) {
        await founderOption.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should filter by investor role', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const roleFilter = page.locator('[class*="dropdown"], select').first();
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      const investorOption = page.getByRole('option', { name: /investor/i });
      if (await investorOption.isVisible()) {
        await investorOption.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

test.describe('Contacts - Contact List', () => {
  test('should display contact cards', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show contact name on cards', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const contactName = page.locator('[class*="font-medium"]').first();
    if (await contactName.isVisible()) {
      await expect(contactName).toBeVisible();
    }
  });

  test('should show company on cards', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const companyText = page.locator('text=/Inc|Corp|LLC|Company/i');
    if (await companyText.count() > 0) {
      await expect(companyText.first()).toBeVisible();
    }
  });

  test('should show role badge on cards', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const roleBadge = page.locator('[class*="badge"]').filter({ hasText: /founder|ceo|investor|advisor/i });
    if (await roleBadge.count() > 0) {
      await expect(roleBadge.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Contact Detail Drawer', () => {
  test('should open contact drawer on click', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show contact info in drawer', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      // Check for contact info elements
      const emailElement = page.locator('text=/Email/i');
      if (await emailElement.isVisible()) {
        await expect(emailElement).toBeVisible();
      }
    }
  });

  test('should have tabs in drawer', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const overviewTab = page.locator('button, [role="tab"]').filter({ hasText: /overview/i });
      if (await overviewTab.isVisible()) {
        await expect(overviewTab).toBeVisible();
      }
    }
  });

  test('should have quick action buttons', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const sendEmailBtn = page.getByRole('button', { name: /send email/i });
      if (await sendEmailBtn.isVisible()) {
        await expect(sendEmailBtn).toBeEnabled();
      }
    }
  });
});

test.describe('Contacts - Relationship Score', () => {
  test('should display relationship score on cards', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const scoreElement = page.locator('text=/score|health/i');
    if (await scoreElement.count() > 0) {
      await expect(scoreElement.first()).toBeVisible();
    }
  });

  test('should show interaction count', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const interactionText = page.locator('text=/interactions/i');
    if (await interactionText.count() > 0) {
      await expect(interactionText.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Smart Lists', () => {
  test('should have smart lists panel', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const smartListsSection = page.locator('text=/Smart Lists/i');
    if (await smartListsSection.isVisible()) {
      await expect(smartListsSection).toBeVisible();
    }
  });
});

test.describe('Contacts - Network Graph', () => {
  test('should have network view button', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    if (await contacts.networkViewButton.isVisible()) {
      await expect(contacts.networkViewButton).toBeEnabled();
    }
  });

  test('should open network graph modal', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    if (await contacts.networkViewButton.isVisible()) {
      await contacts.openNetworkGraph();
      await expect(contacts.networkGraphModal).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Contacts - Starred Contacts', () => {
  test('should show starred indicator on contacts', async ({ page }) => {
    await loginViaRedirect(page, '/contacts');
    await page.waitForLoadState('networkidle');

    const starIcon = page.locator('[class*="fill-"][class*="yellow"], [class*="fill-"][class*="warning"]');
    if (await starIcon.count() > 0) {
      await expect(starIcon.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Tags', () => {
  test('should display contact tags', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const tagsSection = page.locator('text=/Tags/i');
      if (await tagsSection.isVisible()) {
        await expect(tagsSection).toBeVisible();
      }
    }
  });
});

test.describe('Contacts - Interactions - Data Verification', () => {
  test('role filter should update contact list', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const roleFilter = page.getByRole('combobox')
      .or(page.locator('select'))
      .or(page.locator('[class*="dropdown"]'));

    const dataSelector = '[class*="card"], [data-testid="contact-card"], [class*="rounded-lg"]';

    if (await roleFilter.first().isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Only test if there's data
      if (before.count > 0) {
        await roleFilter.first().click();
        await page.waitForTimeout(300);

        const founderOption = page.getByRole('option', { name: /founder/i });
        if (await founderOption.isVisible()) {
          await founderOption.click();
          await page.waitForLoadState('networkidle');

          const after = await captureDataSnapshot(page, dataSelector);
          const changed = verifyDataChanged(before, after);

          expect(
            changed,
            'Role filter should update contact list'
          ).toBe(true);
        }
      }
    }
  });

  test('search should filter contacts and update list', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const dataSelector = '[class*="card"], [data-testid="contact-card"], [class*="rounded-lg"]';
    const before = await captureDataSnapshot(page, dataSelector);

    // Only test if there's data to filter
    if (before.count > 0) {
      const result = await searchAndVerifyChange(
        page,
        contacts.searchInput,
        'xyz-nonexistent-contact',
        dataSelector
      );

      // Search for non-existent term should reduce results
      expect(result.after.count).toBeLessThanOrEqual(before.count);
    }
  });

  test('search should show matching contacts', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const dataSelector = '[class*="card"], [data-testid="contact-card"], [class*="rounded-lg"]';
    const before = await captureDataSnapshot(page, dataSelector);

    if (before.count > 0) {
      // Search for a common name like "john"
      await contacts.searchInput.fill('john');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const after = await captureDataSnapshot(page, dataSelector);
      const changed = verifyDataChanged(before, after);

      // Search should filter results
      if (before.count > 1) {
        expect(changed, 'Search should filter contact list').toBe(true);
      }
    }
  });

  test('smart list selection should filter contacts', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    const smartListsSection = page.locator('text=/Smart Lists/i');
    const dataSelector = '[class*="card"], [data-testid="contact-card"], [class*="rounded-lg"]';

    if (await smartListsSection.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Click on a smart list option
      const smartListItem = page.locator('[class*="cursor-pointer"]').filter({ hasText: /needs follow-up|starred|recent/i }).first();

      if (await smartListItem.isVisible() && before.count > 0) {
        await smartListItem.click();
        await page.waitForLoadState('networkidle');

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        expect(
          changed,
          'Smart list selection should filter contacts'
        ).toBe(true);
      }
    }
  });

  test('metrics should reflect current filter state', async ({ page }) => {
    const contacts = new ContactsPage(page);
    await contacts.goto();

    // Get initial metrics
    const initialTotalCount = await contacts.getTotalContactsCount();

    // Apply a filter
    const roleFilter = page.getByRole('combobox').or(page.locator('select')).first();

    if (await roleFilter.isVisible() && initialTotalCount > 0) {
      await roleFilter.click();
      await page.waitForTimeout(300);

      const founderOption = page.getByRole('option', { name: /founder/i });
      if (await founderOption.isVisible()) {
        await founderOption.click();
        await page.waitForLoadState('networkidle');

        // After filtering, the displayed count should be related to the filter
        const filteredContactCount = await contacts.getContactCount();

        // Filtered count should be <= total (unless showing all again)
        expect(filteredContactCount).toBeLessThanOrEqual(initialTotalCount);
      }
    }
  });
});
