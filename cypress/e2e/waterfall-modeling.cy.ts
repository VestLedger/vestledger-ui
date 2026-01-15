describe("Waterfall modeling", () => {
  it("loads the modeling dashboard", () => {
    cy.visit("/waterfall");
    cy.contains("Waterfall Modeling").should("be.visible");
    cy.contains("Scenario Manager").should("be.visible");
  });
});
