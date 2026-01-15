describe("LP portal", () => {
  it("renders investor overview and distributions tab", () => {
    cy.visit("/lp-portal");
    cy.contains("Total Commitment").should("be.visible");
    cy.contains("Distributions").should("be.visible");
  });
});
