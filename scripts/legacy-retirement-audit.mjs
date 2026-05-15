#!/usr/bin/env node
/**
 * legacy-retirement-audit — P2-014 static route check.
 *
 * Reads the legacy retirement map CSV and asserts:
 *   1. Every row whose migration_action is in the retire-class set has a
 *      non-empty redirect_or_replacement value (the P2-014 acceptance
 *      criterion: "every retired surface has redirect or replacement").
 *   2. Every legacy_file path for a route / component / service / mock /
 *      api-route surface exists in the repo today.
 *   3. deletion_phase is >= redirect_phase using the phase ordering below.
 *
 * Run: `npm run audit:legacy-retirement` (or `node scripts/…mjs`).
 * Exits non-zero on any failure so it can wire into CI later.
 */
import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const UI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const REPO_ROOT = path.resolve(UI_ROOT, "..", "..");
const CSV_PATH = path.join(
  REPO_ROOT,
  "_bmad-output",
  "current-functionality-audit-2026-05-10",
  "legacy-ui-retirement-map-p2-014.csv",
);

const RETIRE_ACTIONS = new Set([
  "redirect",
  "replace",
  "fold",
  "hide",
  "update",
  "delete",
]);

const PHASE_RANK = {
  "Phase 2 (P2-007 done)": 2,
  "Phase 3": 3,
  "Phase 4": 4,
  "Phase 5": 5,
  "Phase 6": 6,
  "Phase 7": 7,
  "Phase 8": 8,
  "Phase 9": 9,
  "n/a": Number.POSITIVE_INFINITY,
  "not deleted": Number.POSITIVE_INFINITY,
  "not deleted (form retained)": Number.POSITIVE_INFINITY,
};

// Surface kinds whose `legacy_file` should exist on disk today.
const ON_DISK_KINDS = new Set([
  "route",
  "component",
  "service",
  "mock",
  "api-route",
]);

function parseCsv(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
      continue;
    }
    if (ch === "\r" && !inQuotes) continue;
    current += ch;
  }
  if (current.length > 0) lines.push(current);

  const splitRow = (row) => {
    const cells = [];
    let cell = "";
    let q = false;
    for (let i = 0; i < row.length; i += 1) {
      const c = row[i];
      if (c === '"') {
        if (q && row[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          q = !q;
        }
        continue;
      }
      if (c === "," && !q) {
        cells.push(cell);
        cell = "";
        continue;
      }
      cell += c;
    }
    cells.push(cell);
    return cells;
  };

  const rows = lines.map(splitRow);
  const header = rows.shift();
  return rows
    .filter((row) => row.length > 1)
    .map((row) =>
      Object.fromEntries(header.map((key, i) => [key, row[i] ?? ""])),
    );
}

async function fileExists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parseCsv(csv);

  const failures = [];

  for (const row of rows) {
    const id = row.surface_id;
    const action = row.migration_action;

    if (RETIRE_ACTIONS.has(action)) {
      if (!row.redirect_or_replacement?.trim()) {
        failures.push(
          `${id}: action="${action}" but redirect_or_replacement is empty (acceptance violation).`,
        );
      }
    } else if (action !== "keep_admin") {
      failures.push(
        `${id}: unknown migration_action="${action}" (expected one of redirect|replace|fold|hide|update|delete|keep_admin).`,
      );
    }

    if (ON_DISK_KINDS.has(row.surface_kind) && row.legacy_file?.trim()) {
      const abs = path.resolve(REPO_ROOT, row.legacy_file.trim());
      if (!(await fileExists(abs))) {
        failures.push(
          `${id}: legacy_file "${row.legacy_file}" not found in repo (path resolution: ${abs}).`,
        );
      }
    }

    const redirectRank = PHASE_RANK[row.redirect_phase];
    const deletionRank = PHASE_RANK[row.deletion_phase];
    if (redirectRank === undefined) {
      failures.push(
        `${id}: redirect_phase="${row.redirect_phase}" not a known phase token.`,
      );
    }
    if (deletionRank === undefined) {
      failures.push(
        `${id}: deletion_phase="${row.deletion_phase}" not a known phase token.`,
      );
    }
    if (
      redirectRank !== undefined &&
      deletionRank !== undefined &&
      deletionRank < redirectRank
    ) {
      failures.push(
        `${id}: deletion_phase="${row.deletion_phase}" precedes redirect_phase="${row.redirect_phase}".`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(
      `legacy-retirement-audit: ${failures.length} failure(s) across ${rows.length} rows`,
    );
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `legacy-retirement-audit: OK — ${rows.length} rows pass acceptance (redirect_or_replacement, legacy_file exists, deletion_phase >= redirect_phase).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
