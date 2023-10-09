describe('Manufacturer', () => {
  beforeEach(() => {
    cy.visit('/manufacturer');
  });

  it('should render in table headers', () => {
    cy.visit('/manufacturer');
    cy.findByText('Actions').should('be.visible');
    cy.findByText('Name').should('be.visible');
    cy.findByText('URL').should('be.visible');
    cy.findByText('Address').should('be.visible');
  });

  it('should render manufacturer data', () => {
    cy.visit('/manufacturer');

    cy.findByText('Manufacturer A').should('be.visible');
    cy.findByText('Manufacturer B').should('be.visible');
    cy.findByText('Manufacturer C').should('be.visible');
    cy.findByText('http://example.com').should('be.visible');
    cy.findByText('http://test.co.uk').should('be.visible');
    cy.findByText('http://123test.com').should('be.visible');
    cy.findByText('10 My Street').should('be.visible');
    cy.findByText('11 My Street').should('be.visible');
    cy.findByText('12 My Street').should('be.visible');
  });

  it('manufacturer url is correct and opens new webpage', () => {
    cy.visit('/manufacturer');
    const url = cy.findByText('http://example.com');

    url.should('be.visible').click();
    cy.url().should('include', 'http://example.com');
  });

  it.only('render new manufacturer when added', async () => {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();
    cy.findByLabelText('Name *').type('Manufacturer D');
    cy.findByLabelText('URL *').type('http://test.co.uk');
    cy.findByLabelText('Address *').type('13 My Street');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/manufacturer',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Manufacturer D","url":"http://test.co.uk", "address":"13 My Street"}'
      );
    });
  });

  it('render error messages if fields are not filled', async () => {
    cy.findByTestId('Add Manufacturer').click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a name.');
      });
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a url.');
      });
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter an address.');
      });
  });
  it('displays error message when duplicate name entered', async () => {
    cy.findByTestId('Add Manufacturer').click();
    cy.findByLabelText('Name *').type('Manufacturer A');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('A manufacturer with the same name already exists.');
      });
  });
  it('invalid url displays correct error message', async () => {
    cy.findByTestId('Add Manufacturer').click();
    cy.findByLabelText('Name *').type('Manufacturer D');
    cy.findByLabelText('URL *').type('test.co.uk');
    cy.findByLabelText('Address *').type('13 My Street');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a valid url.');
      });
  });
});
