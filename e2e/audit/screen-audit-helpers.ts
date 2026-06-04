import fs from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";

export type OverlayInventoryCategory =
  | "modal"
  | "document-preview-modal"
  | "statement-preview-modal"
  | "side-drawer"
  | "command-dialog"
  | "dropdown"
  | "popover"
  | "native-select";

export type SourceFileText = {
  filePath: string;
  text: string;
};

export type OverlayInventoryEntry = {
  id: string;
  category: OverlayInventoryCategory;
  filePath: string;
  line: number;
  match: string;
};

export type AuditRecordStatus =
  | "captured"
  | "skipped"
  | "unreachable"
  | "error";

export type AuditRecordType = "screen" | "overlay";

export type AuditRecord = {
  id: string;
  type: AuditRecordType;
  status: AuditRecordStatus;
  label?: string;
  route?: string;
  finalUrl?: string;
  personaId?: string;
  personaLabel?: string;
  targetKind?: string;
  tabLabel?: string;
  overlayTrigger?: string;
  scrollCheckpoint?: string;
  screenshotPath?: string;
  visualState?: string;
  notes?: string;
  consoleErrors?: string[];
  pageErrors?: string[];
  failedRequests?: string[];
};

export type AuditRuntimeEvents = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};

type CoverageRecord = Pick<AuditRecord, "type" | "status">;

const OVERLAY_PATTERNS: Array<{
  category: OverlayInventoryCategory;
  pattern: RegExp;
}> = [
  { category: "document-preview-modal", pattern: /<DocumentPreviewModal\b/g },
  { category: "statement-preview-modal", pattern: /<StatementPreviewModal\b/g },
  { category: "modal", pattern: /<Modal\b/g },
  { category: "side-drawer", pattern: /<SideDrawer\b/g },
  { category: "command-dialog", pattern: /<Command\.Dialog\b/g },
  { category: "dropdown", pattern: /\bdropdown\s*=/g },
  { category: "popover", pattern: /\bPopover\b|<Popover\b/g },
  { category: "native-select", pattern: /<Select\b/g },
];

const SKIPPED_SOURCE_DIRS = new Set([
  ".next",
  ".next-playwright",
  "node_modules",
  "coverage",
  "test-results",
  "playwright-report",
]);

const SKIPPED_SOURCE_PATH_PREFIXES = ["e2e/audit/"];

export function createScreenshotSlug(parts: readonly string[]): string {
  const slug = parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/@/g, " at ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "screen";
}

export function createOverlayInventoryFromSourceText(
  files: readonly SourceFileText[],
): OverlayInventoryEntry[] {
  const entries: OverlayInventoryEntry[] = [];

  for (const file of files) {
    const lines = file.text.split(/\r?\n/);
    lines.forEach((lineText, index) => {
      for (const { category, pattern } of OVERLAY_PATTERNS) {
        pattern.lastIndex = 0;
        const matches = lineText.match(pattern);
        if (!matches) continue;

        for (const match of matches) {
          entries.push({
            id: createScreenshotSlug([
              "overlay",
              category,
              file.filePath,
              String(index + 1),
              match,
            ]),
            category,
            filePath: file.filePath,
            line: index + 1,
            match,
          });
        }
      }
    });
  }

  return entries.sort((a, b) => {
    if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
    if (a.line !== b.line) return a.line - b.line;
    return a.category.localeCompare(b.category);
  });
}

export function createCoverageSummary(
  records: readonly CoverageRecord[],
  overlayInventory: readonly OverlayInventoryEntry[],
) {
  return {
    capturedScreens: records.filter(
      (record) => record.type === "screen" && record.status === "captured",
    ).length,
    skippedScreens: records.filter(
      (record) => record.type === "screen" && record.status !== "captured",
    ).length,
    capturedOverlays: records.filter(
      (record) => record.type === "overlay" && record.status === "captured",
    ).length,
    skippedOrUnreachableOverlays: records.filter(
      (record) => record.type === "overlay" && record.status !== "captured",
    ).length,
    inventoriedOverlays: overlayInventory.length,
  };
}

export function createAuditOutputRoot(baseDir = process.cwd()): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[:.]/g, "-");
  return path.join(baseDir, "test-results", "screen-audit", timestamp);
}

