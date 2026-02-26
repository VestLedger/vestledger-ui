#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const shouldEnforce = process.argv.includes('--enforce');
const failures = [];

function checkFile(filePath, label) {
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${filePath}`);
  }
}

const webVitalsComponentPath = path.join(rootDir, 'app/web-vitals.tsx');
const webVitalsServicePath = path.join(rootDir, 'src/services/observability/webVitalsService.ts');
const webVitalsRoutePath = path.join(rootDir, 'app/api/observability/web-vitals/route.ts');
const packageJsonPath = path.join(rootDir, 'package.json');

checkFile(webVitalsComponentPath, 'Web-vitals component');
checkFile(webVitalsServicePath, 'Web-vitals service');
checkFile(webVitalsRoutePath, 'Web-vitals API route');
checkFile(packageJsonPath, 'Package manifest');

if (existsSync(webVitalsComponentPath)) {
  const content = readFileSync(webVitalsComponentPath, 'utf8');
  if (!content.includes('reportWebVitalMetric')) {
    failures.push('app/web-vitals.tsx must delegate metrics to reportWebVitalMetric');
  }
}

if (existsSync(webVitalsServicePath)) {
  const content = readFileSync(webVitalsServicePath, 'utf8');
  if (!content.includes('/api/observability/web-vitals')) {
    failures.push('webVitalsService.ts must post metrics to /api/observability/web-vitals');
  }
}

if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts ?? {};
  if (!scripts['audit:observability']) {
    failures.push('package.json is missing audit:observability script');
  }
}

console.log('\nObservability Audit');
console.log('===================');
console.log(`web_vitals_component: ${existsSync(webVitalsComponentPath) ? 'present' : 'missing'}`);
console.log(`web_vitals_service: ${existsSync(webVitalsServicePath) ? 'present' : 'missing'}`);
console.log(`web_vitals_route: ${existsSync(webVitalsRoutePath) ? 'present' : 'missing'}`);
console.log(`package_json: ${existsSync(packageJsonPath) ? 'present' : 'missing'}`);

if (shouldEnforce && failures.length > 0) {
  console.error('\nObservability enforcement failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (failures.length > 0) {
  console.warn('\nObservability findings:');
  for (const failure of failures) {
    console.warn(`- ${failure}`);
  }
} else {
  console.log('\nAudit passed: observability essentials are wired.');
}
