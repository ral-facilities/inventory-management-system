describe('App', () => {
  it('should load correctly', () => {
    cy.visit('/catalogue');
    cy.get('#inventory-management-system').should('be.visible');
  });

  it('displays no catagories error message at root', () => {
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });
});
