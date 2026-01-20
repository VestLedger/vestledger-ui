// Cypress E2E support file
// Add custom commands and global configuration here
import '@cypress/code-coverage/support';
import "./commands";

// Example: Disable uncaught exception failures
Cypress.on('uncaught:exception', () => {
  return false;
});
