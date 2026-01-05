describe('Rules page', () => {
  beforeEach(() => {
    cy.visit('/settings/rules');
  });

  it('renders table correctly', () => {
    cy.findByRole('progressbar').should('not.exist');
    cy.findAllByText('Storage').should('have.length', 4);
  });

  it('sets creation rules and clears the table filters', () => {
    cy.findByRole('progressbar').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Show Creation Rules' }).click();

    cy.findAllByText('Storage').should('have.length', 2);

    cy.findByRole('button', { name: 'Show Creation Rules' }).should(
      'be.disabled'
    );
    cy.findByText('Creation Rules Filter Applied').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByText('Creation Rules Filter Applied').should('not.exist');
  });

  it('sets deletion rules and clears the table filters', () => {
    cy.findByRole('progressbar').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Show Deletion Rules' }).click();

    cy.findAllByText('Storage').should('have.length', 2);

    cy.findByRole('button', { name: 'Show Deletion Rules' }).should(
      'be.disabled'
    );
    cy.findByText('Deletion Rules Filter Applied').should('exist');

    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByText('Deletion Rules Filter Applied').should('not.exist');
  });

  it('sets moving rules and clears the table filters', () => {
    cy.findByRole('progressbar').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Show Moving Rules' }).click();

    cy.findByRole('progressbar').should('not.exist');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Show Moving Rules' }).should(
      'be.disabled'
    );
    cy.findByText('Moving Rules Filter Applied').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findByRole('progressbar').should('not.exist');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByText('Moving Rules Filter Applied').should('not.exist');
  });

  
  it('opens information dialog from icon button', () => {
    cy.findByLabelText('Open information dialog').click();
    cy.findByText('Rules Information').should('exist');
    cy.get('button:contains("Example:")').should('have.length', 3)

    cy.findByText('Example: Storage').click();
    cy.findByText('Items can be deleted from the system type \'Storage\'.').should('exist');

    cy.findByText('Example: Storage').click();
    cy.findByRole('button', { name: 'Close' }).click();
  });
});
