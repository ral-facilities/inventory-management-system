describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings');
  });

  it('should render settings page correctly', () => {
    cy.findByText('Units').should('be.visible');
    cy.findByText('Usage Statuses').should('be.visible');
    cy.findByText('System Types').should('be.visible');
  });

  it('display 404 page for invalid route', () => {
    cy.visit('/settings/not_exist');
    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'settings home page' }).should('exist');
  });

  it('should navigate to the filtered systems types page for the spares definition', () => {
    cy.findByText('Spares Definition').click();
    cy.findByRole('button', { name: 'Show Spares Definition' }).should(
      'be.disabled'
    );
  });

  it('open and close the criticality Dialog', () => {
    cy.findByRole('button', { name: 'Criticality' }).click();
    cy.findByRole('dialog').should('exist');
    cy.findByText('finished');
    cy.findByRole('button', { name: 'Run Job' }).should('not.exist');
    cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('dialog').should('not.exist');
  });

  it('open and close the criticality Dialog in admin mode', () => {
    cy.setMode({ admin: true });
    cy.findByRole('button', { name: 'Criticality' }).click();
    cy.findByRole('dialog').should('exist');
    cy.findByText('finished');
    cy.findByRole('button', { name: 'Run Job' }).should('exist');
    cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('dialog').should('not.exist');
  });
});
