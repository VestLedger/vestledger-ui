#!/usr/bin/env node
/**
 * Find button handlers (onClick/onPress) whose body is effectively a stub:
 *   - shows a toast / alert / console.log
 *   - dispatches no service call, no router push, no setState propagation
 *
 * Heuristic, not exact. Uses regex over .tsx files. Triage findings manually.
 *
 * Modes:
 *   node scripts/find-stub-buttons.mjs           # list current findings, exit 0
 *   node scripts/find-stub-buttons.mjs --check   # compare to baseline; fail
 *                                                # on any NEW stub. Used in CI.
 *   node scripts/find-stub-buttons.mjs --update  # rewrite the baseline to
 *                                                # match current findings.
 */
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

// Files to scan
const files = execFileSync(
  "find",
  [
    SRC,
    "-name",
    "*.tsx",
    "-not",
    "-path",
    "*/__tests__/*",
    "-not",
    "-path",
    "*/cypress/*",
  ],
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);

// Match the START of an arrow handler. We extract the body manually with
// brace-counting because a non-greedy `\{[\s\S]*?\}` stops at the first inner
// `}` and produces false positives on bodies containing `if (...) { ... }`.
//   Group 1: handler kind (onClick|onPress)
const handlerRegex =
  /\b(onClick|onPress)=\{\s*(?:async\s*)?(?:\(\s*\)|\(\s*\w[^)]*\))\s*=>\s*/g;

