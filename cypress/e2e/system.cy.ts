describe("System", () => {
  beforeEach(() => {
    cy.visit("/inventory-management-system/systems")
  });
  afterEach(() => {
    cy.clearMocks();
  })
  it("should eventually load", () => {
    cy.findByText("Root systems").should("be.visible")
    cy.findByText("Giant laser").should("be.visible")
  })
})