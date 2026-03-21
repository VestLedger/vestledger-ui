const { lighthousePublicUrls } = require('./config/runtime-hosts.cjs');

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: 'pnpm start',
      startServerReadyPattern: '(ready - started server on|Ready in|Local:)',
      startServerReadyTimeout: 120000,
      url: lighthousePublicUrls,
      settings: {
        chromeFlags: '--disable-features=NetworkService',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/public',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 6000 }],
        'speed-index': ['error', { maxNumericValue: 5000 }],
        'total-blocking-time': ['error', { maxNumericValue: 400 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'unused-javascript': ['warn', { maxNumericValue: 150000 }],
      },
    },
  },
};
