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
    cy.findByText('Telephone').should('be.visible');
  });

  it('should render manufacturer data', () => {
    cy.visit('/manufacturer');

    cy.findByText('Manufacturer A').should('be.visible');
    cy.findByText('Manufacturer B').should('be.visible');
    cy.findByText('Manufacturer C').should('be.visible');
    cy.findByText('http://example.com').should('be.visible');
    cy.findByText('http://test.com').should('be.visible');
    cy.findByText('http://test.co.uk').should('be.visible');
    cy.findByText('1 Example Street Oxford Oxfordshire OX1 2AB').should(
      'be.visible'
    );
    cy.findByText('2 Example Street Oxford Oxfordshire OX1 2AB').should(
      'be.visible'
    );
    cy.findByText('3 Example Street Oxford Oxfordshire OX1 2AB').should(
      'be.visible'
    );
  });

  it('manufacturer url is correct and opens new webpage', () => {
    cy.visit('/manufacturer');
    const url = cy.findByText('http://example.com');

    url.should('be.visible').click();
    cy.url().should('include', 'http://example.com');
  });

  it('render new manufacturer when added', async () => {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();
    cy.findByLabelText('Name *').type('Manufacturer D');
    cy.findByLabelText('URL').type('http://test.co.uk');
    cy.findByLabelText('Building number *').type('1');
    cy.findByLabelText('Street name *').type('Example Street');
    cy.findByLabelText('Town').type('Oxford');
    cy.findByLabelText('County').type('Oxfordshire');
    cy.findByLabelText('Post/Zip code *').type('OX1 2AB');
    cy.findByLabelText('Telephone number').type('07349612203');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/manufacturers',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Manufacturer D","url":"http://test.co.uk", "address": {building_number: "1", "street_name": "Example Street", "town": "Oxford", "county": "Oxfordshire", "postCode": "OX1 2AB",}, "telephone": "07349612203"}'
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
        cy.contains('Please enter a building number.');
      });
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a street name.');
      });
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a post code or zip code.');
      });
  });

  it('displays error message when duplicate name entered', async () => {
    cy.findByTestId('Add Manufacturer').click();
    cy.findByLabelText('Name *').type('Manufacturer A');
    cy.findByLabelText('Building number *').type('1');
    cy.findByLabelText('Street name *').type('Example Street');
    cy.findByLabelText('Post/Zip code *').type('OX1 2AB');

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('A manufacturer with the same name already exists.');
      });
  });

  it('invalid url displays correct error message', async () => {
    cy.findByTestId('Add Manufacturer').click();

    cy.findByLabelText('URL').type('test.co.uk');

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a valid url.');
      });
  });

  it('delete a manufacturer', () => {
    cy.findAllByTestId('DeleteIcon').first().click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/manufacturers/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('shows error when trying to delete manufacturer that is part of Catalogue Item', async () => {
    cy.findAllByTestId('DeleteIcon').eq(1).click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'The manufacturer is a part of a Catalogue Item, Please delete the Catalogue Item first Please delete the Catalogue Item first'
        );
      });
  });
});
