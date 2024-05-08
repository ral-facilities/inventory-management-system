describe('Admin Page', () => {
  beforeEach(() => {
    cy.visit('/adminPage');
  });

  it('should render admin page correctly', () => {
    cy.findByText('Units').should('be.visible');
    cy.findByText('Usage Status').should('be.visible');
  });
});
