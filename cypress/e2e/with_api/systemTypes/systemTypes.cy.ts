describe('Usage Statuses', () => {
  beforeEach(() => {
    cy.visit('/admin-ims/system-types');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('View system types ', () => {
    // Check system types render correctly
    cy.findByText('Storage').should('exist');
    cy.findByText('Operational').should('exist');
    cy.findByText('Scrapped').should('exist');

    // Check that spares defintion button filters the table
    cy.findByRole('button', { name: 'Show Spares Definition' }).click();

    cy.findByText('Operational').should('not.exist');
    cy.findByText('Scrapped').should('not.exist');
    cy.findByText('Storage').should('exist');

    // filters by spares defintion from the admin page

    cy.findByRole('button', { name: 'navigate to admin home' }).click();
    cy.findByText('Spares Definition').click();
    cy.findByText('Operational').should('not.exist');
    cy.findByText('Scrapped').should('not.exist');
    cy.findByText('Storage').should('exist');
  });
});