export function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeJsonFile(filePath: string, value: unknown): void {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function collectSourceFileText(rootDir: string): SourceFileText[] {
  const files: SourceFileText[] = [];

  const walk = (dirPath: string) => {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_SOURCE_DIRS.has(entry.name)) {
          walk(path.join(dirPath, entry.name));
        }
        continue;
      }

      if (!entry.isFile()) continue;
      if (!/\.(tsx|ts)$/.test(entry.name)) continue;
      if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
        continue;
      }
      if (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".spec.tsx")) {
        continue;
      }

      const absolutePath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootDir, absolutePath);
      const normalizedRelativePath = relativePath.split(path.sep).join("/");
      if (
        SKIPPED_SOURCE_PATH_PREFIXES.some((prefix) =>
          normalizedRelativePath.startsWith(prefix),
        )
      ) {
        continue;
      }

      files.push({
        filePath: normalizedRelativePath,
        text: fs.readFileSync(absolutePath, "utf8"),
      });
    }
  };

  walk(rootDir);
  return files;
}

export function collectOverlayInventory(
  rootDir: string,
): OverlayInventoryEntry[] {
  return createOverlayInventoryFromSourceText(collectSourceFileText(rootDir));
}

export function attachAuditRuntimeEvents(page: Page): AuditRuntimeEvents {
  const events: AuditRuntimeEvents = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    if (message.type() === "error") {
      events.consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    events.pageErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    events.failedRequests.push(
      `${request.method()} ${request.url()}${failure ? ` - ${failure.errorText}` : ""}`,
    );
  });

  return events;
}

export function snapshotRuntimeEvents(
  events: AuditRuntimeEvents,
): AuditRuntimeEvents {
  return {
    consoleErrors: [...events.consoleErrors],
    pageErrors: [...events.pageErrors],
    failedRequests: [...events.failedRequests],
  };
}

export function drainRuntimeEvents(
  events: AuditRuntimeEvents,
): AuditRuntimeEvents {
  const snapshot = snapshotRuntimeEvents(events);
  events.consoleErrors.length = 0;
  events.pageErrors.length = 0;
  events.failedRequests.length = 0;
  return snapshot;
}

