#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const enforce = process.argv.includes('--enforce');
const srcRoot = path.resolve(process.cwd(), 'src/services');

const findings = {
  nonNullReturn: [],
  uncheckedRequestJsonReturn: [],
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (entry.isFile() && full.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(srcRoot);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/return\s+[A-Za-z0-9_]+!\s*;/.test(line)) {
      findings.nonNullReturn.push(`${rel}:${i + 1}`);
    }

    const requestMatch = line.match(/const\s+([A-Za-z0-9_]+)\s*=\s*await\s+requestJson<[^>]+>\(/);
    if (!requestMatch) continue;

    const varName = requestMatch[1];
    const windowLines = lines.slice(i, i + 10).join('\n');
    const hasGuard = new RegExp(`if\\s*\\(\\s*!${varName}\\s*\\)`).test(windowLines);
    const hasFallbackReturn = new RegExp(`return\\s+${varName}\\s*\\?\\?`).test(windowLines);
    const directReturn = new RegExp(`return\\s+${varName}\\s*;`).test(windowLines);

    if (directReturn && !hasGuard && !hasFallbackReturn) {
      findings.uncheckedRequestJsonReturn.push(`${rel}:${i + 1}`);
    }
  }
}

const summary = {
  nonNullReturnCount: findings.nonNullReturn.length,
  uncheckedRequestJsonReturnCount: findings.uncheckedRequestJsonReturn.length,
};

console.log('UI Error Hardening Audit');
console.log(JSON.stringify(summary, null, 2));

for (const [kind, list] of Object.entries(findings)) {
  if (list.length === 0) continue;
  console.log(`\n${kind}:`);
  for (const item of list.slice(0, 50)) {
    console.log(`- ${item}`);
  }
  if (list.length > 50) {
    console.log(`- ... ${list.length - 50} more`);
  }
}

const hasFindings = Object.values(summary).some((count) => count > 0);
if (enforce && hasFindings) {
  process.exit(1);
}
