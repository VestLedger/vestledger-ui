import { test, type Page } from "@playwright/test";
import { createApiStorageState } from "../helpers/auth-helpers";
import {
  clickContextualTab,
  openContextualMenu,
} from "../helpers/navigation-helpers";
import {
  AUDIT_PERSONAS,
  OVERLAY_TARGETS,
  SCREEN_TARGETS,
  type AuditPersona,
  type AuditPersonaId,
  type OverlayTarget,
  type ScreenTarget,
} from "./screen-audit-matrix";
import {
  attachAuditRuntimeEvents,
  captureOverlayScreenshot,
  captureViewportCheckpoints,
  clickByAccessibleName,
  clickContextualTabByLabel,
  clickFirstVisible,
  closeTransientSurface,
  collectOverlayInventory,
  createAuditOutputRoot,
  ensureDirectory,
  hoverSidebar,
  leaveSidebar,
  openTopbarSearchState,
  stabilizeForAudit,
  waitForAnyOverlay,
  writeAuditArtifacts,
  type AuditRecord,
  type AuditRuntimeEvents,
  type OverlayInventoryEntry,
} from "./screen-audit-helpers";

const DEFAULT_APP_BASE_URL = "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };
const outputRoot = createAuditOutputRoot();
const startedAt = new Date().toISOString();
const records: AuditRecord[] = [];
let overlayInventory: OverlayInventoryEntry[] = [];

test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  process.env.APP_BASE_URL ||= process.env.BASE_URL || DEFAULT_APP_BASE_URL;
  process.env.PLAYWRIGHT_API_BASE_URL ||=
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.APP_BASE_URL ||
    DEFAULT_APP_BASE_URL;
  process.env.PLAYWRIGHT_EXTERNAL_SERVER ||= "1";

  ensureDirectory(outputRoot);
  overlayInventory = collectOverlayInventory(process.cwd());

  for (const entry of overlayInventory) {
    records.push({
      id: `static-${entry.id}`,
      type: "overlay",
      status: "skipped",
      label: `Static ${entry.category}`,
      route: `${entry.filePath}:${entry.line}`,
      notes:
        "Static inventory entry. Runtime coverage is captured by explicit overlay targets or marked unreachable when not safely triggerable.",
    });
  }
});

test.afterAll(async () => {
  await writeAuditArtifacts({
    outputRoot,
    records,
    overlayInventory,
    startedAt,
    finishedAt: new Date().toISOString(),
  });
});

test("collects exhaustive screen and overlay screenshots", async ({
  page,
}, testInfo) => {
  test.setTimeout(30 * 60_000);
  testInfo.setTimeout(30 * 60_000);
  await page.setViewportSize(VIEWPORT);
  const runtimeEvents = attachAuditRuntimeEvents(page);

  for (const target of SCREEN_TARGETS) {
    await captureScreenTarget(page, target, runtimeEvents);
  }

  for (const target of OVERLAY_TARGETS) {
    await captureOverlayTarget(page, target, runtimeEvents);
  }
});

async function captureScreenTarget(
  page: Page,
  target: ScreenTarget,
  runtimeEvents: AuditRuntimeEvents,
) {
  const persona = resolvePersona(target.personaId);
  if (target.personaId && !persona) {
    pushSkippedScreen(target, "Missing credentials for persona.");
    return;
  }

  try {
    const resolvedPath = await resolveTargetPath(page, target, persona);
    if (!resolvedPath) {
      pushSkippedScreen(target, "Unable to resolve dynamic path.");
      return;
    }

    await openTargetPath(page, resolvedPath, persona);

    if (target.kind === "contextual-tab" && target.tabLabel) {
      const clicked = await activateContextualTab(
        page,
        target.path,
        target.tabLabel,
        target.contextualRootLabel,
      );
      if (!clicked) {
        pushSkippedScreen(
          target,
          `Unable to activate tab '${target.tabLabel}'.`,
        );
        return;
      }
      await stabilizeForAudit(page);
    }

    if (target.kind === "deal-intelligence-deal-tab") {
      const openedDeal = await openFirstDealIntelligenceCard(page);
      if (!openedDeal) {
        pushSkippedScreen(
          target,
          "Unable to open first deal intelligence card.",
        );
        return;
      }
      if (target.tabLabel) {
        const clicked = await activateContextualTab(
          page,
          target.path,
          target.tabLabel,
          target.contextualRootLabel,
        );
        if (!clicked) {
          pushSkippedScreen(
            target,
            `Unable to activate deal intelligence tab '${target.tabLabel}'.`,
          );
          return;
        }
      }
      await stabilizeForAudit(page);
    }

    await captureViewportCheckpoints({
      page,
      outputRoot,
      records,
      runtimeEvents,
      slugParts: [
        "screen",
        persona?.id ?? "public",
        target.id,
        target.tabLabel ?? "",
      ],
      baseRecord: {
        id: target.id,
        type: "screen",
        label: target.label,
        route: resolvedPath,
        personaId: persona?.id,
        personaLabel: persona?.label,
        targetKind: target.kind,
        tabLabel: target.tabLabel,
      },
    });
  } catch (error) {
    records.push({
      id: target.id,
      type: "screen",
      status: "error",
      label: target.label,
      route: target.path,
      personaId: persona?.id,
      personaLabel: persona?.label,
      targetKind: target.kind,
      tabLabel: target.tabLabel,
      finalUrl: page.url(),
      notes: error instanceof Error ? error.message : String(error),
    });
  }
}

