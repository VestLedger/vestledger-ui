import { defineConfig } from 'cypress';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { appBaseUrl } = require('./config/runtime-hosts.cjs');

export default defineConfig({
  e2e: {
    baseUrl: appBaseUrl,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
