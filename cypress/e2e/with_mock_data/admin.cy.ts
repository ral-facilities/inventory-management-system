describe('Admin Page', () => {
  beforeEach(() => {
    cy.visit('/admin-ims');
  });

  it('should render admin page correctly', () => {
    cy.findByText('Units').should('be.visible');
    cy.findByText('Usage Statuses').should('be.visible');
  });
});
