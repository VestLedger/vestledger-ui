export {};

declare global {
  namespace Cypress {
    interface Chainable {
      seedAuth(): Chainable<void>;
    }
  }
}
