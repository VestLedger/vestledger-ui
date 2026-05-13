#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const workspaceRoot = path.resolve(rootDir, "..", "..");
const srcDir = path.join(rootDir, "src");
const shouldEnforce = process.argv.includes("--enforce");
const inventoryPath = path.join(
  workspaceRoot,
  "_bmad-output/current-functionality-audit-2026-05-10/service-truth-inventory-p1-002.csv",
);

const DEMO_DATA_MODULE_PATTERN = /["'](@\/data\/(?:mocks|seeds)[^"']*)["']/g;

const APPROVED_RUNTIME_DEMO_BOUNDARY_FILES = new Set([
  "src/config/decision-writer-options.ts",
  "src/components/dashboard-v2.tsx",
  "src/components/dashboard/home-action-center.tsx",
  "src/components/dashboard/home-dashboard-helpers.ts",
  "src/components/dashboard/home-executive-overview.tsx",
  "src/components/waterfall/waterfall-modeling.tsx",
  "src/store/slices/backOfficeSlice.ts",
  "src/store/slices/dashboardsSlice.ts",
  "src/store/slices/miscSlice.ts",
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walkFiles(dirPath, files = []) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "data") continue;
      walkFiles(absolutePath, files);
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      files.push(absolutePath);
    }
  }

  return files;
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((values) =>
    Object.fromEntries(
      header.map((name, index) => [name, values[index] ?? ""]),
    ),
  );
}

function loadApprovedServiceFiles() {
  if (!existsSync(inventoryPath)) {
    throw new Error(
      `Missing service truth inventory: ${toPosix(
        path.relative(workspaceRoot, inventoryPath),
      )}`,
    );
  }

  const rows = parseCsv(readFileSync(inventoryPath, "utf8"));
  return new Set(
    rows
      .filter((row) => row.service_classification !== "api-only")
      .map((row) => row.file.replace(/^apps\/vestledger-ui\//, ""))
      .filter(Boolean),
  );
}

function isTestFile(relativePath) {
  return (
    relativePath.includes("/__tests__/") ||
    /\.(test|spec)\.(ts|tsx)$/.test(relativePath)
  );
}

function isTypeOnlyImport(statement) {
  const normalized = statement.trim().replace(/\s+/g, " ");
  if (normalized.startsWith("import type ")) return true;
  if (normalized.startsWith("export type ")) return true;
  if (/^type\s+\w+/.test(normalized) && normalized.includes("import(")) {
    return true;
  }
  return false;
}

function extractStatements(content) {
  const statements = [];
  let start = 0;

  for (let index = 0; index < content.length; index += 1) {
    if (content[index] !== ";") continue;

    const statement = content.slice(start, index + 1);
    if (
      statement.includes("@/data/mocks") ||
      statement.includes("@/data/seeds")
    ) {
      statements.push({ statement, index: start });
    }

    start = index + 1;
  }

  return statements;
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
}

const approvedServiceFiles = loadApprovedServiceFiles();
const violations = [];
const hits = [];
let typeOnlyHits = 0;
let approvedRuntimeHits = 0;

for (const absoluteFile of walkFiles(srcDir)) {
  const relativePath = toPosix(path.relative(rootDir, absoluteFile));
  const content = readFileSync(absoluteFile, "utf8");

  for (const { statement, index } of extractStatements(content)) {
    for (const match of statement.matchAll(DEMO_DATA_MODULE_PATTERN)) {
      const modulePath = match[1];
      const moduleIndex = index + (match.index ?? 0);
      const hit = {
        file: relativePath,
        line: lineNumberFor(content, moduleIndex),
        modulePath,
        typeOnly: isTypeOnlyImport(statement),
      };
      hits.push(hit);

      if (hit.typeOnly || isTestFile(relativePath)) {
        typeOnlyHits += 1;
        continue;
      }

      const isApprovedRuntimeBoundary =
        approvedServiceFiles.has(relativePath) ||
        APPROVED_RUNTIME_DEMO_BOUNDARY_FILES.has(relativePath);

      if (isApprovedRuntimeBoundary) {
        approvedRuntimeHits += 1;
        continue;
      }

      violations.push(hit);
    }
  }
}

console.log("\nNo Silent Mock Boundary Audit");
console.log("=============================");
console.log(`demo_data_import_hits: ${hits.length}`);
console.log(`type_or_test_import_hits: ${typeOnlyHits}`);
console.log(`approved_runtime_demo_import_hits: ${approvedRuntimeHits}`);
console.log(`violations: ${violations.length}`);

if (violations.length > 0) {
  console.log("\nRuntime demo imports outside approved boundary:");
  for (const violation of violations) {
    console.log(
      `- ${violation.file}:${violation.line} imports ${violation.modulePath}`,
    );
  }
}

if (violations.length > 0 && shouldEnforce) {
  process.exit(1);
}
