const fillInputByLabel = (label: string, value: string) => {
  cy.contains("label", label)
    .invoke("attr", "for")
    .then((id) => {
      if (id) {
        cy.get(`#${id}`).clear().type(value);
        return;
      }

      cy.contains(label)
        .parent()
        .find("input")
        .first()
        .clear()
        .type(value);
    });
};

describe("Distribution wizard", () => {
  it("progresses from event to fees step", () => {
    cy.visit("/fund-admin/distributions/new");
    cy.contains("Create Distribution").should("be.visible");

    fillInputByLabel("Distribution name", "Q4 Exit Distribution");
    fillInputByLabel("Gross proceeds", "2500000");

    cy.contains("button", "Save & Continue").click();
    cy.contains("Fees").should("be.visible");
  });
});
