import { Page, Locator } from '@playwright/test';
import { loginViaRedirect } from '../helpers/auth-helpers';

export class AuditTrailPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;

  // Summary stats
  readonly totalEventsCard: Locator;
  readonly verifiedCard: Locator;
  readonly latestBlockCard: Locator;
  readonly integrityCard: Locator;

  // Search and filter
  readonly searchInput: Locator;
  readonly eventTypeFilter: Locator;

  // Event list
  readonly eventCards: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.getByRole('heading', { name: /audit trail|on-chain/i });

    // Summary stats
    this.totalEventsCard = page.locator('[class*="card"]').filter({ hasText: 'Total Events' });
    this.verifiedCard = page.locator('[class*="card"]').filter({ hasText: 'Verified' });
    this.latestBlockCard = page.locator('[class*="card"]').filter({ hasText: 'Latest Block' });
    this.integrityCard = page.locator('[class*="card"]').filter({ hasText: 'Integrity' });

    // Search and filter
    this.searchInput = page.getByPlaceholder(/search.*description.*hash/i).or(page.getByPlaceholder(/search/i));
    this.eventTypeFilter = page.getByRole('combobox', { name: /type|filter/i }).or(page.locator('select').first());

    // Event list
    this.eventCards = page.locator('[class*="card"]').filter({ hasText: /0x[a-fA-F0-9]+|block/i });
  }

  async goto() {
    await loginViaRedirect(this.page, '/audit-trail');
  }

  async getTotalEventsCount() {
    const text = await this.totalEventsCard.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getVerifiedCount() {
    const text = await this.verifiedCard.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
    return text ? parseInt(text) : 0;
  }

  async getLatestBlock() {
    return this.latestBlockCard.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
  }

  async getIntegrityPercentage() {
    return this.integrityCard.locator('[class*="font-bold"], [class*="text-2xl"]').first().textContent();
  }

  async searchEvents(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByEventType(eventType: string) {
    await this.eventTypeFilter.click();
    await this.page.getByRole('option', { name: new RegExp(eventType, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getEventCount() {
    return this.eventCards.count();
  }

  async getEventByHash(txHash: string) {
    return this.page.locator('[class*="card"]').filter({ hasText: txHash });
  }

  async copyTransactionHash(eventIndex: number) {
    const event = this.eventCards.nth(eventIndex);
    const copyButton = event.getByRole('button', { name: /copy/i }).or(event.locator('[class*="copy"]'));
    if (await copyButton.isVisible()) {
      await copyButton.click();
    }
  }

  async viewEventDetails(eventIndex: number) {
    const event = this.eventCards.nth(eventIndex);
    const viewButton = event.getByRole('button', { name: /view|details|expand/i });
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getEventsByType(eventType: 'ownership_transfer' | 'capital_call' | 'distribution' | 'valuation_update' | 'document_hash' | 'compliance_attestation') {
    const labelMap: Record<string, string> = {
      'ownership_transfer': 'Ownership Transfer',
      'capital_call': 'Capital Call',
      'distribution': 'Distribution',
      'valuation_update': 'Valuation Update',
      'document_hash': 'Document Hash',
      'compliance_attestation': 'Compliance',
    };
    return this.page.locator('[class*="card"]').filter({ hasText: labelMap[eventType] });
  }

  async verifyBlockchainHash(eventIndex: number) {
    const event = this.eventCards.nth(eventIndex);
    const hashElement = event.locator('text=/0x[a-fA-F0-9]+/');
    return hashElement.textContent();
  }

  async exportAuditReport() {
    const exportButton = this.page.getByRole('button', { name: /export|download.*report/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();
    }
  }
}