// Extract the handler body starting at `start`. Returns the body string,
// including outer braces if the body is a block, plus the byte offset where
// the body ends.
function extractBody(text, start) {
  if (text[start] === "{") {
    let depth = 0;
    for (let i = start; i < text.length; i += 1) {
      const c = text[i];
      if (c === "{") depth += 1;
      else if (c === "}") {
        depth -= 1;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    return text.slice(start);
  }
  // Single-expression body: read until top-level `,`, `)`, `}` or newline.
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (c === "(" || c === "{" || c === "[") depth += 1;
    else if (c === ")" || c === "}" || c === "]") {
      if (depth === 0) return text.slice(start, i);
      depth -= 1;
    } else if (depth === 0 && (c === "," || c === "\n")) {
      return text.slice(start, i);
    }
  }
  return text.slice(start);
}

// "Real work" signals — if body contains any of these the handler is doing
// something. Each pattern requires either an open paren or a property access
// to avoid matching plain words inside string literals (e.g. the word
// "approved" inside a toast message).
const REAL_WORK = [
  /\bawait\s/,
  /\bdispatch\s*\(/,
  /\brouter\.(push|replace|back)/,
  /\bset[A-Z]\w*\s*\(/, // useState setters: setOpen, setStatus, ...
  /\bpatch[A-Z]\w*\s*\(/,
  /\bnavigate\s*\(/,
  /\bopen\s*\(/, // useDisclosure, window.open
  /\bclose\s*\(/,
  /\bsubmit\w*\s*\(/,
  /\bcreate\w*\s*\(/,
  /\bupdate\w*\s*\(/,
  /\bdelete\w*\s*\(/,
  /\bfetch\w*\s*\(/,
  /\bget\w*\s*\(/,
  /\bcalculate\w*\s*\(/,
  /\bapprove\w*\s*\(/,
  /\breject\w*\s*\(/,
  /\bexport\w*\s*\(/,
  /\brun\w*\s*\(/,
  /\bemit\w*\s*\(/,
  /\.\w+Operation\s*\(/, // dispatch(fooOperation(...))
  // Custom prop callbacks the parent provides (e.g. onAddExpense, onSelect)
  /\bon[A-Z]\w*\s*\(/,
];

// "Stub work" signals — body only contains these.
const STUB_WORK = [/\btoast\./, /\bshowToast\b/, /\bconsole\./, /\balert\(/];

// Allow-list — handlers whose only purpose is to display a notification
// (e.g. global error-toast bridges). One entry per `file:handlerName`.
const ALLOWED_STUBS = new Set([
  "src/components/errors/RecoverableToastBridge.tsx:handleEvent",
]);

// Named handler stubs (start of declaration only — body extracted via brace
// counting in extractBody). Group 1: handler name.
const namedHandlerRegex =
  /\bconst\s+(handle\w+|on[A-Z]\w*|run[A-Z]\w*|trigger[A-Z]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*/g;

let totalFlagged = 0;
const flagged = [];

function evaluateBody(body, file, lineNumber, kind, name) {
  if (!body) return;
  const hasStub = STUB_WORK.some((rx) => rx.test(body));
  if (!hasStub) return;
  const hasReal = REAL_WORK.some((rx) => rx.test(body));
  if (hasReal) return;

  const relativeFile = path.relative(ROOT, file);
  if (name && ALLOWED_STUBS.has(`${relativeFile}:${name}`)) return;

  flagged.push({
    file: relativeFile,
    line: lineNumber,
    kind: name ? `${kind} ${name}` : kind,
    body: body.replace(/\s+/g, " ").trim().slice(0, 160),
  });
  totalFlagged += 1;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

for (const file of files) {
  const text = await readFile(file, "utf8");

  let inline;
  while ((inline = handlerRegex.exec(text)) !== null) {
    const bodyStart = handlerRegex.lastIndex;
    const body = extractBody(text, bodyStart);
    evaluateBody(body, file, lineOf(text, inline.index), inline[1]);
  }

  let named;
  while ((named = namedHandlerRegex.exec(text)) !== null) {
    const bodyStart = namedHandlerRegex.lastIndex;
    const body = extractBody(text, bodyStart);
    evaluateBody(body, file, lineOf(text, named.index), "handler", named[1]);
  }
}

// ---------------------------------------------------------------------------
// Identity, baseline, and diff modes
// ---------------------------------------------------------------------------

// Stable identity per finding so the baseline survives renumbering. Named
// handlers use `file:handlerName`; anonymous inline handlers fall back to
// `file:line:kind` because they have no other stable handle.
function identityFor(entry) {
  // entry.kind looks like "onPress" or "handler handleSendK1".
  const m = entry.kind.match(/^handler\s+(.+)$/);
  if (m) return `${entry.file}:${m[1]}`;
  return `${entry.file}:${entry.line}:${entry.kind}`;
}

const args = new Set(process.argv.slice(2));
const mode = args.has("--check")
  ? "check"
  : args.has("--update")
    ? "update"
    : "list";
const BASELINE_PATH = path.join(ROOT, "scripts", "stub-buttons.baseline.json");

const currentByIdentity = new Map();
for (const entry of flagged) {
  currentByIdentity.set(identityFor(entry), entry);
}

async function readBaseline() {
  try {
    const text = await readFile(BASELINE_PATH, "utf8");
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("baseline file must be a JSON array of identities");
    }
    return new Set(parsed);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

if (mode === "list") {
  if (flagged.length === 0) {
    console.log("No stub-shaped button handlers found.");
  } else {
    console.log(
      `Found ${flagged.length} button handlers that look like stubs (toast-only / console-only).`,
    );
    console.log(
      "Triage manually — heuristic may flag intentional notifications.\n",
    );
    for (const entry of flagged) {
      console.log(`  ${entry.file}:${entry.line}  [${entry.kind}]`);
      console.log(`    ${entry.body}`);
    }
  }
  process.exit(0);
}

if (mode === "update") {
  const sorted = [...currentByIdentity.keys()].sort();
  await writeFile(BASELINE_PATH, JSON.stringify(sorted, null, 2) + "\n");
  console.log(
    `Wrote ${sorted.length} stub-button identities to ${path.relative(
      ROOT,
      BASELINE_PATH,
    )}.`,
  );
  process.exit(0);
}

// mode === "check"
const baseline = await readBaseline();
if (!baseline) {
  console.error(
    `No baseline at ${path.relative(ROOT, BASELINE_PATH)} — run \`pnpm audit:stub-buttons:update\` once to create it.`,
  );
  process.exit(2);
}

const baselineSet = baseline;
const newStubs = [];
for (const [identity, entry] of currentByIdentity) {
  if (!baselineSet.has(identity)) newStubs.push({ identity, entry });
}
const fixedStubs = [];
for (const identity of baselineSet) {
  if (!currentByIdentity.has(identity)) fixedStubs.push(identity);
}

if (newStubs.length === 0 && fixedStubs.length === 0) {
  console.log(
    `Stub-button audit clean: ${currentByIdentity.size} known stubs, 0 new, 0 fixed.`,
  );
  process.exit(0);
}

if (newStubs.length > 0) {
  console.error(
    `✗ ${newStubs.length} NEW stub-shaped button handler(s) introduced:\n`,
  );
  for (const { entry } of newStubs) {
    console.error(`  ${entry.file}:${entry.line}  [${entry.kind}]`);
    console.error(`    ${entry.body}`);
  }
  console.error(
    "\nWire each handler to a real service call, or — if intentional — add it to ALLOWED_STUBS in scripts/find-stub-buttons.mjs.",
  );
}

if (fixedStubs.length > 0) {
  console.log(
    `\n✓ ${fixedStubs.length} stub(s) from the baseline are no longer detected:`,
  );
  for (const identity of fixedStubs) console.log(`  ${identity}`);
  console.log(
    "Run `pnpm audit:stub-buttons:update` to ratchet the baseline down.",
  );
}

process.exit(newStubs.length > 0 ? 1 : 0);
