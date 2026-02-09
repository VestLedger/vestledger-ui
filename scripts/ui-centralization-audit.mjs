#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const baselinePath = path.join(
  rootDir,
  'docs/ui/component-library-migration-baseline.json'
);

const ENFORCE_FLAG = '--enforce';
const shouldEnforce = process.argv.includes(ENFORCE_FLAG);

const skipDirs = new Set([
  '.git',
  '.next',
  'node_modules',
  'playwright-report',
  'test-results',
  '.pnpm-store',
]);

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

function isTestFile(filePath) {
  return (
    filePath.includes('/__tests__/') ||
    filePath.endsWith('.test.ts') ||
    filePath.endsWith('.test.tsx') ||
    filePath.endsWith('.spec.ts') ||
    filePath.endsWith('.spec.tsx')
  );
}

const sourceFiles = [
  ...walkFiles(path.join(rootDir, 'src')),
  ...walkFiles(path.join(rootDir, 'app')),
];

const nextUiFeatureImportFiles = [];
const rawControlFiles = new Set();
const legacyComponentsUiImportFiles = [];
let rawControlLineCount = 0;

const rawControlPattern = /<\s*(input|select|textarea)\b/;
const legacyImportPattern = /from\s+['"]@\/components\/ui(?:\/[^'"]*)?['"]/;

for (const absoluteFilePath of sourceFiles) {
  const relativePath = toPosixPath(path.relative(rootDir, absoluteFilePath));
  const fileContent = readFileSync(absoluteFilePath, 'utf8');

  if (
    fileContent.includes('@nextui-org/react') &&
    !relativePath.startsWith('src/ui/') &&
    relativePath !== 'app/providers-root.tsx' &&
    !isTestFile(relativePath)
  ) {
    nextUiFeatureImportFiles.push(relativePath);
  }

  if (
    relativePath.startsWith('src/components/') &&
    relativePath.endsWith('.tsx') &&
    !relativePath.startsWith('src/ui/')
  ) {
    const lines = fileContent.split('\n');
    let fileHasRawControl = false;

    for (const line of lines) {
      if (rawControlPattern.test(line)) {
        rawControlLineCount += 1;
        fileHasRawControl = true;
      }
    }

    if (fileHasRawControl) {
      rawControlFiles.add(relativePath);
    }
  }

  if (
    legacyImportPattern.test(fileContent) &&
    !relativePath.startsWith('src/components/ui/')
  ) {
    legacyComponentsUiImportFiles.push(relativePath);
  }
}

nextUiFeatureImportFiles.sort();
legacyComponentsUiImportFiles.sort();

const metrics = {
  nextui_feature_import_files: nextUiFeatureImportFiles.length,
  raw_control_lines_in_features: rawControlLineCount,
  legacy_components_ui_import_files: legacyComponentsUiImportFiles.length,
};

console.log('\nUI Centralization Audit');
console.log('=======================');
console.log(`nextui_feature_import_files: ${metrics.nextui_feature_import_files}`);
console.log(`raw_control_lines_in_features: ${metrics.raw_control_lines_in_features}`);
console.log(
  `legacy_components_ui_import_files: ${metrics.legacy_components_ui_import_files}`
);

if (nextUiFeatureImportFiles.length > 0) {
  console.log('\nNextUI imports outside src/ui (current exceptions included):');
  for (const file of nextUiFeatureImportFiles) {
    console.log(`- ${file}`);
  }
}

if (rawControlFiles.size > 0) {
  console.log('\nFeature files containing raw controls:');
  for (const file of Array.from(rawControlFiles).sort()) {
    console.log(`- ${file}`);
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
      failures.push(
        `${metricName}: baseline threshold missing (current=${currentValue})`
      );
      continue;
    }
    if (currentValue > allowed) {
      failures.push(
        `${metricName}: current=${currentValue}, allowed<=${allowed}`
      );
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
