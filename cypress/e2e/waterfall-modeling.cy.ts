describe("Waterfall modeling", () => {
  beforeEach(() => {
    cy.seedAuth();
  });

  it("loads the modeling dashboard", () => {
    cy.visit("/waterfall");
    cy.contains("Waterfall Modeling").should("be.visible");
    cy.contains("Scenario Manager").scrollIntoView().should("be.visible");
  });
});
