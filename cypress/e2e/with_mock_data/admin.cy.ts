describe('Admin Page', () => {
  beforeEach(() => {
    cy.visit('/admin-ims');
  });

  it('should render admin page correctly', () => {
    cy.findByText('Units').should('be.visible');
    cy.findByText('Usage Statuses').should('be.visible');
    cy.findByText('System Types').should('be.visible');
  });

  it('display 404 page for invalid route', () => {
    cy.visit('/admin-ims/not_exist');
    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'admin home page' }).should('exist');
  });

  it('should navigate to the filtered systems types page for the spares definition', () => {
    cy.findByText('Spares Definition').click();
    cy.findByRole('button', { name: 'Spares Definition' }).should(
      'be.disabled'
    );
  });
});
