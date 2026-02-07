import { Page, Locator, expect } from '@playwright/test';

/**
 * Captures text content from all elements matching a selector
 */
export async function captureTextContent(page: Page, selector: string): Promise<string[]> {
  const elements = page.locator(selector);
  return elements.allTextContents();
}

/**
 * Captures the count of elements matching a selector
 */
export async function captureElementCount(page: Page, selector: string): Promise<number> {
  return page.locator(selector).count();
}

/**
 * Captures both count and text content for comparison
 */
export async function captureDataSnapshot(page: Page, selector: string) {
  const elements = page.locator(selector);
  const count = await elements.count();
  const texts = await elements.allTextContents();
  const firstText = count > 0 ? await elements.first().textContent() : null;

  return { count, texts, firstText };
}

/**
 * Verifies that data has changed after an interaction
 */
export function verifyDataChanged(
  before: { count: number; texts: string[]; firstText: string | null },
  after: { count: number; texts: string[]; firstText: string | null }
): boolean {
  // Check if count changed
  if (before.count !== after.count) return true;

  // Check if any text content changed
  if (before.firstText !== after.firstText) return true;

  // Deep comparison of all texts
  if (JSON.stringify(before.texts) !== JSON.stringify(after.texts)) return true;

  return false;
}

/**
 * Selects an option from a dropdown and verifies data updates
 */
export async function selectOptionAndVerifyChange(
  page: Page,
  dropdown: Locator,
  optionValue: string | { index: number },
  dataSelector: string
): Promise<{ before: any; after: any; changed: boolean }> {
  const before = await captureDataSnapshot(page, dataSelector);

  if (typeof optionValue === 'string') {
    await dropdown.selectOption(optionValue);
  } else {
    await dropdown.selectOption(optionValue);
  }

  await page.waitForLoadState('networkidle');

  const after = await captureDataSnapshot(page, dataSelector);
  const changed = verifyDataChanged(before, after);

  return { before, after, changed };
}

/**
 * Clicks a filter control and verifies data updates
 */
export async function clickFilterAndVerifyChange(
  page: Page,
  filterElement: Locator,
  dataSelector: string
): Promise<{ before: any; after: any; changed: boolean }> {
  const before = await captureDataSnapshot(page, dataSelector);

  await filterElement.click();
  await page.waitForLoadState('networkidle');

  const after = await captureDataSnapshot(page, dataSelector);
  const changed = verifyDataChanged(before, after);

  return { before, after, changed };
}

/**
 * Fills a search input and verifies results update
 */
export async function searchAndVerifyChange(
  page: Page,
  searchInput: Locator,
  searchTerm: string,
  dataSelector: string
): Promise<{ before: any; after: any; changed: boolean }> {
  const before = await captureDataSnapshot(page, dataSelector);

  await searchInput.fill(searchTerm);
  await page.waitForLoadState('networkidle');
  // Additional wait for debounced search
  await page.waitForTimeout(500);

  const after = await captureDataSnapshot(page, dataSelector);
  const changed = verifyDataChanged(before, after);

  return { before, after, changed };
}

/**
 * Gets available options from a select/combobox
 */
export async function getDropdownOptions(dropdown: Locator): Promise<string[]> {
  const options = dropdown.locator('option');
  return options.allTextContents();
}

/**
 * Selects a different option from the current one
 */
export async function selectDifferentOption(
  page: Page,
  dropdown: Locator,
  dataSelector: string
): Promise<{ before: any; after: any; changed: boolean; selectedOption: string | null }> {
  const options = await getDropdownOptions(dropdown);

  if (options.length < 2) {
    return {
      before: await captureDataSnapshot(page, dataSelector),
      after: await captureDataSnapshot(page, dataSelector),
      changed: false,
      selectedOption: null,
    };
  }

  const before = await captureDataSnapshot(page, dataSelector);

  // Select the second option (index 1) to ensure we're selecting something different
  await dropdown.selectOption({ index: 1 });
  await page.waitForLoadState('networkidle');

  const after = await captureDataSnapshot(page, dataSelector);
  const changed = verifyDataChanged(before, after);

  return { before, after, changed, selectedOption: options[1] };
}

/**
 * Asserts that an interaction caused data to change
 */
export async function expectDataToChange(
  result: { before: any; after: any; changed: boolean }
) {
  expect(result.changed,
    `Expected data to change.\nBefore: ${JSON.stringify(result.before)}\nAfter: ${JSON.stringify(result.after)}`
  ).toBe(true);
}

/**
 * Asserts that filtering reduced the number of items
 */
export async function expectFilterToReduceItems(
  result: { before: any; after: any; changed: boolean }
) {
  expect(result.after.count).toBeLessThanOrEqual(result.before.count);
}
