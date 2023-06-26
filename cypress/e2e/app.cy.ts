describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.get('#inventory-management-system').should('be.visible');
  });
});
