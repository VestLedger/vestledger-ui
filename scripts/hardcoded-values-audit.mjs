#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const baselinePath = path.join(rootDir, 'docs/hardcoded-values-baseline.json');
const shouldEnforce = process.argv.includes('--enforce');

const skipDirs = new Set([
  '.git',
  '.next',
  'node_modules',
  'playwright-report',
  'test-results',
  '.pnpm-store',
]);

const DOMAIN_FALLBACK_PATTERNS = [
  /vestledger\.local:3000/,
  /app\.vestledger\.local:3000/,
  /http:\/\/localhost:3000/,
  /\blocalhost:3000\b/,
];

const ROUTE_LITERAL_PATTERN =
  /routePath\s*=\s*["']\/|router\.push\(\s*["']\/|window\.open\(\s*["']\/|navigate\(\s*["']\//;

const LOCALE_CURRENCY_PATTERN = /["']en-US["']|["']USD["']/;

const DOMAIN_ALLOWLIST = new Set(['src/config/env.ts']);
const LOCALE_ALLOWLIST = new Set(['src/config/i18n.ts']);

const MAGIC_NUMBER_TARGET_FILES = new Set([
  'src/components/fund-admin/distributions/distribution-wizard.tsx',
  'src/components/waterfall/sensitivity-panel.tsx',
  'src/components/waterfall/waterfall-modeling.tsx',
  'src/components/dashboard-v2.tsx',
]);

const ALLOWED_NUMERIC_PROPERTY_KEYS = new Set([
  'confidence',
  'left',
  'right',
  'top',
  'bottom',
  'fontSize',
  'width',
  'height',
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  'strokeWidth',
]);

const ALLOWED_NUMERIC_JSX_ATTRIBUTES = new Set([
  'width',
  'height',
  'strokeWidth',
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

function collectPatternHits(relativePath, content, pattern) {
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

function isUpperConstNumericLiteral(node) {
  let current = node.parent;
  while (current) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
      const declarationList = current.parent;
      if (!declarationList || !ts.isVariableDeclarationList(declarationList)) break;
      const isConst = (ts.getCombinedNodeFlags(declarationList) & ts.NodeFlags.Const) !== 0;
      if (!isConst) break;
      return /^[A-Z0-9_]+$/.test(current.name.text);
    }
    current = current.parent;
  }
  return false;
}

function hasAncestor(node, matcher) {
  let current = node.parent;
  while (current) {
    if (matcher(current)) return true;
    current = current.parent;
  }
  return false;
}

function getPropertyAssignmentName(node) {
  if (!ts.isPropertyAssignment(node)) return null;
  if (ts.isIdentifier(node.name)) return node.name.text;
  if (ts.isStringLiteral(node.name)) return node.name.text;
  return null;
}

function collectMagicNumberIssues(relativePath, absolutePath) {
  const content = readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    relativePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const issues = [];

  function visit(node) {
    if (ts.isNumericLiteral(node)) {
      const numericValue = Number(node.text);

      if (numericValue === 0 || numericValue === 1) {
        ts.forEachChild(node, visit);
        return;
      }

      if (isUpperConstNumericLiteral(node)) {
        ts.forEachChild(node, visit);
        return;
      }

      if (hasAncestor(node, (ancestor) => ts.isCaseClause(ancestor))) {
        ts.forEachChild(node, visit);
        return;
      }

      if (
        hasAncestor(
          node,
          (ancestor) =>
            ts.isCallExpression(ancestor) &&
            ts.isPropertyAccessExpression(ancestor.expression) &&
            ancestor.expression.name.text === 'toFixed'
        )
      ) {
        ts.forEachChild(node, visit);
        return;
      }

      const parentPropertyName = getPropertyAssignmentName(node.parent);
      if (parentPropertyName && ALLOWED_NUMERIC_PROPERTY_KEYS.has(parentPropertyName)) {
        ts.forEachChild(node, visit);
        return;
      }

      if (
        hasAncestor(
          node,
          (ancestor) =>
            ts.isJsxAttribute(ancestor) &&
            ts.isIdentifier(ancestor.name) &&
            ALLOWED_NUMERIC_JSX_ATTRIBUTES.has(ancestor.name.text)
        )
      ) {
        ts.forEachChild(node, visit);
        return;
      }

      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const snippet = content.split('\n')[line]?.trim() ?? '';
      issues.push({
        file: relativePath,
        line: line + 1,
        snippet,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return issues;
}

const sourceFiles = [
  ...walkFiles(path.join(rootDir, 'src')),
  ...walkFiles(path.join(rootDir, 'app')),
];

const domainFallbackHits = [];
const routeLiteralHits = [];
const localeCurrencyHits = [];
const magicNumberHits = [];

for (const absoluteFilePath of sourceFiles) {
  const relativePath = toPosixPath(path.relative(rootDir, absoluteFilePath));
  if (isTestFile(relativePath) || relativePath.includes('/data/mocks/')) {
    continue;
  }

  const content = readFileSync(absoluteFilePath, 'utf8');

  if (!DOMAIN_ALLOWLIST.has(relativePath)) {
    const domainPattern = new RegExp(DOMAIN_FALLBACK_PATTERNS.map((p) => p.source).join('|'));
    domainFallbackHits.push(...collectPatternHits(relativePath, content, domainPattern));
  }

  if (relativePath.startsWith('src/components/')) {
    routeLiteralHits.push(...collectPatternHits(relativePath, content, ROUTE_LITERAL_PATTERN));
  }

  if (!LOCALE_ALLOWLIST.has(relativePath)) {
    localeCurrencyHits.push(...collectPatternHits(relativePath, content, LOCALE_CURRENCY_PATTERN));
  }

  if (MAGIC_NUMBER_TARGET_FILES.has(relativePath)) {
    magicNumberHits.push(...collectMagicNumberIssues(relativePath, absoluteFilePath));
  }
}

const metrics = {
  domain_api_fallback_literals_outside_config: domainFallbackHits.length,
  hardcoded_route_literals_in_features: routeLiteralHits.length,
  locale_currency_literals_outside_config: localeCurrencyHits.length,
  magic_numeric_defaults_in_runtime_logic: magicNumberHits.length,
};

console.log('\nHardcoded Values Audit');
console.log('======================');
for (const [metricName, value] of Object.entries(metrics)) {
  console.log(`${metricName}: ${value}`);
}

function printHits(title, hits) {
  if (hits.length === 0) return;
  console.log(`\n${title}:`);
  for (const hit of hits) {
    console.log(`- ${hit.file}:${hit.line} ${hit.snippet}`);
  }
}

printHits('Domain/API fallback literal hits', domainFallbackHits);
printHits('Route literal hits', routeLiteralHits);
printHits('Locale/Currency literal hits', localeCurrencyHits);
printHits('Magic numeric default hits', magicNumberHits);

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
