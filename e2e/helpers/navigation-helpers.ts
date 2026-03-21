import type { Locator, Page } from "@playwright/test";

const SIDEBAR_EXPAND_DELAY_MS = 100;
const TAB_SWITCH_DELAY_MS = 150;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNamePattern(value: string | RegExp): RegExp {
  if (value instanceof RegExp) {
    return value;
  }
  return new RegExp(`^${escapeRegExp(value)}$`, "i");
}

export function getSidebarNav(page: Page): Locator {
  return page.locator("aside nav").first();
}

export async function expandSidebar(page: Page): Promise<void> {
  const aside = page.locator("aside").first();
  if ((await aside.count()) === 0) {
    return;
  }
  await aside.hover();
  await page.waitForTimeout(SIDEBAR_EXPAND_DELAY_MS);
}

export async function openContextualMenu(
  page: Page,
  menuLabel: string | RegExp,
): Promise<void> {
  const menuName = toNamePattern(menuLabel);
  await expandSidebar(page);

  const nav = getSidebarNav(page);
  let menuLink = nav.getByRole("link", { name: menuName }).first();
  if ((await menuLink.count()) === 0) {
    // Expand collapsed navigation groups so contextual roots are present.
    const collapsedGroups = nav.locator(
      'button[aria-expanded="false"]:not([disabled])',
    );
    let expandAttempts = 0;
    const maxExpandAttempts = 12;
    while (
      (await collapsedGroups.count()) > 0 &&
      expandAttempts < maxExpandAttempts
    ) {
      await expandSidebar(page);
      const nextGroup = collapsedGroups.first();
      await nextGroup.scrollIntoViewIfNeeded();
      await nextGroup.click();
      expandAttempts += 1;
      await page.waitForTimeout(50);
    }
    menuLink = nav.getByRole("link", { name: menuName }).first();
    if ((await menuLink.count()) === 0) {
      return;
    }
  }

  await menuLink.click();
  await page.waitForLoadState("domcontentloaded");
  await expandSidebar(page);
}

export function getContextualTab(
  page: Page,
  tabLabel: string | RegExp,
): Locator {
  const tabName = toNamePattern(tabLabel);
  const nav = getSidebarNav(page);
  return nav
    .getByRole("link", { name: tabName })
    .or(nav.getByRole("button", { name: tabName }))
    .or(page.getByRole("tab", { name: tabName }))
    .or(page.locator('[role="tablist"] button').filter({ hasText: tabName }));
}

export async function clickContextualTab(
  page: Page,
  tabLabel: string | RegExp,
): Promise<void> {
  await expandSidebar(page);
  const tab = getContextualTab(page, tabLabel).first();
  if ((await tab.count()) === 0) {
    throw new Error(`Unable to find contextual tab: ${String(tabLabel)}`);
  }
  await tab.click();
  await page.waitForTimeout(TAB_SWITCH_DELAY_MS);
}
