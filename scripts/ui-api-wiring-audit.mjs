#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const workspaceRoot = path.resolve(rootDir, '..', '..');
const shouldEnforce = process.argv.includes('--enforce');

const auditPath = path.join(workspaceRoot, 'docs', 'audits', 'ui-api-wiring-audit-2026-02-19.csv');
const resolutionPath = path.join(
  workspaceRoot,
  'docs',
  'audits',
  'ui-api-wiring-resolution-2026-02-20.csv'
);

const ALLOWED_STATUSES = new Set([
  'wired_to_existing_api',
  'wired_to_navigation_or_state',
  'guarded_todo_api',
]);

const RUNTIME_MOCK_IMPORT_PATTERN = /@\/data\/mocks/;
const SERVICE_MOCK_FALLBACK_PATTERNS = [
  /\bgetBaseMockSnapshot\b/,
  /\bgetCachedOrMockSnapshot\b/,
  /\bgetMock[A-Za-z0-9_]*\b/,
  /return\s+clone\(\s*mock[A-Za-z0-9_]*\s*\)/,
  /return\s+mock[A-Za-z0-9_]*/,
  /\?\?\s*getMock[A-Za-z0-9_]*\(/,
  /mock_fallback/i,
];

// Temporary exemption: AI service endpoints are not implemented yet.
// Keep this narrowly scoped to audited AI service files only.
const EXEMPT_AUDIT_PATH_PATTERNS = [
  /^apps\/vestledger-ui\/src\/services\/ai\//,
];

function isPathExemptFromMockEnforcement(relativePath) {
  return EXEMPT_AUDIT_PATH_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function parseCsv(text) {
  const rows = [];
  let currentField = '';
  let currentRow = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          currentField += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
      continue;
    }

    if (ch === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      continue;
    }

    if (ch === '\r') {
      continue;
    }

    currentField += ch;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const [header, ...rest] = rows;
  return rest.map((fields) =>
    Object.fromEntries(header.map((name, idx) => [name, fields[idx] ?? '']))
  );
}

if (!existsSync(auditPath)) {
  console.error(`Missing audit file: ${toPosixPath(path.relative(workspaceRoot, auditPath))}`);
  process.exit(1);
}

if (!existsSync(resolutionPath)) {
  console.error(`Missing resolution file: ${toPosixPath(path.relative(workspaceRoot, resolutionPath))}`);
  process.exit(1);
}

const auditRows = parseCsv(readFileSync(auditPath, 'utf8'));
const resolutionRows = parseCsv(readFileSync(resolutionPath, 'utf8'));

const resolutionById = new Map(
  resolutionRows.map((row) => [row.id, row])
);

const failures = [];
const unresolvedRows = [];
const invalidStatusRows = [];

for (let index = 0; index < auditRows.length; index += 1) {
  const row = auditRows[index];
  const id = row.id || `ui-api-${String(index + 1).padStart(3, '0')}`;

  const resolved = resolutionById.get(id);
  if (!resolved) {
    unresolvedRows.push(id);
    continue;
  }

  if (!ALLOWED_STATUSES.has(resolved.status)) {
    invalidStatusRows.push(`${id}:${resolved.status}`);
  }
}

if (unresolvedRows.length > 0) {
  failures.push(`Unresolved findings: ${unresolvedRows.length}`);
}

if (invalidStatusRows.length > 0) {
  failures.push(`Invalid statuses: ${invalidStatusRows.join(', ')}`);
}

const auditedRuntimeFiles = Array.from(
  new Set(
    auditRows
      .map((row) => row.file)
      .filter(Boolean)
      .map((file) => file.replace(/^\/+/, '/'))
  )
);

const runtimeMockImportHits = [];
const serviceFallbackHits = [];
const exemptRuntimeMockImportHits = [];
const exemptServiceFallbackHits = [];

for (const absoluteFile of auditedRuntimeFiles) {
  if (!existsSync(absoluteFile)) {
    failures.push(`Audited file missing on disk: ${absoluteFile}`);
    continue;
  }

  const content = readFileSync(absoluteFile, 'utf8');
  const rel = toPosixPath(path.relative(workspaceRoot, absoluteFile));
  const isServiceFile = rel.includes('/src/services/');
  const isExempt = isPathExemptFromMockEnforcement(rel);

  if (RUNTIME_MOCK_IMPORT_PATTERN.test(content)) {
    if (isExempt) {
      exemptRuntimeMockImportHits.push(rel);
    } else {
      runtimeMockImportHits.push(rel);
    }
  }

  if (isServiceFile) {
    for (const pattern of SERVICE_MOCK_FALLBACK_PATTERNS) {
      if (pattern.test(content)) {
        if (isExempt) {
          exemptServiceFallbackHits.push(`${rel} :: ${pattern}`);
        } else {
          serviceFallbackHits.push(`${rel} :: ${pattern}`);
        }
        break;
      }
    }
  }
}

if (runtimeMockImportHits.length > 0) {
  failures.push(`Audited runtime files importing mocks: ${runtimeMockImportHits.length}`);
}

if (serviceFallbackHits.length > 0) {
  failures.push(`Audited service files still containing mock fallback markers: ${serviceFallbackHits.length}`);
}

console.log('\nUI API Wiring Audit');
console.log('===================');
console.log(`audit_rows: ${auditRows.length}`);
console.log(`resolution_rows: ${resolutionRows.length}`);
console.log(`unresolved_rows: ${unresolvedRows.length}`);
console.log(`runtime_mock_import_hits: ${runtimeMockImportHits.length}`);
console.log(`service_fallback_hits: ${serviceFallbackHits.length}`);
console.log(`exempt_runtime_mock_import_hits: ${exemptRuntimeMockImportHits.length}`);
console.log(`exempt_service_fallback_hits: ${exemptServiceFallbackHits.length}`);

if (runtimeMockImportHits.length > 0) {
  console.log('\nRuntime mock import hits:');
  for (const hit of runtimeMockImportHits) {
    console.log(`- ${hit}`);
  }
}

if (serviceFallbackHits.length > 0) {
  console.log('\nService fallback hits:');
  for (const hit of serviceFallbackHits) {
    console.log(`- ${hit}`);
  }
}

if (exemptRuntimeMockImportHits.length > 0) {
  console.log('\nExempt runtime mock import hits (AI service exemption):');
  for (const hit of exemptRuntimeMockImportHits) {
    console.log(`- ${hit}`);
  }
}

if (exemptServiceFallbackHits.length > 0) {
  console.log('\nExempt service fallback hits (AI service exemption):');
  for (const hit of exemptServiceFallbackHits) {
    console.log(`- ${hit}`);
  }
}

if (shouldEnforce && failures.length > 0) {
  console.error('\nEnforcement failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (shouldEnforce) {
  console.log('\nEnforcement passed.');
}
