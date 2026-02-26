#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const workspaceRoot = path.resolve(rootDir, '../..');

const signoffPath = path.join(rootDir, 'docs/uat/non-defi-sprint7-signoff.json');
const vitestConfigPath = path.join(rootDir, 'vitest.config.ts');
const uiWorkflowPath = path.join(workspaceRoot, '.github/workflows/vestledger-ui.yml');
const lighthouseWorkflowPath = path.join(workspaceRoot, '.github/workflows/lighthouse-pr.yml');

const requiredPersonaRoles = ['gp', 'analyst', 'ops', 'ir', 'researcher', 'lp', 'auditor'];
const requiredScenarioIds = [
  'gp_core_journey',
  'analyst_journey',
  'ops_journey',
  'lp_journey',
  'auditor_journey',
  'compliance_journey',
  'document_journey',
  'search_journey',
  'integration_journey',
  'security_journey',
  'accessibility_gates',
  'performance_gates',
  'regression_pack_non_defi',
];

function fail(message) {
  console.error(`- ${message}`);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function checkFileExists(filePath, failures, label) {
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${filePath}`);
  }
}

const failures = [];

checkFileExists(signoffPath, failures, 'UAT signoff file');
checkFileExists(vitestConfigPath, failures, 'Vitest config');
checkFileExists(uiWorkflowPath, failures, 'UI CI workflow');
checkFileExists(lighthouseWorkflowPath, failures, 'Lighthouse CI workflow');

if (failures.length === 0) {
  const signoff = readJson(signoffPath);

  const personaSignoffs = Array.isArray(signoff.personaSignoffs) ? signoff.personaSignoffs : [];
  for (const role of requiredPersonaRoles) {
    const record = personaSignoffs.find((entry) => entry.role === role);
    if (!record) {
      failures.push(`Missing persona signoff for role: ${role}`);
      continue;
    }
    if (record.status !== 'APPROVED') {
      failures.push(`Persona ${role} not approved (status=${record.status})`);
    }
    if (!record.signedBy || !record.signedAt) {
      failures.push(`Persona ${role} missing signedBy/signedAt metadata`);
    }
  }

  const scenarioResults = Array.isArray(signoff.scenarioResults) ? signoff.scenarioResults : [];
  for (const scenarioId of requiredScenarioIds) {
    const scenario = scenarioResults.find((entry) => entry.id === scenarioId);
    if (!scenario) {
      failures.push(`Missing scenario result: ${scenarioId}`);
      continue;
    }
    if (scenario.status !== 'PASS') {
      failures.push(`Scenario ${scenarioId} not passing (status=${scenario.status})`);
    }
  }

  const vitestConfig = readFileSync(vitestConfigPath, 'utf8');
  const thresholdMatches = {
    statements: vitestConfig.match(/statements:\s*(\d+)/),
    branches: vitestConfig.match(/branches:\s*(\d+)/),
    functions: vitestConfig.match(/functions:\s*(\d+)/),
    lines: vitestConfig.match(/lines:\s*(\d+)/),
  };

  for (const [metric, match] of Object.entries(thresholdMatches)) {
    const value = Number(match?.[1] ?? '0');
    if (value < 50) {
      failures.push(`Coverage threshold ${metric} is below Sprint 7 minimum (50): ${value}`);
    }
  }

  const uiWorkflow = readFileSync(uiWorkflowPath, 'utf8');
  const requiredUiWorkflowSnippets = [
    'audit:security:enforce',
    'audit:secrets:enforce',
    'audit:placeholders:enforce',
    'audit:service-implementation:enforce',
    'audit:observability:enforce',
    'audit:visual-regression:enforce',
    'test:cov',
    'playwright:critical',
  ];
  for (const snippet of requiredUiWorkflowSnippets) {
    if (!uiWorkflow.includes(snippet)) {
      failures.push(`UI workflow missing required gate: ${snippet}`);
    }
  }

  const lighthouseWorkflow = readFileSync(lighthouseWorkflowPath, 'utf8');
  const requiredLighthouseSnippets = ['lighthouse:public', 'lighthouse:auth'];
  for (const snippet of requiredLighthouseSnippets) {
    if (!lighthouseWorkflow.includes(snippet)) {
      failures.push(`Lighthouse workflow missing required run: ${snippet}`);
    }
  }
}

console.log('\nRelease Readiness Audit');
console.log('=======================');
console.log(`signoff_file: ${existsSync(signoffPath) ? 'present' : 'missing'}`);
console.log(`vitest_config: ${existsSync(vitestConfigPath) ? 'present' : 'missing'}`);
console.log(`ui_workflow: ${existsSync(uiWorkflowPath) ? 'present' : 'missing'}`);
console.log(`lighthouse_workflow: ${existsSync(lighthouseWorkflowPath) ? 'present' : 'missing'}`);

if (failures.length > 0) {
  console.error('\nRelease readiness enforcement failed:');
  for (const failure of failures) {
    fail(failure);
  }
  process.exit(1);
}

console.log('\nEnforcement passed: Sprint 7 release readiness gates are satisfied.');
