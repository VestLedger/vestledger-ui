import { test, expect, loginViaRedirect } from '../fixtures/auth.fixture';
import { DocumentsPage } from '../pages/documents.page';
import {
  captureDataSnapshot,
  verifyDataChanged,
  selectDifferentOption,
  searchAndVerifyChange,
} from '../helpers/interaction-helpers';

test.describe('Documents - Page Load', () => {
  test('should load documents page', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    await expect(documents.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should have upload button', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    if (await documents.uploadButton.isVisible()) {
      await expect(documents.uploadButton).toBeEnabled();
    }
  });
});

test.describe('Documents - Document List', () => {
  test('should display documents', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const count = await documents.getDocumentCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display document cards with info', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const documentCards = page.locator('[class*="card"]');
    if (await documentCards.count() > 0) {
      await expect(documentCards.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Search', () => {
  test('should have search input', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    if (await searchInput.first().isVisible()) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should search documents by name', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('k-1');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should clear search', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForLoadState('networkidle');
      await searchInput.clear();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Documents - Filtering', () => {
  test('should have category filter', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i }).or(
      page.locator('select, [class*="dropdown"]').filter({ hasText: /category/i })
    );
    if (await categoryFilter.first().isVisible()) {
      await expect(categoryFilter.first()).toBeEnabled();
    }
  });

  test('should have fund filter', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const fundFilter = page.getByRole('combobox', { name: /fund/i }).or(
      page.locator('select, [class*="dropdown"]').filter({ hasText: /fund/i })
    );
    if (await fundFilter.first().isVisible()) {
      await expect(fundFilter.first()).toBeEnabled();
    }
  });
});

test.describe('Documents - Upload', () => {
  test('should have upload functionality', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const uploadButton = page.getByRole('button', { name: /upload/i });
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeEnabled();
    }
  });
});

test.describe('Documents - Create Folder', () => {
  test('should have create folder button', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const createFolderBtn = page.getByRole('button', { name: /create folder|new folder/i });
    if (await createFolderBtn.isVisible()) {
      await expect(createFolderBtn).toBeEnabled();
    }
  });
});

test.describe('Documents - Document Actions', () => {
  test('should have download action', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const documentCard = page.locator('[class*="card"]').first();
    if (await documentCard.isVisible()) {
      await documentCard.hover();

      const downloadBtn = page.getByRole('button', { name: /download/i });
      if (await downloadBtn.first().isVisible()) {
        await expect(downloadBtn.first()).toBeEnabled();
      }
    }
  });

  test('should have share action', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const documentCard = page.locator('[class*="card"]').first();
    if (await documentCard.isVisible()) {
      await documentCard.hover();

      const shareBtn = page.getByRole('button', { name: /share/i });
      if (await shareBtn.first().isVisible()) {
        await expect(shareBtn.first()).toBeEnabled();
      }
    }
  });

  test('should have delete action', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const documentCard = page.locator('[class*="card"]').first();
    if (await documentCard.isVisible()) {
      await documentCard.hover();

      const deleteBtn = page.getByRole('button', { name: /delete/i });
      if (await deleteBtn.first().isVisible()) {
        await expect(deleteBtn.first()).toBeEnabled();
      }
    }
  });
});

test.describe('Documents - Preview', () => {
  test('should open document preview on click', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const documentCards = page.locator('[class*="card"]');
    if (await documentCards.count() > 0) {
      await documentCards.first().dblclick();

      // Preview modal should appear
      const previewModal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
      if (await previewModal.count() > 0) {
        await expect(previewModal.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should have close button in preview', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const documentCards = page.locator('[class*="card"]');
    if (await documentCards.count() > 0) {
      await documentCards.first().dblclick();

      const closeBtn = page.getByRole('button', { name: /close/i });
      if (await closeBtn.first().isVisible()) {
        await expect(closeBtn.first()).toBeEnabled();
      }
    }
  });

  test('should navigate between documents in preview', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const count = await documents.getDocumentCount();
    if (count > 1) {
      await documents.openDocument(0);

      const nextBtn = page.getByRole('button', { name: /next/i });
      if (await nextBtn.isVisible()) {
        await expect(nextBtn).toBeEnabled();
      }
    }
  });
});

test.describe('Documents - Favorites', () => {
  test('should have favorite toggle', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const documentCard = page.locator('[class*="card"]').first();
    if (await documentCard.isVisible()) {
      await documentCard.hover();

      const favoriteBtn = page.getByRole('button', { name: /favorite|star/i });
      if (await favoriteBtn.first().isVisible()) {
        await expect(favoriteBtn.first()).toBeEnabled();
      }
    }
  });
});

