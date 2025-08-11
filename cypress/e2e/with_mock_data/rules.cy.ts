describe('Rules page', () => {
  beforeEach(() => {
    cy.visit('/admin-ims/rules');
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

    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
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

    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
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

    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findByRole('progressbar').should('not.exist');

    cy.findAllByText('Storage').should('have.length', 4);

    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
  });
});
