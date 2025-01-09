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
  it('displays error message for invalid homepage route', () => {
    cy.visit('/ims/fdsf');

    cy.findByText(
      `The route you are trying to access doesn't exist. Please click the Scigateway logo button in the header to navigate back to the Home page.`
    ).should('exist');
  });
});
