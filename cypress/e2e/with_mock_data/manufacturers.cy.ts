describe('Manufacturer', () => {
  beforeEach(() => {
    cy.visit('/manufacturers');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('should render in table headers', () => {
    cy.visit('/manufacturers');
    cy.findByText('Actions').should('be.visible');
    cy.findByText('Name').should('be.visible');
    cy.findByText('URL').should('be.visible');
    cy.findByText('Telephone number').scrollIntoView();
    cy.findByText('Address').should('be.visible');
    cy.findByText('Telephone number').should('be.visible');
  });

  it('should render manufacturer data', () => {
    cy.visit('/manufacturers');

    cy.findByText('Manufacturer A').should('be.visible');
    cy.findByText('Manufacturer B').should('be.visible');
    cy.findByText('Manufacturer C').scrollIntoView();
    cy.findByText('Manufacturer C').should('be.visible');
    cy.findByText('http://example.com').scrollIntoView();
    cy.findByText('http://example.com').should('be.visible');
    cy.findByText('http://test.com').should('be.visible');
    cy.findByText('http://test.co.uk').scrollIntoView();
    cy.findByText('http://test.co.uk').should('be.visible');
    cy.findByText('http://example.com').scrollIntoView();
    cy.findByText('07334893348').scrollIntoView();
    cy.findByText('07334893348').should('be.visible');
    cy.findByText('07294958549').should('be.visible');
    cy.findByText('07934303412').should('be.visible');
  });

  it('manufacturer url is correct and opens new webpage', () => {
    cy.visit('/manufacturers');

    cy.findByText('http://example.com')
      .should('be.visible')
      .then(($url) => {
        $url.attr('target', '_self');
      })
      .click();
    cy.url().should('include', 'http://example.com');
  });

  it('adds a manufacturer with all fields', () => {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').type('Manufacturer D');
        cy.findByLabelText('URL').type('http://test.co.uk');
        cy.findByLabelText('Country *').type('United Kingdom');
        cy.findByLabelText('Address Line *').type('4 Example Street');
        cy.findByLabelText('Town').type('Oxford');
        cy.findByLabelText('County').type('Oxfordshire');
        cy.findByLabelText('Post/Zip code *').type('OX1 2AB');
        cy.findByLabelText('Telephone number').type('07349612203');
      });

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/manufacturers',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        '{"name":"Manufacturer D","url":"http://test.co.uk","address":{"address_line":"4 Example Street","town":"Oxford","county":"Oxfordshire","postcode":"OX1 2AB","country":"United Kingdom"},"telephone":"07349612203"}'
      );
    });
  });

  it('adds a manufacturer with only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').type('Manufacturer D');
        cy.findByLabelText('Country *').type('United Kingdom');
        cy.findByLabelText('Address Line *').type('4 Example Street');
        cy.findByLabelText('Post/Zip code *').type('OX1 2AB');
      });

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/manufacturers',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'Manufacturer D',
          address: {
            address_line: '4 Example Street',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
        })
      );
    });

    it('render error messages if fields are not filled', () => {
      cy.findByTestId('Add Manufacturer').click();
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog')
        .should('be.visible')
        .within(() => {
          cy.contains('Please enter a name.');

          cy.contains('Please enter a country.');

          cy.contains('Please enter an address.');

          cy.contains('Please enter a post code or zip code.');
        });
    });
    it('displays error message when duplicate name entered', () => {
      cy.findByRole('button', { name: 'Add Manufacturer' }).click();

      cy.findByRole('dialog')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Name *').type('Manufacturer A');
          cy.findByLabelText('Country *').type('United Kingdom');
          cy.findByLabelText('Address Line *').type('4 Example Street');

          cy.findByRole('button', { name: 'Save' }).click();

          cy.contains(
            'A manufacturer with the same name has been found. Please enter a different name.'
          );
        });
    });
    it('invalid url displays correct error message', () => {
      cy.findByTestId('Add Manufacturer').click();

      cy.findByRole('dialog')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('URL').type('test.co.uk');

          cy.findByRole('button', { name: 'Save' }).click();

          cy.contains('Please enter a valid url.');
        });
    });
  });

  it('delete a manufacturer', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Delete').click();

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
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Delete').click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'The specified manufacturer is a part of a Catalogue Item. Please delete the Catalogue Item first.'
        );
      });
    cy.findByRole('button', { name: 'Continue' }).should('be.disabled');
  });

  it('edits a manufacturer correctly', () => {
    cy.visit('/manufacturers');
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').clear();
        cy.findByLabelText('Name *').type('test');

        cy.findByLabelText('Country *').clear();
        cy.findByLabelText('Country *').type('test');

        cy.findByLabelText('Address Line *').clear();
        cy.findByLabelText('Address Line *').type('test');

        cy.findByLabelText('Town').clear();
        cy.findByLabelText('Town').type('test');

        cy.findByLabelText('County').clear();
        cy.findByLabelText('County').type('test');

        cy.findByLabelText('Post/Zip code *').clear();
        cy.findByLabelText('Post/Zip code *').type('test');

        cy.findByLabelText('Telephone number').clear();
        cy.findByLabelText('Telephone number').type('0000000000');
      });

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/manufacturers/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        '{"name":"test","address":{"address_line":"test","town":"test","county":"test","postcode":"test","country":"test"},"telephone":"0000000000"}'
      );
    });
  });

  it('trying to edit with duplicate name displays error message', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').clear();
        cy.findByLabelText('Name *').type('test_dup');
      });

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'A manufacturer with the same name has been found. Please enter a different name.'
        );
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('trying to edit with invalid url displays error message', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('URL').clear();
        cy.findByLabelText('URL').type('invalid');

        cy.findByRole('button', { name: 'Save' }).click();

        cy.contains('Please enter a valid URL.');
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('can clear url field and has no errors', () => {
    cy.visit('/manufacturers');
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('URL').clear();
      });

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/manufacturers/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal('{"url":null}');
    });
  });

  it('not changing any fields shows error', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        );
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('Required fields that are cleared are not allowed and show error message', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Edit').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').clear();
        cy.findByLabelText('Country *').clear();
        cy.findByLabelText('Address Line *').clear();
        cy.findByLabelText('Post/Zip code *').clear();

        cy.findByRole('button', { name: 'Save' }).click();
        cy.contains('Please enter a name.');
        cy.contains('Please enter a country.');
        cy.contains('Please enter an address.');
        cy.contains('Please enter a post code or zip code.');
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('navigates to landing page and navigates back to the table view', () => {
    cy.findByText('Manufacturer A').click();
    cy.findByText('Telephone number:').should('exist');

    cy.findByRole('button', { name: 'navigate to manufacturer home' }).click();

    cy.findByText('Manufacturer A').should('exist');
    cy.findByText('Manufacturer B').should('exist');
    cy.findByText('Manufacturer C').should('exist');
  });

  it('navigates to landing page, opens edit dialog and closes it', () => {
    cy.findByText('Manufacturer A').click();
    cy.findByText('Telephone number:').should('exist');

    cy.findByRole('button', { name: 'Edit' }).click();
    cy.findByLabelText('Name *').should('have.value', 'Manufacturer A');
    cy.findByLabelText('URL').should('have.value', 'http://example.com');
    cy.findByLabelText('Address Line *').should(
      'have.value',
      '1 Example Street'
    );
    cy.findByLabelText('Town').should('have.value', 'Oxford');
    cy.findByLabelText('County').should('have.value', 'Oxfordshire');
    cy.findByLabelText('Country *').should('have.value', 'United Kingdom');
    cy.findByLabelText('Post/Zip code *').should('have.value', 'OX1 2AB');
    cy.findByLabelText('Telephone number').should('have.value', '07334893348');

    cy.findByRole('button', { name: 'Cancel' }).click();
  });

  it('displays expired landing page message and navigates back to manufacturer table view', () => {
    cy.visit('/manufacturers/invalid');

    cy.findByText(
      `This manufacturer doesn't exist. Please click the Home button to navigate to the manufacturer table`
    ).should('exist');

    cy.findByRole('button', { name: 'navigate to manufacturer home' }).click();

    cy.findByText('Manufacturer A').should('exist');
    cy.findByText('Manufacturer B').should('exist');
    cy.findByText('Manufacturer C').should('exist');
  });
  it('sets the table filters and clears the table filters', () => {
    cy.findByText('Manufacturer A').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByLabelText('Filter by Name').type('B');
    cy.findByText('Manufacturer A').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('Manufacturer A').should('exist');
  });
});