async function captureOverlayTarget(
  page: Page,
  target: OverlayTarget,
  runtimeEvents: AuditRuntimeEvents,
) {
  const persona = resolvePersona(target.personaId);
  if (target.personaId && !persona) {
    pushSkippedOverlay(target, "Missing credentials for persona.");
    return;
  }

  try {
    await openTargetPath(page, target.path, persona);
    if (target.tabLabel) {
      await activateContextualTab(page, target.path, target.tabLabel);
      await stabilizeForAudit(page);
    }
    if (target.routePreparation === "deal-intelligence-first-deal") {
      await openFirstDealIntelligenceCard(page);
      await stabilizeForAudit(page);
    }

    const opened = await openOverlay(page, target);
    if (!opened) {
      pushSkippedOverlay(target, "Unable to trigger overlay safely.");
      return;
    }

    await waitForAnyOverlay(page).catch(() => false);
    await stabilizeForAudit(page);
    await captureOverlayScreenshot({
      page,
      outputRoot,
      records,
      runtimeEvents,
      slugParts: ["overlay", persona?.id ?? "public", target.id, target.label],
      baseRecord: {
        id: target.id,
        type: "overlay",
        label: target.label,
        route: target.path,
        personaId: persona?.id,
        personaLabel: persona?.label,
        targetKind: target.kind,
        tabLabel: target.tabLabel,
        overlayTrigger: target.triggerName,
        notes: target.notes,
      },
    });
    await closeTransientSurface(page);
  } catch (error) {
    records.push({
      id: target.id,
      type: "overlay",
      status: "error",
      label: target.label,
      route: target.path,
      personaId: persona?.id,
      personaLabel: persona?.label,
      targetKind: target.kind,
      tabLabel: target.tabLabel,
      overlayTrigger: target.triggerName,
      finalUrl: page.url(),
      notes: error instanceof Error ? error.message : String(error),
    });
  }
}

async function openTargetPath(
  page: Page,
  targetPath: string,
  persona: AuditPersona | null,
) {
  if (!persona) {
    await clearAuth(page);
    await page.goto(targetPath, { waitUntil: "domcontentloaded" });
    await stabilizeForAudit(page);
    return;
  }

  await applyPersonaAuth(page, persona);
  await page.goto(targetPath, { waitUntil: "domcontentloaded" });
  await stabilizeForAudit(page);
}

async function applyPersonaAuth(page: Page, persona: AuditPersona) {
  if (!persona.email || !persona.password) {
    throw new Error(`Missing credentials for ${persona.id}`);
  }

  const appBaseUrl =
    process.env.APP_BASE_URL || process.env.BASE_URL || DEFAULT_APP_BASE_URL;
  const origin = new URL(appBaseUrl).origin;
  const storageState = await createApiStorageState(origin, {
    email: persona.email,
    password: persona.password,
  });

  await page.context().clearCookies();
  await page.context().addCookies(storageState.cookies);
  await page
    .goto(origin, { waitUntil: "domcontentloaded" })
    .catch(() => undefined);
  for (const originState of storageState.origins) {
    if (new URL(page.url()).origin !== originState.origin) {
      await page
        .goto(originState.origin, { waitUntil: "domcontentloaded" })
        .catch(() => undefined);
    }
    await page.evaluate((items) => {
      window.localStorage.clear();
      for (const item of items) {
        window.localStorage.setItem(item.name, item.value);
      }
      window.sessionStorage.clear();
    }, originState.localStorage);
  }
}

async function clearAuth(page: Page) {
  const appBaseUrl =
    process.env.APP_BASE_URL || process.env.BASE_URL || DEFAULT_APP_BASE_URL;
  await page.context().clearCookies();
  await page
    .goto(new URL("/login", appBaseUrl).toString(), {
      waitUntil: "domcontentloaded",
    })
    .catch(() => undefined);
  await page
    .evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    })
    .catch(() => undefined);
}

