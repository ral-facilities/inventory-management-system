describe('IMS HomePage', () => {
  beforeEach(() => {
    cy.visit('/ims');
  });

  it('should be able to use links on homepage to navigate', () => {
    cy.get('[data-testid="catalogue-button"]').click();
    cy.url().should('include', '/catalogue');
    cy.go('back');

    cy.get('[data-testid="systems-button"]').click();
    cy.url().should('include', '/systems');
    cy.go('back');

    cy.get('[data-testid="manufacturer-button"]').click();
    cy.url().should('include', '/manufacturers');
    cy.go('back');

    cy.findAllByTestId('facility-button')
      .first()
      .should('have.attr', 'href')
      .should(
        'include',
        'https://www.clf.stfc.ac.uk/Pages/EPAC-Applications.aspx'
      );
  });
});
