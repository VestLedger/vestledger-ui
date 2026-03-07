const { lighthouseAuthUrls } = require('./config/runtime-hosts.cjs');

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: 'pnpm start',
      startServerReadyPattern: '(ready - started server on|Ready in|Local:)',
      startServerReadyTimeout: 120000,
      url: lighthouseAuthUrls,
      settings: {
        disableStorageReset: true,
        chromeFlags: '--disable-features=NetworkService',
      },
      puppeteerScript: './scripts/lhci-auth.js',
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/auth',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.65 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 7000 }],
        'speed-index': ['error', { maxNumericValue: 6500 }],
        'total-blocking-time': ['error', { maxNumericValue: 500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'unused-javascript': ['warn', { maxNumericValue: 250000 }],
      },
    },
  },
};
