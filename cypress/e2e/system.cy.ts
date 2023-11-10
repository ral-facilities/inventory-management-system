describe('System', () => {
  beforeEach(() => {
    cy.visit('/inventory-management-system/systems');
  });

  afterEach(() => {
    cy.clearMocks();
  });

  it('should eventually load', () => {
    cy.findByText('Root systems').should('be.visible');
    cy.findByText('Giant laser').should('be.visible');
  });

  it('adds a root system with only required parameters', () => {
    cy.findByRole('button', { name: 'add system' }).click();

    cy.findByLabelText('Name *').type('System name');
    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({ method: 'POST', url: '/v1/systems' }).should(
      async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({ name: 'System name', importance: 'medium' })
        );
      }
    );
  });

  it('adds a root system with all parameters', () => {
    cy.findByRole('button', { name: 'add system' }).click();

    cy.findByLabelText('Name *').type('System name');
    cy.findByLabelText('Description').type('System description');
    cy.findByLabelText('Location').type('System location');
    cy.findByLabelText('Owner').type('System owner');
    cy.findByLabelText('Importance').click();
    cy.findByRole('option', { name: 'high' }).click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({ method: 'POST', url: '/v1/systems' }).should(
      async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            description: 'System description',
            location: 'System location',
            owner: 'System owner',
            importance: 'high',
          })
        );
      }
    );
  });

  it('adds a subsystem', () => {
    cy.visit('/inventory-management-system/systems/65328f34a40ff5301575a4e3');

    cy.findByRole('button', { name: 'add subsystem' }).click();

    cy.findByLabelText('Name *').type('System name');
    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({ method: 'POST', url: '/v1/systems' }).should(
      async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            importance: 'medium',
            parent_id: '65328f34a40ff5301575a4e3',
          })
        );
      }
    );
  });

  it('displays an error when attempting to add a system with no name that hides once closed', () => {
    cy.visit('/inventory-management-system/systems');

    // Empty name
    cy.findByRole('button', { name: 'add system' }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByText('Please enter a name').should('be.visible');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('button', { name: 'add system' }).click();
    cy.findByText('Please enter a name').should('not.exist');

    // Other error
    cy.findByLabelText('Name *').type('Error 500');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByText('Please refresh and try again').should('be.visible');
    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('button', { name: 'add system' }).click();
    cy.findByText('Please refresh and try again').should('not.exist');
  });
});
