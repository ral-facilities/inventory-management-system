describe('App', () => {
  beforeEach(() => {
    cy.intercept('**/v1/catalogue-categories?parent_id=null').as(
      'getCatalogueCategoryData'
    );
    cy.visit('/catalogue');
  });
  it('should load correctly', () => {
    cy.get('#inventory-management-system').should('be.visible');
  });

  it('displays no catagories error message at root', () => {
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    )
      .wait(['@getCatalogueCategoryData'], {
        timeout: 10000,
      })
      .should('exist');
  });
});
