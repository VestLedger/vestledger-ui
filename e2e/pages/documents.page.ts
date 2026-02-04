import { Page, Locator } from '@playwright/test';

export class DocumentsPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // Actions
  readonly uploadButton: Locator;
  readonly createFolderButton: Locator;

  // Document manager
  readonly documentManager: Locator;
  readonly documentList: Locator;
  readonly documentCards: Locator;
  readonly folderCards: Locator;

  // Search and filters
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly fundFilter: Locator;

  // Document actions
  readonly openDocumentButton: Locator;
  readonly downloadButton: Locator;
  readonly shareButton: Locator;
  readonly deleteButton: Locator;
  readonly favoriteButton: Locator;

  // Preview modal
  readonly previewModal: Locator;
  readonly previewCloseButton: Locator;
  readonly previewNavigateNext: Locator;
  readonly previewNavigatePrev: Locator;
  readonly previewDownloadButton: Locator;
  readonly previewShareButton: Locator;

  // Breadcrumbs
  readonly breadcrumbs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1, [class*="title"]').filter({ hasText: /Documents/i }).first();

    // Actions
    this.uploadButton = page.getByRole('button', { name: /upload/i });
    this.createFolderButton = page.getByRole('button', { name: /create folder|new folder/i });

    // Document manager
    this.documentManager = page.locator('[class*="document-manager"], [class*="DocumentManager"]').or(
      page.locator('[class*="grid"]').filter({ has: page.locator('[class*="card"]') })
    );
    this.documentList = page.locator('[class*="document-list"], [class*="grid"]');
    this.documentCards = page.locator('[class*="card"]').filter({ has: page.locator('svg') });
    this.folderCards = page.locator('[class*="card"]').filter({ has: page.locator('[class*="folder" i]') });

    // Search and filters
    this.searchInput = page.getByPlaceholder(/search.*document/i).or(page.getByRole('searchbox'));
    this.categoryFilter = page.getByRole('combobox', { name: /category/i }).or(
      page.locator('select').filter({ hasText: /category/i })
    );
    this.fundFilter = page.getByRole('combobox', { name: /fund/i }).or(
      page.locator('select').filter({ hasText: /fund/i })
    );

    // Document actions (context menu or buttons)
    this.openDocumentButton = page.getByRole('button', { name: /open|view|preview/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.deleteButton = page.getByRole('button', { name: /delete/i });
    this.favoriteButton = page.getByRole('button', { name: /favorite|star/i });

    // Preview modal
    this.previewModal = page.locator('[role="dialog"]').filter({ has: page.locator('[class*="preview"]') }).or(
      page.locator('[class*="modal"], [class*="Modal"]').filter({ has: page.locator('iframe, img, object') })
    );
    this.previewCloseButton = this.previewModal.getByRole('button', { name: /close/i });
    this.previewNavigateNext = this.previewModal.getByRole('button', { name: /next/i });
    this.previewNavigatePrev = this.previewModal.getByRole('button', { name: /previous|prev/i });
    this.previewDownloadButton = this.previewModal.getByRole('button', { name: /download/i });
    this.previewShareButton = this.previewModal.getByRole('button', { name: /share/i });

    // Breadcrumbs
    this.breadcrumbs = page.locator('[class*="breadcrumb"]').or(page.locator('nav[aria-label*="breadcrumb" i]'));
  }

  async goto() {
    await this.page.goto('/documents');
    await this.page.waitForLoadState('networkidle');
  }

  async getDocumentCount(): Promise<number> {
    return this.documentCards.count();
  }

  async getFolderCount(): Promise<number> {
    return this.folderCards.count();
  }

  async searchDocuments(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(category: string) {
    if (await this.categoryFilter.isVisible()) {
      await this.categoryFilter.click();
      await this.page.getByRole('option', { name: new RegExp(category, 'i') }).click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async filterByFund(fund: string) {
    if (await this.fundFilter.isVisible()) {
      await this.fundFilter.click();
      await this.page.getByRole('option', { name: new RegExp(fund, 'i') }).click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async clickDocument(index: number = 0) {
    await this.documentCards.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectDocumentByName(name: string) {
    const doc = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await doc.click();
    await this.page.waitForLoadState('networkidle');
  }

  async openDocument(index: number = 0) {
    await this.documentCards.nth(index).dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async openDocumentByName(name: string) {
    const doc = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await doc.dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async downloadDocument(name: string) {
    const doc = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await doc.hover();
    const downloadBtn = doc.getByRole('button', { name: /download/i });
    if (await downloadBtn.isVisible()) {
      await downloadBtn.click();
    }
  }

  async deleteDocument(name: string) {
    const doc = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await doc.hover();
    const deleteBtn = doc.getByRole('button', { name: /delete/i });
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  }

  async toggleFavorite(name: string) {
    const doc = this.page.locator('[class*="card"]').filter({ hasText: name }).first();
    await doc.hover();
    const favBtn = doc.getByRole('button', { name: /favorite|star/i });
    if (await favBtn.isVisible()) {
      await favBtn.click();
    }
  }

  async openFolder(name: string) {
    const folder = this.folderCards.filter({ hasText: name }).first();
    await folder.dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  async closePreview() {
    await this.previewCloseButton.click();
  }

  async navigatePreviewNext() {
    await this.previewNavigateNext.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigatePreviewPrev() {
    await this.previewNavigatePrev.click();
    await this.page.waitForLoadState('networkidle');
  }

  getDocumentsByType(type: string): Locator {
    return this.documentCards.filter({ has: this.page.locator(`text=/.${type}$/i`) });
  }

  getDocumentsByCategory(category: string): Locator {
    return this.documentCards.filter({ has: this.page.locator(`text=/${category}/i`) });
  }

  getFavoriteDocuments(): Locator {
    return this.documentCards.filter({ has: this.page.locator('[class*="fill-"][class*="yellow"], [class*="fill-"][class*="warning"]') });
  }

  getRecentDocuments(): Locator {
    return this.page.locator('text=/Recent|Recently/i').locator('..').locator('[class*="card"]');
  }
}
