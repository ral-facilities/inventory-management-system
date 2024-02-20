describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/catalogue');
    cy.get('#inventory-management-system').should('be.visible');
  });
});