export async function stabilizeForAudit(page: Page): Promise<void> {
  await page
    .addStyleTag({
      content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
      }
    `,
    })
    .catch(() => undefined);

  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => undefined);
  await page.waitForTimeout(250);
}

export async function captureViewportCheckpoints(params: {
  page: Page;
  outputRoot: string;
  records: AuditRecord[];
  baseRecord: Omit<
    AuditRecord,
    "status" | "screenshotPath" | "scrollCheckpoint"
  >;
  slugParts: readonly string[];
  runtimeEvents: AuditRuntimeEvents;
}): Promise<void> {
  const { page, outputRoot, records, baseRecord, slugParts, runtimeEvents } =
    params;
  const checkpoints = await getScrollCheckpoints(page);

  for (const checkpoint of checkpoints) {
    await setScrollTop(page, checkpoint.top);
    await page.waitForTimeout(100);

    const slug = createScreenshotSlug([...slugParts, checkpoint.name]);
    const screenshotPath = path.join(outputRoot, "screenshots", `${slug}.png`);
    ensureDirectory(path.dirname(screenshotPath));
    await page.screenshot({ path: screenshotPath, fullPage: false });
    const eventSnapshot = drainRuntimeEvents(runtimeEvents);
    const visualState = await detectBlankOrErrorState(page);

    records.push({
      ...baseRecord,
      status: "captured",
      finalUrl: page.url(),
      scrollCheckpoint: checkpoint.name,
      screenshotPath: path.relative(outputRoot, screenshotPath),
      visualState,
      notes: appendNote(
        baseRecord.notes,
        visualState ? `Blank/error state: ${visualState}` : undefined,
      ),
      consoleErrors: eventSnapshot.consoleErrors,
      pageErrors: eventSnapshot.pageErrors,
      failedRequests: eventSnapshot.failedRequests,
    });
  }
}

export async function captureOverlayScreenshot(params: {
  page: Page;
  outputRoot: string;
  records: AuditRecord[];
  baseRecord: Omit<AuditRecord, "status" | "screenshotPath">;
  slugParts: readonly string[];
  runtimeEvents: AuditRuntimeEvents;
}): Promise<void> {
  const { page, outputRoot, records, baseRecord, slugParts, runtimeEvents } =
    params;
  const slug = createScreenshotSlug(slugParts);
  const screenshotPath = path.join(outputRoot, "screenshots", `${slug}.png`);
  ensureDirectory(path.dirname(screenshotPath));
  await page.screenshot({ path: screenshotPath, fullPage: false });
  const eventSnapshot = drainRuntimeEvents(runtimeEvents);

  records.push({
    ...baseRecord,
    status: "captured",
    finalUrl: page.url(),
    screenshotPath: path.relative(outputRoot, screenshotPath),
    consoleErrors: eventSnapshot.consoleErrors,
    pageErrors: eventSnapshot.pageErrors,
    failedRequests: eventSnapshot.failedRequests,
  });
}

export async function waitForAnyOverlay(page: Page): Promise<boolean> {
  const overlay = page
    .locator(
      [
        '[role="dialog"]',
        ".document-preview-modal",
        ".statement-preview-modal",
        '[class*="fixed"][class*="z-50"]',
        '[class*="absolute"][class*="z-50"]',
      ].join(", "),
    )
    .first();
  await overlay
    .waitFor({ state: "visible", timeout: 2_500 })
    .catch(() => undefined);
  return overlay.isVisible().catch(() => false);
}

export async function closeTransientSurface(page: Page): Promise<void> {
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(100);
}

export async function clickFirstVisible(locator: Locator): Promise<boolean> {
  const count = await locator.count().catch(() => 0);
  for (let index = 0; index < Math.min(count, 25); index += 1) {
    const item = locator.nth(index);
    if (!(await item.isVisible().catch(() => false))) continue;
    if (!(await item.isEnabled().catch(() => true))) continue;
    await item.scrollIntoViewIfNeeded().catch(() => undefined);
    try {
      await item.click({ timeout: 2_500 });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

export async function clickByAccessibleName(
  page: Page,
  label: string,
): Promise<boolean> {
  const pattern = new RegExp(escapeRegExp(label), "i");
  const locators = [
    page.getByRole("button", { name: pattern }),
    page.getByRole("link", { name: pattern }),
    page.getByRole("menuitem", { name: pattern }),
    page.getByRole("tab", { name: pattern }),
    page.locator("button", { hasText: pattern }),
    page.locator("a", { hasText: pattern }),
  ];

  for (const locator of locators) {
    if (await clickFirstVisible(locator)) return true;
  }

  return false;
}

export async function openTopbarSearchState(
  page: Page,
  query: string,
): Promise<boolean> {
  const input = page
    .getByPlaceholder(/ask vesta anything/i)
    .or(page.locator('input[placeholder*="Ask Vesta"]').first());
  if (
    !(await input
      .first()
      .isVisible()
      .catch(() => false))
  )
    return false;
  await input.first().fill(query);
  await input.first().focus();
  await page.waitForTimeout(700);
  return true;
}

export async function clickContextualTabByLabel(
  page: Page,
  label: string,
): Promise<boolean> {
  const pattern = new RegExp(`^${escapeRegExp(label)}$`, "i");
  const locators = [
    page.getByRole("tab", { name: pattern }),
    page.locator('[role="tablist"] button').filter({ hasText: pattern }),
    page.locator("aside nav").getByRole("button", { name: pattern }),
    page.locator("aside nav").getByRole("link", { name: pattern }),
    page.locator("aside nav button").filter({ hasText: pattern }),
    page.locator("aside nav a").filter({ hasText: pattern }),
  ];

  for (const locator of locators) {
    if (await clickFirstVisible(locator)) {
      await page.waitForTimeout(250);
      return true;
    }
  }

  return false;
}

export async function hoverSidebar(page: Page): Promise<void> {
  const aside = page.locator("aside").first();
  if (await aside.isVisible().catch(() => false)) {
    await aside.hover();
    await page.waitForTimeout(200);
  }
}

export async function leaveSidebar(page: Page): Promise<void> {
  await page.mouse.move(900, 120).catch(() => undefined);
  await page.waitForTimeout(200);
}

export async function writeAuditArtifacts(params: {
  outputRoot: string;
  records: readonly AuditRecord[];
  overlayInventory: readonly OverlayInventoryEntry[];
  startedAt: string;
  finishedAt: string;
}): Promise<void> {
  const { outputRoot, records, overlayInventory, startedAt, finishedAt } =
    params;
  ensureDirectory(outputRoot);
  writeJsonFile(path.join(outputRoot, "manifest.json"), {
    startedAt,
    finishedAt,
    summary: createCoverageSummary(records, overlayInventory),
    records,
  });
  writeJsonFile(path.join(outputRoot, "overlay-inventory.json"), {
    generatedAt: finishedAt,
    count: overlayInventory.length,
    entries: overlayInventory,
  });
  fs.writeFileSync(
    path.join(outputRoot, "audit-report.md"),
    createAuditReportMarkdown(records, overlayInventory, startedAt, finishedAt),
    "utf8",
  );
}

function createAuditReportMarkdown(
  records: readonly AuditRecord[],
  overlayInventory: readonly OverlayInventoryEntry[],
  startedAt: string,
  finishedAt: string,
): string {
  const summary = createCoverageSummary(records, overlayInventory);
  const screenshotCount = records.filter(
    (record) => record.screenshotPath,
  ).length;
  const screenGaps = records.filter(
    (record) => record.type === "screen" && record.status !== "captured",
  );
  const runtimeOverlayGaps = records.filter(
    (record) =>
      record.type === "overlay" &&
      record.status !== "captured" &&
      !record.id.startsWith("static-"),
  );
  const staticInventoryRecords = records.filter((record) =>
    record.id.startsWith("static-"),
  );
  const redirects = records.filter(isRedirectRecord);
  const visualStateRecords = records.filter((record) => record.visualState);
  const runtimeFailures = records.filter(
    (record) =>
      (record.consoleErrors?.length ?? 0) > 0 ||
      (record.pageErrors?.length ?? 0) > 0 ||
      (record.failedRequests?.length ?? 0) > 0,
  );
  const issues = records.filter(
    (record) =>
      record.status !== "captured" ||
      (record.consoleErrors?.length ?? 0) > 0 ||
      (record.pageErrors?.length ?? 0) > 0 ||
      (record.failedRequests?.length ?? 0) > 0 ||
      Boolean(record.visualState),
  );
  const lines: string[] = [
    "# VestLedger Screen Audit",
    "",
    `Started: ${startedAt}`,
    `Finished: ${finishedAt}`,
    "",
    "## Summary",
    "",
    `- Captured screens: ${summary.capturedScreens}`,
    `- Skipped/error screens: ${summary.skippedScreens}`,
    `- Captured overlays: ${summary.capturedOverlays}`,
    `- Skipped/unreachable overlays: ${summary.skippedOrUnreachableOverlays}`,
    `- Static overlay inventory entries: ${summary.inventoriedOverlays}`,
    `- Total screenshots: ${screenshotCount}`,
    "",
    "## Coverage Gaps",
    "",
    `- Screen gaps: ${screenGaps.length}`,
    `- Runtime overlay gaps: ${runtimeOverlayGaps.length}`,
    `- Static inventory-only overlay entries: ${staticInventoryRecords.length}`,
    "",
    ...formatRecordList(screenGaps, 40),
    ...formatRecordList(runtimeOverlayGaps, 40),
    "",
    "## Redirects",
    "",
    `- Redirected records: ${redirects.length}`,
    "",
    ...formatRedirectList(redirects, 40),
    "",
    "## Blank/Error States",
    "",
    `- Blank/error state records: ${visualStateRecords.length}`,
    "",
    ...formatRecordList(visualStateRecords, 40),
    "",
    "## Runtime Failures",
    "",
    `- Records with console errors, page errors, or failed requests: ${runtimeFailures.length}`,
    "",
    ...formatRuntimeFailureList(runtimeFailures, 40),
    "",
    "## Notable Records",
    "",
  ];

  if (issues.length === 0) {
    lines.push(
      "No skipped records, runtime errors, or failed requests were recorded.",
    );
  } else {
    for (const record of issues.slice(0, 200)) {
      lines.push(
        `- ${record.status.toUpperCase()} ${record.type}: ${record.label ?? record.id} (${record.route ?? "no route"})`,
      );
      if (record.notes) lines.push(`  - Notes: ${record.notes}`);
      if (record.consoleErrors?.length) {
        lines.push(`  - Console errors: ${record.consoleErrors.length}`);
      }
      if (record.pageErrors?.length) {
        lines.push(`  - Page errors: ${record.pageErrors.length}`);
      }
      if (record.failedRequests?.length) {
        lines.push(`  - Failed requests: ${record.failedRequests.length}`);
      }
    }
  }

  lines.push(
    "",
    "## Output",
    "",
    "Screenshots are stored under `screenshots/`.",
  );
  return `${lines.join("\n")}\n`;
}

function formatRecordList(
  records: readonly AuditRecord[],
  limit: number,
): string[] {
  if (records.length === 0) return ["None recorded."];

  const lines = records.slice(0, limit).map((record) => {
    const parts = [
      `- ${record.status.toUpperCase()} ${record.type}: ${record.label ?? record.id}`,
      record.route ? `route=${record.route}` : "",
      record.finalUrl ? `final=${record.finalUrl}` : "",
      record.notes ? `notes=${record.notes}` : "",
    ].filter(Boolean);
    return parts.join(" | ");
  });
  if (records.length > limit) {
    lines.push(`- ${records.length - limit} more record(s) omitted.`);
  }
  return lines;
}

function formatRedirectList(
  records: readonly AuditRecord[],
  limit: number,
): string[] {
  if (records.length === 0) return ["None recorded."];

  const lines = records.slice(0, limit).map((record) => {
    const routePath = getRoutePath(record.route);
    const finalPath = getRoutePath(record.finalUrl);
    return `- ${record.label ?? record.id}: ${routePath ?? "unknown"} -> ${finalPath ?? "unknown"}`;
  });
  if (records.length > limit) {
    lines.push(`- ${records.length - limit} more redirect(s) omitted.`);
  }
  return lines;
}

function formatRuntimeFailureList(
  records: readonly AuditRecord[],
  limit: number,
): string[] {
  if (records.length === 0) return ["None recorded."];

  const lines = records.slice(0, limit).map((record) => {
    const consoleCount = record.consoleErrors?.length ?? 0;
    const pageCount = record.pageErrors?.length ?? 0;
    const requestCount = record.failedRequests?.length ?? 0;
    return [
      `- ${record.label ?? record.id}`,
      `console=${consoleCount}`,
      `page=${pageCount}`,
      `failedRequests=${requestCount}`,
      record.consoleErrors?.[0]
        ? `firstConsole=${truncate(record.consoleErrors[0])}`
        : "",
      record.failedRequests?.[0]
        ? `firstFailedRequest=${truncate(record.failedRequests[0])}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");
  });
  if (records.length > limit) {
    lines.push(
      `- ${records.length - limit} more runtime failure record(s) omitted.`,
    );
  }
  return lines;
}