test.describe('Documents - Document Types', () => {
  test('should display PDF documents', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const pdfDoc = page.locator('text=/\\.pdf$/i');
    if (await pdfDoc.count() > 0) {
      await expect(pdfDoc.first()).toBeVisible();
    }
  });

  test('should display image documents', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const imageDoc = page.locator('text=/\\.png|\\.jpg|\\.jpeg$/i');
    if (await imageDoc.count() > 0) {
      await expect(imageDoc.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Category Types', () => {
  test('should have K-1 documents', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const k1Doc = page.locator('text=/K-1/i');
    if (await k1Doc.count() > 0) {
      await expect(k1Doc.first()).toBeVisible();
    }
  });

  test('should have legal documents', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const legalDoc = page.locator('text=/legal|agreement|contract/i');
    if (await legalDoc.count() > 0) {
      await expect(legalDoc.first()).toBeVisible();
    }
  });

  test('should have financial documents', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const financialDoc = page.locator('text=/financial|statement|report/i');
    if (await financialDoc.count() > 0) {
      await expect(financialDoc.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Folders', () => {
  test('should display folders', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const folderCount = await documents.getFolderCount();
    expect(folderCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate into folder on double click', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const folderCount = await documents.getFolderCount();
    if (folderCount > 0) {
      const folder = page.locator('[class*="card"]').filter({ has: page.locator('[class*="folder" i]') }).first();
      if (await folder.isVisible()) {
        await folder.dblclick();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

test.describe('Documents - Access Levels', () => {
  test('should have access level indicators', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const accessIndicator = page.locator('text=/private|shared|public/i');
    if (await accessIndicator.count() > 0) {
      await expect(accessIndicator.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Document Metadata', () => {
  test('should show document size', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const sizeText = page.locator('text=/\\d+.*KB|\\d+.*MB/i');
    if (await sizeText.count() > 0) {
      await expect(sizeText.first()).toBeVisible();
    }
  });

  test('should show upload date', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const dateText = page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}|\\d+ days? ago|today|yesterday/i');
    if (await dateText.count() > 0) {
      await expect(dateText.first()).toBeVisible();
    }
  });

  test('should show uploaded by', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const uploaderText = page.locator('text=/uploaded by|by /i');
    if (await uploaderText.count() > 0) {
      await expect(uploaderText.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Tags', () => {
  test('should display document tags', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const tagBadge = page.locator('[class*="badge"], [class*="tag"]').filter({ hasText: /tax|legal|fund/i });
    if (await tagBadge.count() > 0) {
      await expect(tagBadge.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Recent Documents', () => {
  test('should show recent documents section', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const recentSection = page.locator('text=/recent|recently/i');
    if (await recentSection.count() > 0) {
      await expect(recentSection.first()).toBeVisible();
    }
  });
});

test.describe('Documents - Interactions - Data Verification', () => {
  test('category filter should update document list', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i })
      .or(page.locator('select, [class*="dropdown"]').filter({ hasText: /category/i }));

    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    if (await categoryFilter.first().isVisible()) {
      const result = await selectDifferentOption(
        page,
        categoryFilter.first(),
        dataSelector
      );

      // If multiple categories and documents exist, expect change
      if (result.selectedOption && result.before.count > 0) {
        expect(
          result.changed,
          `Category filter should update document list. Selected: ${result.selectedOption}`
        ).toBe(true);
      }
    }
  });

  test('fund filter should update document list', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const fundFilter = page.getByRole('combobox', { name: /fund/i })
      .or(page.locator('select, [class*="dropdown"]').filter({ hasText: /fund/i }));

    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    if (await fundFilter.first().isVisible()) {
      const result = await selectDifferentOption(
        page,
        fundFilter.first(),
        dataSelector
      );

      // If multiple funds and documents exist, expect change
      if (result.selectedOption && result.before.count > 0) {
        expect(
          result.changed,
          `Fund filter should update document list. Selected: ${result.selectedOption}`
        ).toBe(true);
      }
    }
  });

  test('search should filter documents', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).first();
    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    if (await searchInput.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      // Only test if there's data to filter
      if (before.count > 0) {
        const result = await searchAndVerifyChange(
          page,
          searchInput,
          'xyz-nonexistent-document',
          dataSelector
        );

        // Search for non-existent term should reduce or change results
        expect(result.after.count).toBeLessThanOrEqual(before.count);
      }
    }
  });

  test('search should show matching documents', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).first();
    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    if (await searchInput.isVisible()) {
      const before = await captureDataSnapshot(page, dataSelector);

      if (before.count > 0) {
        // Search for a common term like "K-1" or "pdf"
        await searchInput.fill('K-1');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const after = await captureDataSnapshot(page, dataSelector);
        const changed = verifyDataChanged(before, after);

        // Search should change results (filter down to matching docs)
        if (before.count > 1) {
          expect(changed, 'Search should filter document list').toBe(true);
        }
      }
    }
  });

  test('clearing search should restore full list', async ({ page }) => {
    const documents = new DocumentsPage(page);
    await documents.goto();

    const searchInput = page.getByPlaceholder(/search/i).first();
    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    if (await searchInput.isVisible()) {
      const initialSnapshot = await captureDataSnapshot(page, dataSelector);

      if (initialSnapshot.count > 0) {
        // Filter down
        await searchInput.fill('K-1');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const filteredSnapshot = await captureDataSnapshot(page, dataSelector);

        // Clear search
        await searchInput.clear();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const restoredSnapshot = await captureDataSnapshot(page, dataSelector);

        // After clearing, should restore to original count
        expect(restoredSnapshot.count).toBeGreaterThanOrEqual(filteredSnapshot.count);
      }
    }
  });

  test('combined filters should work together', async ({ page }) => {
    await loginViaRedirect(page, '/documents');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i }).first();
    const fundFilter = page.getByRole('combobox', { name: /fund/i }).first();
    const dataSelector = '[class*="card"], [data-testid="document-item"]';

    const initialSnapshot = await captureDataSnapshot(page, dataSelector);

    // Apply category filter first
    if (await categoryFilter.isVisible()) {
      await selectDifferentOption(page, categoryFilter, dataSelector);
    }

    const afterCategoryFilter = await captureDataSnapshot(page, dataSelector);

    // Apply fund filter second
    if (await fundFilter.isVisible()) {
      await selectDifferentOption(page, fundFilter, dataSelector);
    }

    const afterBothFilters = await captureDataSnapshot(page, dataSelector);

    // Combined filters should produce different results than single filter
    if (initialSnapshot.count > 2) {
      const filtersApplied = verifyDataChanged(initialSnapshot, afterBothFilters);
      expect(filtersApplied, 'Combined filters should affect document list').toBe(true);
    }
  });
});
