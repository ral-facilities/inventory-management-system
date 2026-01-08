describe('System Types', () => {
  beforeEach(() => {
    cy.visit('/settings/system-types');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('should render table correctly', () => {
    cy.findByText('Value').should('be.visible');
    cy.findByText('Storage').should('be.visible');
    cy.findByText('Description').should('be.visible');
    cy.findByText('Storage system type').should('be.visible');
  });

  it('sets and clears the table filters', () => {
    cy.findByText('Storage').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findByLabelText('Filter by Value').type('Operational');
    cy.findByText('Operational').should('exist');
    cy.findAllByText('Storage').should('not.exist');

    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('Storage').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
  });

  it('sets and clears the spares definition filter', () => {
    cy.findByText('Storage').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findByRole('button', { name: 'Show Spares Definition' }).click();
    cy.findByText('Operational').should('not.exist');
    cy.findAllByText('Storage').should('exist');

    cy.findByText('Spares Definition Filter Applied').should('exist');
    cy.findByRole('button', { name: 'Show Spares Definition' }).should(
      'be.disabled'
    );

    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('Operational').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByText('Spares Definition Filter Applied').should('not.exist');
  });
});