function isRedirectRecord(record: AuditRecord): boolean {
  const routePath = getRoutePath(record.route);
  const finalPath = getRoutePath(record.finalUrl);
  return Boolean(routePath && finalPath && routePath !== finalPath);
}

function getRoutePath(value?: string): string | null {
  if (!value || (value.includes(":") && !/^https?:\/\//i.test(value)))
    return null;
  try {
    const url = new URL(value, "http://audit.local");
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function truncate(value: string, maxLength = 180): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}...`
    : normalized;
}

function appendNote(existing?: string, next?: string): string | undefined {
  if (!existing) return next;
  if (!next) return existing;
  return `${existing} ${next}`;
}

async function detectBlankOrErrorState(
  page: Page,
): Promise<string | undefined> {
  return page
    .evaluate(() => {
      const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
      const interactiveCount = document.body.querySelectorAll(
        "a,button,input,select,textarea,[role='button'],[role='link']",
      ).length;
      const errorMatch = bodyText.match(
        /(statusCode|Unauthorized|Forbidden|Internal Server Error|Application error|Something went wrong|Failed to Load|Failed to fetch|TypeError:)/i,
      );

      if (errorMatch) {
        return `error text matched '${errorMatch[0]}'`;
      }

      if (bodyText.length < 20 && interactiveCount < 3) {
        return `blank or near-blank body (textLength=${bodyText.length}, interactiveCount=${interactiveCount})`;
      }

      return undefined;
    })
    .catch(() => undefined);
}

async function getScrollCheckpoints(
  page: Page,
): Promise<Array<{ name: string; top: number }>> {
  const scrollInfo = await page.evaluate(() => {
    const main = document.querySelector("main");
    const scrollingElement =
      document.scrollingElement ?? document.documentElement;
    const target =
      main && main.scrollHeight > main.clientHeight + 20
        ? main
        : scrollingElement;

    return {
      maxTop: Math.max(0, target.scrollHeight - target.clientHeight),
    };
  });

  if (scrollInfo.maxTop <= 20) {
    return [{ name: "top", top: 0 }];
  }

  const middle = Math.round(scrollInfo.maxTop / 2);
  return [
    { name: "top", top: 0 },
    { name: "middle", top: middle },
    { name: "bottom", top: scrollInfo.maxTop },
  ];
}

async function setScrollTop(page: Page, top: number): Promise<void> {
  await page.evaluate((nextTop) => {
    const main = document.querySelector("main");
    const scrollingElement =
      document.scrollingElement ?? document.documentElement;
    const target =
      main && main.scrollHeight > main.clientHeight + 20
        ? main
        : scrollingElement;
    target.scrollTo(0, nextTop);
  }, top);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
