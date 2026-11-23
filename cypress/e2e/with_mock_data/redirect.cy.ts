describe('Code Redirect Page', () => {
  it('Redirects to an item page', () => {
    cy.visit('/code-redirect?type=item&oid=KvT2Ox7n');
    cy.url().should('include', '/items/KvT2Ox7n');
  });

  it('Redirects to a system page', () => {
    cy.visit('/code-redirect?type=system&oid=65328f34a40ff5301575a4e3');
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e3');
  });

  it('Fails to redirect with invalid parameters', () => {
    // Missing oid
    cy.visit('/code-redirect?type=item');
    cy.contains('Page not found').should('be.visible');

    // Missing type
    cy.visit('/code-redirect?oid=65328f34a40ff5301575a4e3');
    cy.contains('Page not found').should('be.visible');

    // Invalid type
    cy.visit('/code-redirect?type=invalid&oid=65328f34a40ff5301575a4e3');
    cy.contains('Page not found').should('be.visible');
  });

  it('Fails to redirect with non-existent item', () => {
    cy.visit('/code-redirect?type=item&oid=invalid');
    cy.contains('Page not found').should('be.visible');
    cy.getByRole('link', { name: 'catalogue home page' }).should('be.visible');
  });

  it('Fails to redirect with non-existent system', () => {
    cy.visit('/code-redirect?type=system&oid=invalid');
    cy.contains('Page not found').should('be.visible');
    cy.getByRole('link', { name: 'systems home page' }).should('be.visible');
  });
});
