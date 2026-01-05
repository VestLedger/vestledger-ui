const fs = require('fs');
const path = require('path');

const runLabel = process.argv[2] || 'run';
const runId = process.argv[3] || `${runLabel}-${new Date().toISOString()}`;

const resultsPath = path.resolve('.lighthouseci', 'assertion-results.json');
const historyPath = path.resolve('.lighthouseci', 'assertion-results.history.json');

if (!fs.existsSync(resultsPath)) {
  console.error(`Missing ${resultsPath}; nothing to append.`);
  process.exit(1);
}

const rawResults = fs.readFileSync(resultsPath, 'utf8');
const results = JSON.parse(rawResults);
const timestamp = new Date().toISOString();

const enriched = Array.isArray(results)
  ? results.map((entry) => ({
      ...entry,
      runId,
      runLabel,
      timestamp,
    }))
  : [{
      ...results,
      runId,
      runLabel,
      timestamp,
    }];

let history = [];
if (fs.existsSync(historyPath)) {
  try {
    const rawHistory = fs.readFileSync(historyPath, 'utf8');
    const parsed = JSON.parse(rawHistory);
    if (Array.isArray(parsed)) {
      history = parsed;
    }
  } catch (error) {
    console.warn('Failed to parse existing history file; starting fresh.');
  }
}

const merged = history.concat(enriched);
fs.writeFileSync(historyPath, `${JSON.stringify(merged, null, 2)}\n`);
