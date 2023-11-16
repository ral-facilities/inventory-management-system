describe('Manufacturer', () => {
  beforeEach(() => {
    cy.visit('/inventory-management-system/manufacturer');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('should render in table headers', () => {
    cy.visit('/inventory-management-system/manufacturer');
    cy.findByText('Actions').should('be.visible');
    cy.findByText('Name').should('be.visible');
    cy.findByText('URL').should('be.visible');
    cy.findByText('Address').should('be.visible');
    cy.findByText('Telephone').should('be.visible');
  });

  it('should render manufacturer data', () => {
    cy.visit('/inventory-management-system/manufacturer');

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
    cy.visit('/inventory-management-system/manufacturer');
    const url = cy.findByText('http://example.com');

    url
      .should('be.visible')
      .then(($url) => {
        $url.attr('target', '_self');
      })
      .click();
    cy.url().should('include', 'http://example.com');
  });

  it('adds a manufacturer with all fields', () => {
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
        '{"name":"Manufacturer D","url":"http://test.co.uk","address":{"building_number":"1","street_name":"Example Street","town":"Oxford","county":"Oxfordshire","postcode":"OX1 2AB"},"telephone":"07349612203"}'
      );
    });
  });

  it('adds a manufacturer with only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();
    cy.findByLabelText('Name *').type('Manufacturer D');
    cy.findByLabelText('Building number *').type('1');
    cy.findByLabelText('Street name *').type('Example Street');
    cy.findByLabelText('Post/Zip code *').type('OX1 2AB');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/manufacturers',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Manufacturer D","address":{"building_number":"1","street_name":"Example Street","town":"","county":"","postcode":"OX1 2AB"},"telephone":""}'
      );
    });

    it('render error messages if fields are not filled', () => {
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
    it('displays error message when duplicate name entered', () => {
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
    it('invalid url displays correct error message', () => {
      cy.findByTestId('Add Manufacturer').click();

      cy.findByLabelText('URL').type('test.co.uk');

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog')
        .should('be.visible')
        .within(() => {
          cy.contains('Please enter a valid url.');
        });
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

  it('shows error when trying to delete manufacturer that is part of Catalogue Item', () => {
    cy.findAllByTestId('DeleteIcon').eq(1).click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'The specified manufacturer is a part of a Catalogue Item. Please delete the Catalogue Item first.'
        );
      });
  });
  it('Edits a manufacturer correctly', () => {
    cy.visit('/inventory-management-system/manufacturer');
    cy.findByRole('button', {
      name: 'Edit Manufacturer A manufacturer',
    }).click();
    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Name').type('test');

    cy.findByLabelText('Building number').clear();
    cy.findByLabelText('Building number').type('100');

    cy.findByLabelText('Street name').clear();
    cy.findByLabelText('Street name').type('test');

    cy.findByLabelText('Town').clear();
    cy.findByLabelText('Town').type('test');

    cy.findByLabelText('County').clear();
    cy.findByLabelText('County').type('test');

    cy.findByLabelText('Post/Zip code').clear();
    cy.findByLabelText('Post/Zip code').type('test');

    cy.findByLabelText('Telephone number').clear();
    cy.findByLabelText('Telephone number').type('0000000000');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/manufacturers/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"test","address":{"building_number":"100","street_name":"test","town":"test","county":"test","postcode":"test"},"telephone":"0000000000"}'
      );
    });
  });

  it('Trying to edit with duplicate name displays error message', () => {
    cy.findByRole('button', {
      name: 'Edit Manufacturer A manufacturer',
    }).click();

    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Name').type('test_dup');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'A manufacturer with the same name has been found. Please enter a different name'
        );
      });
  });

  it('Trying to edit with invalid url displays error message', () => {
    cy.findByRole('button', {
      name: 'Edit Manufacturer A manufacturer',
    }).click();

    cy.findByLabelText('URL').clear();
    cy.findByLabelText('URL').type('invalid');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a valid URL');
      });
  });

  it('Not changing any fields shows error', () => {
    cy.findByRole('button', {
      name: 'Edit Manufacturer A manufacturer',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          "There have been no changes made. Please change a field's value or press Cancel to exit"
        );
      });
  });

  it('Required fields that are cleared are not allowed and show error message', () => {
    cy.findByRole('button', {
      name: 'Edit Manufacturer A manufacturer',
    }).click();

    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Building number').clear();
    cy.findByLabelText('Street name').clear();
    cy.findByLabelText('Post/Zip code').clear();

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

  it('navigates to landing page and navigates back to the table view', () => {
    cy.findByText('Manufacturer A').click();
    cy.findByText('Telephone number:').should('exist');

    cy.findByRole('link', { name: 'Back to manufacturer table view' }).click();

    cy.findByText('Manufacturer A').should('exist');
    cy.findByText('Manufacturer B').should('exist');
    cy.findByText('Manufacturer C').should('exist');
  });

  it('navigates to landing page, opens edit dialog and closes it', () => {
    cy.findByText('Manufacturer A').click();
    cy.findByText('Telephone number:').should('exist');

    cy.findByRole('button', { name: 'Edit' }).click();
    cy.findByLabelText('Name').should('have.value', 'Manufacturer A');
    cy.findByLabelText('URL').should('have.value', 'http://example.com');
    //cy.findByLabelText('address line').should('have.value', '1 Example Street')
    cy.findByLabelText('Town').should('have.value', 'Oxford');
    cy.findByLabelText('County').should('have.value', 'Oxfordshire');
    //cy.findByLabelText('Country').should('have.value', 'United Kingdom')
    cy.findByLabelText('Post/Zip code').should('have.value', 'OX1 2AB');
    cy.findByLabelText('Telephone number').should('have.value', '07334893348');

    cy.findByRole('button', { name: 'Cancel' }).click();
  });

  it('displays expired landing page message and navigates back to manufacturer table view', () => {
    cy.visit('/inventory-management-system/manufacturer/invalid');

    cy.findByText(
      `This manufacturer doesn't exist. Please click the Home button to navigate to the manufacturer table`
    ).should('exist');

    cy.findByRole('link', { name: 'Home' }).click();

    cy.findByText('Manufacturer A').should('exist');
    cy.findByText('Manufacturer B').should('exist');
    cy.findByText('Manufacturer C').should('exist');
  });
});
