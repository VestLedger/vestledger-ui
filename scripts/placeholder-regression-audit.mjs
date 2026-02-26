#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const baselinePath = path.join(rootDir, 'scripts/placeholder-patterns-baseline.json');
const shouldEnforce = process.argv.includes('--enforce');

const skipDirs = new Set([
  '.git',
  '.next',
  'node_modules',
  'playwright-report',
  'test-results',
  '.pnpm-store',
]);

const PLACEHOLDER_PATTERNS = {
  placeholder_console_log_calls: /\bconsole\.log\s*\(/,
  placeholder_todo_markers: /\bTODO\b/,
  placeholder_coming_soon_markers: /\bcoming soon\b/i,
  placeholder_to_be_implemented_markers: /\bto be implemented\b/i,
  placeholder_not_implemented_markers: /\bnot implemented yet\b/i,
};

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkFiles(dirPath, allFiles = []) {
  if (!existsSync(dirPath)) return allFiles;

  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walkFiles(path.join(dirPath, entry.name), allFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) continue;
    allFiles.push(path.join(dirPath, entry.name));
  }

  return allFiles;
}

function isTestFile(relativePath) {
  return (
    relativePath.includes('/__tests__/') ||
    relativePath.endsWith('.test.ts') ||
    relativePath.endsWith('.test.tsx') ||
    relativePath.endsWith('.spec.ts') ||
    relativePath.endsWith('.spec.tsx')
  );
}

function isProductionRouteFile(relativePath) {
  if (isTestFile(relativePath)) return false;

  if (relativePath.startsWith('src/components/')) {
    return true;
  }

  if (relativePath.startsWith('app/')) {
    return relativePath.endsWith('/page.ts') || relativePath.endsWith('/page.tsx');
  }

  return false;
}

function collectHits(relativePath, content, pattern) {
  const hits = [];
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (pattern.test(line)) {
      hits.push({
        file: relativePath,
        line: index + 1,
        snippet: line.trim(),
      });
    }
  }
  return hits;
}

const sourceFiles = [
  ...walkFiles(path.join(rootDir, 'src', 'components')),
  ...walkFiles(path.join(rootDir, 'app')),
];

const scopedFiles = sourceFiles
  .map((absolutePath) => ({
    absolutePath,
    relativePath: toPosixPath(path.relative(rootDir, absolutePath)),
  }))
  .filter(({ relativePath }) => isProductionRouteFile(relativePath));

const findings = Object.fromEntries(
  Object.keys(PLACEHOLDER_PATTERNS).map((key) => [key, []])
);

for (const { absolutePath, relativePath } of scopedFiles) {
  const content = readFileSync(absolutePath, 'utf8');
  for (const [metricName, pattern] of Object.entries(PLACEHOLDER_PATTERNS)) {
    findings[metricName].push(...collectHits(relativePath, content, pattern));
  }
}

const metrics = Object.fromEntries(
  Object.entries(findings).map(([metricName, hits]) => [metricName, hits.length])
);

console.log('\nPlaceholder Regression Audit');
console.log('============================');
console.log(`scanned_files: ${scopedFiles.length}`);
for (const [metricName, value] of Object.entries(metrics)) {
  console.log(`${metricName}: ${value}`);
}

for (const [metricName, hits] of Object.entries(findings)) {
  if (hits.length === 0) continue;
  console.log(`\n${metricName}:`);
  for (const hit of hits) {
    console.log(`- ${hit.file}:${hit.line} ${hit.snippet}`);
  }
}

if (shouldEnforce) {
  if (!existsSync(baselinePath)) {
    console.error(`\nMissing baseline file: ${toPosixPath(path.relative(rootDir, baselinePath))}`);
    process.exit(1);
  }

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const thresholds = baseline.thresholds ?? {};
  const failures = [];

  for (const [metricName, currentValue] of Object.entries(metrics)) {
    const allowed = thresholds[metricName];
    if (typeof allowed !== 'number') {
      failures.push(`${metricName}: baseline threshold missing (current=${currentValue})`);
      continue;
    }

    if (currentValue > allowed) {
      failures.push(`${metricName}: current=${currentValue}, allowed<=${allowed}`);
    }
  }

  if (failures.length > 0) {
    console.error('\nEnforcement failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nEnforcement passed: all metrics are within baseline thresholds.');
}
