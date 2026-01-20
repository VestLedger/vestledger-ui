const AUTH_USER = {
  name: "Cypress User",
  email: "cypress@vestledger.local",
  role: "gp",
};

Cypress.Commands.add("seedAuth", () => {
  cy.session(
    "auth",
    () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          win.localStorage.setItem("isAuthenticated", "true");
          win.localStorage.setItem("user", JSON.stringify(AUTH_USER));
        },
      });

      cy.setCookie("isAuthenticated", "true");
      cy.setCookie("user", encodeURIComponent(JSON.stringify(AUTH_USER)));
    },
    {
      validate: () => {
        cy.getCookie("isAuthenticated").should("have.property", "value", "true");
      },
    }
  );
});
