describe('App', () => {
  afterEach(() => {
    cy.clearMocks();
  });
  it('should load correctly', () => {
    cy.visit('/catalogue');
    cy.get('#inventory-management-system').should('be.visible');
  });

  it.only('displays no categories error message at root', () => {
    cy.intercept({
      method: 'GET',
      url: '**/catalogue-categories?parent_id=null',
    }).as('getCatalogueCategoryData');
    cy.visit('/catalogue');
    cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });
});
