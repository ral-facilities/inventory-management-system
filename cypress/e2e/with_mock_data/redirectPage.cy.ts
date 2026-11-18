describe('Code Redirect Page', () => {
  it('Redirects to an item page', () => {
    cy.visit('/code-redirect?type=item&oid=KvT2Ox7n');
    cy.contains('Redirecting').should('be.visible');
    cy.url().should('include', '/items/KvT2Ox7n');
  });

  it('Redirects to a system page', () => {
    cy.visit('/code-redirect?type=system&oid=65328f34a40ff5301575a4e3');
    cy.contains('Redirecting').should('be.visible');
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e3');
  });

  it('Fails to redirect with invalid parameters', () => {
    // Missing oid
    cy.visit('/code-redirect?type=item');
    cy.contains('Redirect Failed').should('be.visible');
    cy.contains('Failed to parse redirect values').should('be.visible');

    // Missing type
    cy.visit('/code-redirect?oid=65328f34a40ff5301575a4e3');
    cy.contains('Redirect Failed').should('be.visible');
    cy.contains('Failed to parse redirect values').should('be.visible');

    // Invalid type
    cy.visit('/code-redirect?type=invalid&oid=65328f34a40ff5301575a4e3');
    cy.contains('Redirect Failed').should('be.visible');
    cy.contains('Failed to parse redirect values').should('be.visible');
  });

  it('Fails to redirect with non-existent item', () => {
    cy.visit('/code-redirect?type=item&oid=invalid');
    cy.contains('Redirecting').should('be.visible');
    cy.contains('Failed to retrieve item details').should('be.visible');
  });

  it('Fails to redirect with non-existent system', () => {
    cy.visit('/code-redirect?type=system&oid=invalid');
    cy.contains('Redirecting').should('be.visible');
    cy.contains('Failed to retrieve system details').should('be.visible');
  });

  it('Links to the home page when the redirect fails', () => {
    cy.visit('/code-redirect?type=system&oid=invalid');
    cy.contains('Redirect Failed').should('be.visible');
    cy.findByRole('link', { name: 'Go Home' }).click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});
