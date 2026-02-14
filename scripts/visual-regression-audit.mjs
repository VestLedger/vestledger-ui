#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const shouldEnforce = process.argv.includes('--enforce');
const failures = [];

const visualSpecPath = path.join(rootDir, 'e2e/visual/non-defi-ui-visual.spec.ts');
const visualSnapshotDir = path.join(
  rootDir,
  'e2e/visual/non-defi-ui-visual.spec.ts-snapshots'
);
const packageJsonPath = path.join(rootDir, 'package.json');

if (!existsSync(visualSpecPath)) {
  failures.push(`Visual regression spec missing: ${visualSpecPath}`);
}

if (!existsSync(visualSnapshotDir)) {
  failures.push(`Visual regression snapshot directory missing: ${visualSnapshotDir}`);
}

if (!existsSync(packageJsonPath)) {
  failures.push(`Missing package manifest: ${packageJsonPath}`);
} else {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts ?? {};
  if (!scripts['playwright:visual']) {
    failures.push('package.json is missing playwright:visual script');
  }
}

let snapshotCount = 0;
if (existsSync(visualSnapshotDir)) {
  snapshotCount = readdirSync(visualSnapshotDir).filter((entry) => entry.endsWith('.png')).length;
  if (snapshotCount < 5) {
    failures.push(`Expected at least 5 visual baseline snapshots, found ${snapshotCount}`);
  }
}

console.log('\nVisual Regression Audit');
console.log('=======================');
console.log(`visual_spec: ${existsSync(visualSpecPath) ? 'present' : 'missing'}`);
console.log(`visual_snapshots: ${existsSync(visualSnapshotDir) ? snapshotCount : 0}`);
console.log(`package_json: ${existsSync(packageJsonPath) ? 'present' : 'missing'}`);

if (shouldEnforce && failures.length > 0) {
  console.error('\nVisual regression enforcement failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (failures.length > 0) {
  console.warn('\nVisual regression findings:');
  for (const failure of failures) {
    console.warn(`- ${failure}`);
  }
} else {
  console.log('\nAudit passed: visual regression scaffolding is present.');
}
