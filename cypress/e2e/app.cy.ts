describe("App", () => {
  it("should load the homepage", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
  });
});
