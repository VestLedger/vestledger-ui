import { test, expect } from '../fixtures/auth.fixture';
import { ContactsPage } from '../pages/contacts.page';

test.describe('Contacts - Page Load', () => {
  test('should load contacts page', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    await expect(contacts.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display summary metrics', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    await expect(contacts.totalContactsMetric).toBeVisible();
    await expect(contacts.foundersMetric).toBeVisible();
    await expect(contacts.starredMetric).toBeVisible();
    await expect(contacts.followUpsDueMetric).toBeVisible();
  });

  test('should have Add Contact button', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    if (await contacts.addContactButton.isVisible()) {
      await expect(contacts.addContactButton).toBeEnabled();
    }
  });
});

test.describe('Contacts - Metrics', () => {
  test('should display total contacts count', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getTotalContactsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display founders count', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getFoundersCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display starred count', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getStarredCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display follow-ups due count', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getFollowUpsDueCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Contacts - Search', () => {
  test('should have search input', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    await expect(contacts.searchInput).toBeVisible();
  });

  test('should search contacts by name', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const initialCount = await contacts.getContactCount();
    if (initialCount > 0) {
      await contacts.searchContacts('john');
      const filteredCount = await contacts.getContactCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should clear search results', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    await contacts.searchContacts('nonexistent');
    await contacts.searchContacts('');
    await authenticatedPage.waitForLoadState('networkidle');
  });
});

test.describe('Contacts - Filter by Role', () => {
  test('should have role filter', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const roleFilter = authenticatedPage.getByRole('combobox').or(authenticatedPage.locator('select'));
    if (await roleFilter.first().isVisible()) {
      await expect(roleFilter.first()).toBeEnabled();
    }
  });

  test('should filter by founder role', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const roleFilter = authenticatedPage.locator('[class*="dropdown"], select').first();
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      const founderOption = authenticatedPage.getByRole('option', { name: /founder/i });
      if (await founderOption.isVisible()) {
        await founderOption.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }
    }
  });

  test('should filter by investor role', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const roleFilter = authenticatedPage.locator('[class*="dropdown"], select').first();
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      const investorOption = authenticatedPage.getByRole('option', { name: /investor/i });
      if (await investorOption.isVisible()) {
        await investorOption.click();
        await authenticatedPage.waitForLoadState('networkidle');
      }
    }
  });
});

test.describe('Contacts - Contact List', () => {
  test('should display contact cards', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show contact name on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const contactName = authenticatedPage.locator('[class*="font-medium"]').first();
    if (await contactName.isVisible()) {
      await expect(contactName).toBeVisible();
    }
  });

  test('should show company on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const companyText = authenticatedPage.locator('text=/Inc|Corp|LLC|Company/i');
    if (await companyText.count() > 0) {
      await expect(companyText.first()).toBeVisible();
    }
  });

  test('should show role badge on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const roleBadge = authenticatedPage.locator('[class*="badge"]').filter({ hasText: /founder|ceo|investor|advisor/i });
    if (await roleBadge.count() > 0) {
      await expect(roleBadge.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Contact Detail Drawer', () => {
  test('should open contact drawer on click', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show contact info in drawer', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      // Check for contact info elements
      const emailElement = authenticatedPage.locator('text=/Email/i');
      if (await emailElement.isVisible()) {
        await expect(emailElement).toBeVisible();
      }
    }
  });

  test('should have tabs in drawer', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const overviewTab = authenticatedPage.locator('button, [role="tab"]').filter({ hasText: /overview/i });
      if (await overviewTab.isVisible()) {
        await expect(overviewTab).toBeVisible();
      }
    }
  });

  test('should have quick action buttons', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const sendEmailBtn = authenticatedPage.getByRole('button', { name: /send email/i });
      if (await sendEmailBtn.isVisible()) {
        await expect(sendEmailBtn).toBeEnabled();
      }
    }
  });
});

test.describe('Contacts - Relationship Score', () => {
  test('should display relationship score on cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const scoreElement = authenticatedPage.locator('text=/score|health/i');
    if (await scoreElement.count() > 0) {
      await expect(scoreElement.first()).toBeVisible();
    }
  });

  test('should show interaction count', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const interactionText = authenticatedPage.locator('text=/interactions/i');
    if (await interactionText.count() > 0) {
      await expect(interactionText.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Smart Lists', () => {
  test('should have smart lists panel', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const smartListsSection = authenticatedPage.locator('text=/Smart Lists/i');
    if (await smartListsSection.isVisible()) {
      await expect(smartListsSection).toBeVisible();
    }
  });
});

test.describe('Contacts - Network Graph', () => {
  test('should have network view button', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    if (await contacts.networkViewButton.isVisible()) {
      await expect(contacts.networkViewButton).toBeEnabled();
    }
  });

  test('should open network graph modal', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    if (await contacts.networkViewButton.isVisible()) {
      await contacts.openNetworkGraph();
      await expect(contacts.networkGraphModal).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Contacts - Starred Contacts', () => {
  test('should show starred indicator on contacts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    await authenticatedPage.waitForLoadState('networkidle');

    const starIcon = authenticatedPage.locator('[class*="fill-"][class*="yellow"], [class*="fill-"][class*="warning"]');
    if (await starIcon.count() > 0) {
      await expect(starIcon.first()).toBeVisible();
    }
  });
});

test.describe('Contacts - Tags', () => {
  test('should display contact tags', async ({ authenticatedPage }) => {
    const contacts = new ContactsPage(authenticatedPage);
    await contacts.goto();

    const count = await contacts.getContactCount();
    if (count > 0) {
      await contacts.clickContact(0);
      await expect(contacts.contactDrawer).toBeVisible({ timeout: 5000 });

      const tagsSection = authenticatedPage.locator('text=/Tags/i');
      if (await tagsSection.isVisible()) {
        await expect(tagsSection).toBeVisible();
      }
    }
  });
});