function resolvePersona(personaId?: AuditPersonaId): AuditPersona | null {
  if (!personaId) return null;
  const persona = AUDIT_PERSONAS[personaId];
  if (!persona) return null;

  if (persona.email && persona.password) return persona;

  const envEmail = persona.envEmailVar
    ? process.env[persona.envEmailVar]?.trim()
    : undefined;
  const envPassword = persona.envPasswordVar
    ? process.env[persona.envPasswordVar]?.trim()
    : undefined;

  if (!envEmail || !envPassword) return null;
  return { ...persona, email: envEmail, password: envPassword };
}

async function resolveTargetPath(
  page: Page,
  target: ScreenTarget,
  persona: AuditPersona | null,
): Promise<string | null> {
  if (target.dynamic !== "first-distribution-detail") return target.path;
  if (!persona) return null;

  return fetchFirstDistributionDetailPath(persona);
}

async function fetchFirstDistributionDetailPath(
  persona: AuditPersona,
): Promise<string | null> {
  if (!persona.email || !persona.password) return null;

  const appBaseUrl =
    process.env.APP_BASE_URL || process.env.BASE_URL || DEFAULT_APP_BASE_URL;
  const apiBaseUrl =
    process.env.PLAYWRIGHT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    appBaseUrl;
  const origin = new URL(appBaseUrl).origin;
  const storageState = await createApiStorageState(origin, {
    email: persona.email,
    password: persona.password,
  });
  const accessToken =
    storageState.origins
      .flatMap((originState) => originState.localStorage)
      .find((item) => item.name === "accessToken")?.value ?? "";
  if (!accessToken) return null;

  const response = await fetch(new URL("/distributions", apiBaseUrl), {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);
  if (!response?.ok) return null;

  const payload = (await response.json().catch(() => null)) as unknown;
  const list = extractListPayload(payload);
  const first = list.find(
    (item) => isObjectRecord(item) && (item.id || item._id),
  );
  if (!isObjectRecord(first)) return null;

  const distributionId = String(first.id ?? first._id ?? "");
  return distributionId ? `/fund-admin/distributions/${distributionId}` : null;
}

function extractListPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isObjectRecord(payload)) return [];

  for (const key of ["data", "items", "distributions", "results"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function activateContextualTab(
  page: Page,
  pathName: string,
  tabLabel: string,
  rootLabel = inferContextualRootLabel(pathName),
): Promise<boolean> {
  if (rootLabel) {
    await openContextualMenu(page, getContextualRootPattern(rootLabel)).catch(
      () => undefined,
    );
    await stabilizeForAudit(page);
  }

  try {
    await clickContextualTab(page, tabLabel);
    return true;
  } catch {
    return clickContextualTabByLabel(page, tabLabel);
  }
}

function inferContextualRootLabel(pathName: string): string | undefined {
  if (pathName.startsWith("/portfolio")) return "Portfolio";
  if (pathName.startsWith("/analytics")) return "Analytics";
  if (pathName.startsWith("/fund-admin")) return "Fund Admin";
  if (pathName.startsWith("/lp-management")) return "LP Management";
  if (pathName.startsWith("/compliance")) return "Compliance";
  if (pathName.startsWith("/409a-valuations")) return "409A Valuations";
  if (pathName.startsWith("/tax-center")) return "Tax Center";
  if (pathName.startsWith("/lp-portal")) return "LP Portal";
  if (pathName.startsWith("/deal-intelligence")) return "Deal Intelligence";
  if (pathName.startsWith("/collaboration")) return "Collaboration";
  if (pathName.startsWith("/ai-tools")) return "AI Tools";
  return undefined;
}

function getContextualRootPattern(rootLabel: string): RegExp {
  const patterns: Record<string, RegExp> = {
    Portfolio: /^Portfolio/i,
    Analytics: /^Analytics/i,
    "Fund Admin": /^Fund Admin/i,
    "LP Management": /^LP Management/i,
    Compliance: /^Compliance/i,
    "409A Valuations": /^(409A Valuations|Valuations)/i,
    "Tax Center": /^(Tax Center|Tax & Reporting|Tax)/i,
    "LP Portal": /^LP Portal/i,
    "Deal Intelligence": /^Deal Intelligence/i,
    Collaboration: /^Collaboration/i,
    "AI Tools": /^AI Tools/i,
  };

  return patterns[rootLabel] ?? new RegExp(`^${escapeRegExp(rootLabel)}`, "i");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function openOverlay(
  page: Page,
  target: OverlayTarget,
): Promise<boolean> {
  switch (target.id) {
    case "shell-sidebar-expanded":
      await hoverSidebar(page);
      return true;
    case "shell-sidebar-collapsed":
      await leaveSidebar(page);
      return true;
    case "shell-vesta-panel":
      return true;
    case "shell-vesta-minimized":
      return clickByAccessibleName(page, "Minimize Vesta");
    case "shell-vesta-fullscreen":
      await clickByAccessibleName(page, "Expand Vesta to full width");
      return true;
    case "shell-command-palette":
      await page.keyboard.press(
        process.platform === "darwin" ? "Meta+K" : "Control+K",
      );
      await page.waitForTimeout(250);
      return true;
    case "shell-topbar-search-results":
      return openTopbarSearchState(page, "Quantum");
    case "shell-topbar-search-empty":
      return openTopbarSearchState(page, "zzzzzz-no-results");
    case "shell-profile-dropdown":
      return openProfileDropdown(page);
    case "contacts-first-contact":
    case "contacts-drawer-overview":
    case "contacts-drawer-timeline":
    case "contacts-drawer-email":
      return openContactsDrawerState(page, target.id);
    case "documents-preview":
    case "portfolio-documents-preview":
    case "ai-pitch-deck-preview":
    case "ai-dd-document-preview":
    case "lp-statement-preview":
      return openLikelyPreview(page);
    default:
      if (!target.triggerName) return false;
      return clickByAccessibleName(page, target.triggerName);
  }
}

async function openProfileDropdown(page: Page): Promise<boolean> {
  const profileButtons = page.locator("button").filter({
    has: page.locator(".rounded-full"),
  });
  return clickFirstVisible(profileButtons);
}

async function openContactsDrawerState(
  page: Page,
  targetId: string,
): Promise<boolean> {
  const drawerVisible = await page
    .getByRole("button", { name: /overview|timeline|email/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (!drawerVisible) {
    const candidates = [
      page.locator('[data-testid="contact-item"]').first(),
      page.locator("table tbody tr").first(),
      page
        .locator("div.rounded-lg")
        .filter({ hasText: /@|Founder|CEO|Investor/i })
        .first(),
      page
        .getByRole("button")
        .filter({ hasText: /@|Founder|CEO|Investor/i })
        .first(),
    ];

    let opened = false;
    for (const candidate of candidates) {
      if (await clickFirstVisible(candidate)) {
        opened = true;
        break;
      }
    }
    if (!opened) return false;
    await waitForAnyOverlay(page);
  }

  if (targetId.endsWith("timeline")) {
    await clickByAccessibleName(page, "Timeline");
  } else if (targetId.endsWith("email")) {
    await clickByAccessibleName(page, "Email");
  } else if (targetId.endsWith("overview")) {
    await clickByAccessibleName(page, "Overview");
  }
  await page.waitForTimeout(200);
  return true;
}

async function openLikelyPreview(page: Page): Promise<boolean> {
  const patterns = [/preview/i, /view/i, /open/i, /statement/i, /document/i];
  for (const pattern of patterns) {
    const locators = [
      page.getByRole("button", { name: pattern }),
      page.getByRole("link", { name: pattern }),
      page.locator("button", { hasText: pattern }),
      page.locator("a", { hasText: pattern }),
    ];
    for (const locator of locators) {
      if (await clickFirstVisible(locator)) {
        await waitForAnyOverlay(page).catch(() => false);
        return true;
      }
    }
  }
  return false;
}

async function openFirstDealIntelligenceCard(page: Page): Promise<boolean> {
  const alreadyInDeal = await page
    .getByRole("button", { name: /back to fund view/i })
    .isVisible()
    .catch(() => false);
  if (alreadyInDeal) return true;

  const candidates = [
    page
      .locator("div.cursor-pointer")
      .filter({ hasText: /DD Progress/i })
      .first(),
    page
      .locator('[role="button"]')
      .filter({ hasText: /DD Progress/i })
      .first(),
    page
      .locator("div.rounded-lg")
      .filter({ hasText: /Document Completion/i })
      .first(),
  ];

  for (const candidate of candidates) {
    if (await clickFirstVisible(candidate)) {
      await page.waitForTimeout(400);
      return true;
    }
  }
  return false;
}

function pushSkippedScreen(target: ScreenTarget, notes: string) {
  records.push({
    id: target.id,
    type: "screen",
    status: "skipped",
    label: target.label,
    route: target.path,
    personaId: target.personaId,
    targetKind: target.kind,
    tabLabel: target.tabLabel,
    notes,
  });
}

function pushSkippedOverlay(target: OverlayTarget, notes: string) {
  records.push({
    id: target.id,
    type: "overlay",
    status: "unreachable",
    label: target.label,
    route: target.path,
    personaId: target.personaId,
    targetKind: target.kind,
    tabLabel: target.tabLabel,
    overlayTrigger: target.triggerName,
    notes,
  });
}
