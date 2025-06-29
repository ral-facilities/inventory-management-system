describe('Catalogue Items', () => {
  beforeEach(() => {
    cy.visit('/catalogue/4');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('should navigate back to the catalogue items table from the landing page using the breadcrumbs', () => {
    cy.visit('/catalogue/5/items/89');

    cy.findByRole('link', { name: 'Energy Meters' }).click();

    cy.findByRole('button', { name: 'Add Catalogue Item' }).should('exist');
  });
  it('adds a catalogue item', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').type('test');
        cy.findByLabelText('Description').type('test Description');
        cy.findByLabelText('Cost (£) *').type('5000');
        cy.findByLabelText('Cost to rework (£)').type('400');
        cy.findByLabelText('Time to replace (days) *').type('14');
        cy.findByLabelText('Time to rework (days)').type('5');
        cy.findByLabelText('Expected Lifetime (days)').type('345');
        cy.findByLabelText('Drawing number').type('MX43242');
        cy.findByLabelText('Drawing link').type('https://example.com');
        cy.findByLabelText('Model number').type('MXtest');
        cy.findByLabelText('Manufacturer *').click();
        cy.findByLabelText('Manufacturer *').type('Man{downArrow}{enter}');
        cy.findByLabelText('Notes').click();
        cy.findByLabelText('Notes').type('This is a test note');

        cy.findByRole('button', { name: 'Next' }).click();
        cy.findByLabelText('Resolution (megapixels) *').type('18');
        cy.findByLabelText('Frame Rate (fps)').type('60');
        cy.findByLabelText('Sensor Type *').type('IO');
        cy.findByLabelText('Sensor brand').type('pixel');
      });
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();
    cy.findByLabelText('Older than five years').click();
    cy.findByText('False').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          manufacturer_id: '1',
          name: 'test',
          description: 'test Description',
          cost_gbp: 5000,
          cost_to_rework_gbp: 400,
          days_to_replace: 14,
          days_to_rework: 5,
          expected_lifetime_days: 345,
          drawing_number: 'MX43242',
          drawing_link: 'https://example.com',
          item_model_number: 'MXtest',
          notes: 'This is a test note',
          properties: [
            { id: '1', value: 18 },
            { id: '2', value: 60 },
            { id: '3', value: 'IO' },
            { id: '4', value: 'pixel' },
            { id: '5', value: true },
            { id: '6', value: false },
          ],
          catalogue_category_id: '4',
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        })
      );
    });
  });

  it('"duplicate" a catalogue item', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Duplicate').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          manufacturer_id: '3',
          name: 'Energy Meters 27_copy_1',
          description: 'Precision energy meters for accurate measurements. 27',
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          expected_lifetime_days: 3635,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          notes: 'Need to find new manufacturer. 27',
          properties: [
            { id: '7', value: 2000 },
            { id: '8', value: null },
          ],
          catalogue_category_id: '5',
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        })
      );
    });
  });

  it('adds a catalogue item only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').type('test');

        cy.findByLabelText('Cost (£) *').type('5000');
        cy.findByLabelText('Time to replace (days) *').type('14');

        cy.findByLabelText('Manufacturer *').click();

        cy.findAllByLabelText('Manufacturer *')

          .type('Man{downArrow}{enter}');

        cy.findByRole('button', { name: 'Next' }).click();
        cy.findByLabelText('Resolution (megapixels) *').type('18');
        cy.findByLabelText('Sensor Type *').type('IO');
      });
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          manufacturer_id: '1',
          name: 'test',
          description: null,
          cost_gbp: 5000,
          cost_to_rework_gbp: null,
          days_to_replace: 14,
          days_to_rework: null,
          expected_lifetime_days: null,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          notes: null,
          properties: [
            { id: '1', value: 18 },
            { id: '2', value: null },
            { id: '3', value: 'IO' },
            { id: '4', value: null },
            { id: '5', value: true },
            { id: '6', value: null },
          ],
          catalogue_category_id: '4',
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        })
      );
    });
  });

  it('adds a catalogue item only mandatory fields (allowed list of values)', () => {
    cy.visit('/catalogue/12');
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').type('test');

        cy.findByLabelText('Cost (£) *').type('5000');
        cy.findByLabelText('Time to replace (days) *').type('14');

        cy.findByLabelText('Manufacturer *').click();

        cy.findByLabelText('Manufacturer *').type('Man{downArrow}{enter}');

        cy.findByRole('button', { name: 'Next' }).click();
      });
    cy.findByLabelText('Ultimate Pressure (millibar) *').type('0.2');
    cy.findByLabelText('Pumping Speed (liters per second) *').click();
    cy.findByRole('option', { name: '400' }).click();

    cy.findByLabelText('Axis').click();
    cy.findByRole('option', { name: 'y' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          manufacturer_id: '1',
          name: 'test',
          description: null,
          cost_gbp: 5000,
          cost_to_rework_gbp: null,
          days_to_replace: 14,
          days_to_rework: null,
          expected_lifetime_days: null,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          notes: null,
          properties: [
            { id: '17', value: 400 },
            { id: '18', value: 0.2 },
            { id: '19', value: 'y' },
          ],
          catalogue_category_id: '12',
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        })
      );
    });
  });

  it('displays the error messages and clears when values are changed', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Next' }).click();

        cy.findByText('Please enter a name.').should('exist');
        cy.findByText('Please enter a cost.').should('exist');
        cy.findByText(
          'Please enter how many days it would take to replace.'
        ).should('exist');
        cy.findByText(
          'Please choose a manufacturer or add a new manufacturer. Then select a manufacturer.'
        ).should('exist');

        cy.findByRole('button', { name: 'Next' }).should('be.disabled');

        cy.findByLabelText('Name *').type('test');

        cy.findByLabelText('Cost (£) *').type('5000');
        cy.findByLabelText('Time to replace (days) *').type('14');
        cy.findByLabelText('Manufacturer *').click();
        cy.findByLabelText('Manufacturer *').type('Man{downArrow}{enter}');

        cy.findByText('Please enter name.').should('not.exist');
        cy.findByText('Please select either True or False.').should(
          'not.exist'
        );
        cy.findByText('Please enter a cost.').should('not.exist');
        cy.findByText(
          'Please enter how many days it would take to replace.'
        ).should('not.exist');
        cy.findByText(
          'Please chose a manufacturer, or add a new manufacturer.'
        ).should('not.exist');

        cy.findByRole('button', { name: 'Next' }).click();
        cy.findByRole('button', { name: 'Finish' }).click();

        cy.findByText('Please select either True or False.').should('exist');

        cy.findAllByText(
          'Please enter a valid value as this field is mandatory.'
        ).should('have.length', 2);
      });
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findAllByText(
          'Please enter a valid value as this field is mandatory.'
        ).should('have.length', 0);

        // details - invalid number input test
        cy.findByRole('button', { name: 'Back' }).click();

        cy.findByLabelText('Cost (£) *').clear();
        cy.findByLabelText('Time to replace (days) *').clear();
        cy.findByLabelText('Cost (£) *').type('gfdg');
        cy.findByLabelText('Time to replace (days) *').type('32gf');
        cy.findByLabelText('Expected Lifetime (days)').clear();
        cy.findByLabelText('Drawing link').type('test.co.uk');
        cy.findByLabelText('Expected Lifetime (days)').type('friday');

        cy.findAllByText('Please enter a valid number.').should(
          'have.length',
          3
        );
        cy.findAllByText(
          'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted.'
        ).should('exist');
        cy.findByRole('button', { name: 'Next' }).should('be.disabled');

        // details - negative number input validation test
        cy.findByLabelText('Drawing link').clear();
        cy.findByLabelText('Cost (£) *').clear();
        cy.findByLabelText('Cost (£) *').type('-10');
        cy.findByLabelText('Cost to rework (£)').clear();
        cy.findByLabelText('Cost to rework (£)').type('-10');
        cy.findByLabelText('Expected Lifetime (days)').clear();
        cy.findByLabelText('Expected Lifetime (days)').type('-10');
        cy.findByLabelText('Time to replace (days) *').clear();
        cy.findByLabelText('Time to replace (days) *').type('-10');
        cy.findByLabelText('Time to rework (days)').clear();
        cy.findByLabelText('Time to rework (days)').type('-10');

        cy.findAllByText('Number must be greater than or equal to 0').should(
          'have.length',
          5
        );
        cy.findByRole('button', { name: 'Next' }).should('be.disabled');

        cy.findByLabelText('Cost (£) *').clear();
        cy.findByLabelText('Cost (£) *').type('5000');
        cy.findByLabelText('Time to replace (days) *').clear();
        cy.findByLabelText('Time to replace (days) *').type('14');
        cy.findByLabelText('Cost to rework (£)').clear();
        cy.findByLabelText('Time to rework (days)').clear();
        cy.findByLabelText('Drawing link').type('https://test.co.uk');
        cy.findByLabelText('Expected Lifetime (days)').clear();
        cy.findByLabelText('Expected Lifetime (days)').type('200');

        cy.findByRole('button', { name: 'Next' }).click();

        // properties - invalid number input test
        cy.findByLabelText('Resolution (megapixels) *').clear();
        cy.findByLabelText('Resolution (megapixels) *').type('dsfs');
        cy.findByLabelText('Frame Rate (fps)').type('fdsfsd');

        cy.findAllByText('Please enter a valid number.').should(
          'have.length',
          2
        );

        cy.findByLabelText('Resolution (megapixels) *').clear();
        cy.findByLabelText('Resolution (megapixels) *').type('12');
        cy.findByLabelText('Frame Rate (fps)').clear();
        cy.findByLabelText('Frame Rate (fps)').type('12');

        cy.findByRole('button', { name: 'Finish' }).should('not.disabled');
      });
  });

  it('opens add manufacturer dialog and closes it back to catalogue item dialog', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByRole('button', { name: 'add manufacturer' }).click();

    cy.findByText('Add Manufacturer').should('exist');

    cy.findByRole('button', { name: 'Cancel' }).click();

    cy.findByText('Add Manufacturer').should('not.exist');
  });

  it('displays the table view correctly', () => {
    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');
  });

  it('navigates to the landing page and navigates back to the table view', () => {
    cy.findByText('Cameras 1').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');

    cy.findByRole('link', { name: 'Cameras' }).click();

    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');
  });

  describe('Recently Added Section', () => {
    beforeEach(() => {
      cy.clock(new Date('2024-01-09T12:00:00.000+00:00'), ['Date']);
    });
    afterEach(() => {
      cy.clock().then((clock) => {
        clock.restore();
      });
    });
    it('navigates to the landing page, opens the edit dialog, and correctly shows recently added section', () => {
      cy.findByText('Cameras 1').click();
      cy.findByRole('button', {
        name: 'catalogue items landing page actions menu',
      }).click();
      cy.findByText('Edit').click();
      cy.findByLabelText('Manufacturer *').click({ force: true });
      cy.contains('A-Z').should('be.visible');
      cy.contains('Recently Added').should('be.visible');
      cy.findAllByText('Manufacturer B').should('have.length', 2);
    });
  });

  it('navigates to the landing page, and opens the edit dialog and closes', () => {
    cy.findByText('Cameras 1').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');
    cy.findByRole('button', {
      name: 'catalogue items landing page actions menu',
    }).click();
    cy.findByText('Edit').click();
    cy.findByLabelText('Name *').should('have.value', 'Cameras 1');
    cy.findByLabelText('Description').should(
      'have.value',
      'High-resolution cameras for beam characterization. 1'
    );
    cy.findByLabelText('Manufacturer *').should('have.value', 'Manufacturer A');
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByLabelText('Resolution (megapixels) *').should('have.value', '12');
    cy.findByLabelText('Frame Rate (fps)').should('have.value', '30');
    cy.findByLabelText('Sensor Type *').should('have.value', 'CMOS');

    cy.findByRole('button', { name: 'Cancel' }).click();
  });

  it('navigates to manufacturer landing page', () => {
    cy.visit('/catalogue/5');

    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByRole('button', { name: 'Hide all' }).click();
    cy.findByRole('checkbox', {
      name: 'Toggle visibility Manufacturer Name',
    }).click();
    cy.get('body').click();

    cy.findByRole('link', { name: 'Manufacturer A' }).click();
    cy.url().should('contain', '/manufacturers/1');
  });

  it('checks the href property of the drawing link link', () => {
    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByText('Hide all').click();

    cy.findByText('Drawing Link').click();

    // Find the link element
    cy.findAllByText('http://example-drawing-link.com')
      .first()
      .should('have.attr', 'href')
      .should('include', 'http://example-drawing-link.com'); // Check href attribute value

    cy.findAllByText('http://example-drawing-link.com')
      .first()
      .should('have.attr', 'target')
      .should('include', '_blank'); // Check target attribute value
  });

  it('checks the href property of the manufacturer link', () => {
    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByText('Hide all').click();

    cy.findByText('Manufacturer URL').click();

    // Find the link element
    cy.findAllByText('http://example.com')
      .first()
      .should('have.attr', 'href')
      .should('include', 'http://example.com'); // Check href attribute value

    cy.findAllByText('http://example.com')
      .first()
      .should('have.attr', 'target')
      .should('include', '_blank'); // Check target attribute value
  });

  it('displays the expired landing page message and navigates back to the catalogue home', () => {
    cy.visit('/catalogue/4/items/1fds');

    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'catalogue home page' }).should('exist');

    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();

    cy.findByText('Motion').should('exist');
  });

  it('displays the expired landing page message if the catalogue_category_id does not match the catalogue_item_id ', () => {
    cy.visit('/catalogue/4/items/89');

    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'catalogue home page' }).should('exist');
  });

  it('displays error message when user tries to delete a catalogue item that has children elements', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Delete').click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Catalogue item has child elements and cannot be deleted, please delete the children elements first.'
        );
      });
    cy.findByRole('button', { name: 'Continue' }).should('be.disabled');
  });

  it('delete a catalogue item', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Delete').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/catalogue-items/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(request.url.toString()).to.contain('89');
    });
  });

  it('displays error message if none of the field have been edited', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        );
      });
    cy.findByRole('button', { name: 'Finish' }).should('be.disabled');
  });

  it('displays error message if catalogue item has children elements', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type('test_has_children_elements');

    cy.findByLabelText('Manufacturer *').type('Man{downArrow}{enter}');
    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Unable to update catalogue item properties and manufacturer ' +
            '(Manufacturer C), as the catalogue item has associated items.'
        );
      });
    cy.findByRole('button', { name: 'Finish' }).should('be.disabled');

    cy.findByRole('button', { name: 'Back' }).click();
    cy.findByLabelText('Manufacturer *').type('Man{upArrow}{enter}');
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).should('be.enabled');

    cy.findByLabelText('Measurement Range (Joules) *').type('0');

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Unable to update catalogue item properties and manufacturer ' +
            '(Manufacturer C), as the catalogue item has associated items.'
        );
      });
    cy.findByRole('button', { name: 'Finish' }).should('be.disabled');
  });

  it('edit a catalogue item (Catalogue item details)', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name *').clear();
        cy.findByLabelText('Name *').type('test');
        cy.findByLabelText('Description').clear();
        cy.findByLabelText('Cost (£) *').type('0');
        cy.findByLabelText('Cost to rework (£)').type('4');
        cy.findByLabelText('Time to replace (days) *').type('1');
        cy.findByLabelText('Time to rework (days)').type('5');
        cy.findByLabelText('Expected Lifetime (days)').clear();
        cy.findByLabelText('Expected Lifetime (days)').type('345');
        cy.findByLabelText('Drawing number').type('MX43242');
        cy.findByLabelText('Drawing link').type('https://example.com');
        cy.findByLabelText('Model number').type('MXtest');
        cy.findByLabelText('Manufacturer *').click();
        cy.findByLabelText('Manufacturer *').type(
          'Man{downArrow}{downArrow}{enter}'
        );
        cy.findAllByLabelText('Notes').clear();
        cy.findAllByLabelText('Notes').type('This is an updated note');
        cy.startSnoopingBrowserMockedRequest();

        cy.findByRole('button', { name: 'Next' }).click();
        cy.findByRole('button', { name: 'Finish' }).click();
      });
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test',
          description: null,
          cost_gbp: 6000,
          cost_to_rework_gbp: 894,
          days_to_replace: 71,
          days_to_rework: 605,
          expected_lifetime_days: 345,
          drawing_number: 'MX43242',
          drawing_link: 'https://example.com',
          item_model_number: 'MXtest',
          manufacturer_id: '1',
          notes: 'This is an updated note',
        })
      );
    });
  });

  it('edit a catalogue item (properties)', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Next' }).click();

        cy.findByLabelText('Measurement Range (Joules) *').type('0');
      });

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          properties: [
            { id: '7', value: 20000 },
            { id: '8', value: null },
          ],
        })
      );
    });
  });

  it('checks the href property of the manufacturer link', () => {
    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByText('Hide all').click();

    cy.findByText('Manufacturer URL').click();

    // Find the link element
    cy.findAllByText('http://example.com')
      .first()
      .should('have.attr', 'href')
      .should('include', 'http://example.com'); // Check href attribute value

    cy.findAllByText('http://example.com')
      .first()
      .should('have.attr', 'target')
      .should('include', '_blank'); // Check target attribute value
  });

  it('sets the table filters and clears the table filters', () => {
    cy.findByText('Cameras 1').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByLabelText('Filter by Name').type('15');
    cy.findByText('Cameras 1').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('Cameras 1').should('exist');
  });

  it('check table state persists on page reload', () => {
    cy.findByText('Cameras 1').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findByLabelText('Filter by Name').type('Cameras 15');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findByText('Cameras 1').should('not.exist');
    cy.findByRole('link', { name: 'Cameras 15' }).should('exist');
    cy.location('search').should(
      'eq',
      '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJABhBsXFoRAAgCMAVhABffQF19QA'
    );

    cy.reload();

    cy.findByRole('link', { name: 'Cameras 15' }).should('exist');
    cy.findByText('Cameras 1').should('not.exist');
    cy.location('search').should(
      'eq',
      '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJABhBsXFoRAAgCMAVhABffQF19QA'
    );
  });

  it('can load and clear date filters', () => {
    cy.visit(
      '/catalogue/4/items?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0luSCAZgsUgPoYKXEgA0IANxwkY8EBgCeABx7QQSTD35DsIuQCYADOoAsAWk0BGAwGYAKps3RL1zdUuaAWiAC%2BvUJJmoAzhgBOCAB2%2BHyCwrIgrgC6LjFAA'
    );

    cy.findByText('Cameras 25').should('exist');

    cy.findByRole('button', { name: 'Clear Filters' }).click();

    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 25').should('not.exist');

    cy.location('search').should('eq', '');
  });

  it('make an item obsolete (no details)', () => {
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Obsolete').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Is Obsolete').click();
      });
    cy.findByRole('option', { name: 'Yes' }).click();

    cy.findByText('Obsolete Replacement').click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByText('Finish').click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({ is_obsolete: true })
      );
    });
  });

  it('make an item obsolete (all details)', () => {
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Obsolete').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Is Obsolete').click();
      });
    cy.findByRole('option', { name: 'Yes' }).click();

    cy.findByText('Next').click();
    cy.findByRole('textbox').type('Obsolete reason\nNew line');

    cy.findByText('Next').click();

    cy.findAllByRole('row', { name: 'Cameras 3 row' })
      .eq(0)
      .findByRole('radio')
      .click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByText('Finish').click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          is_obsolete: true,
          obsolete_reason: 'Obsolete reason\nNew line',
          obsolete_replacement_catalogue_item_id: '3',
        })
      );
    });
  });

  it('make an obsolete item not obsolete', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(0).click();
    cy.findByText('Obsolete').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Is Obsolete').click();
      });
    cy.findByRole('option', { name: 'No' }).click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByText('Finish').click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          is_obsolete: false,
          obsolete_reason: null,
          obsolete_replacement_catalogue_item_id: null,
        })
      );
    });
  });

  it('can view item details in the obsolete dialog', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(0).click();
    cy.findByText('Obsolete').click();

    cy.findByText('Obsolete Replacement').click();

    cy.findAllByRole('row', { name: 'Energy Meters 26 row' })
      .eq(0)
      .findByRole('button', { name: 'Expand' })
      .click();

    cy.findByText('Description').should('exist');
    cy.findByRole('tab', { name: 'Properties' }).click();
    cy.findAllByText('Measurement Range (Joules)').should('exist');
    cy.findByRole('tab', { name: 'Manufacturer' }).click();
    cy.findAllByText('Manufacturer Name').should('exist');
  });

  it('can open and close add dialog in obsolete dialog', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(0).click();
    cy.findByText('Obsolete').click();

    cy.findByText('Obsolete Replacement').click();

    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByText('Add catalogue item details').should('exist');

    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByText('Obsolete Catalogue Item').should('exist');
  });

  it('can navigate to a catalogue items replacement', () => {
    cy.visit('/catalogue/5');

    cy.findAllByRole('link', { name: 'Click here' }).eq(1).click();

    cy.url().should('contain', 'catalogue/5/items/6');
  });

  it('can navigate to an items page from the table view', () => {
    cy.visit('/catalogue/5');

    cy.findAllByRole('link', { name: 'Click here' }).eq(0).click();

    cy.url().should('contain', 'catalogue/5/items/89/items');
  });

  it('can navigate to an items page from the landing page', () => {
    cy.visit('/catalogue/5');
    cy.findByText('Energy Meters 26').click();

    cy.findAllByRole('link', { name: 'Items' }).eq(0).click();

    cy.url().should('contain', 'catalogue/5/items/89/items');
  });

  it('opens add dialog for categories in directory and has functionality of duplicate', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('link', { name: 'Beam Characterization' }).click();
      });

    cy.findByText('Cameras').should('be.visible');

    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();

    cy.findByDisplayValue('Energy Meters_copy_1').should('be.visible');

    cy.findByRole('button', { name: 'Cancel' }).click();

    //checks directory is the only dialog on screen
    cy.findAllByRole('dialog').should('have.length', 1);
  });

  it('can move multiple catalogue items', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findAllByLabelText('Toggle select row').eq(2).click();

    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Move here' }).should('be.disabled');

        cy.findByRole('link', { name: 'Beam Characterization' }).click();
        cy.findByText('Energy Meters V2').click();

        cy.startSnoopingBrowserMockedRequest();
        cy.findByRole('button', { name: 'Move here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(2);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({ catalogue_category_id: '8967' })
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({ catalogue_category_id: '8967' })
      );
    });
  });

  it('errors when moving multiple catalogue items to a catalogue category with different catalogue item properties ', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findAllByLabelText('Toggle select row').eq(2).click();

    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('link', { name: 'Beam Characterization' }).click();
        cy.findByText('Cameras').click();

        cy.findByRole('button', { name: 'Move here' }).click();

        cy.contains(
          'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
        );
      });
  });

  it('move here button is disabled when trying to move to the current location', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findAllByLabelText('Toggle select row').eq(2).click();

    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Move here' }).should('be.disabled');
        cy.findByRole('link', { name: 'Beam Characterization' }).click();
        cy.findByRole('button', { name: 'Move here' }).should('be.disabled');
        cy.findByText('Energy Meters').click();
        cy.findByRole('button', { name: 'Move here' }).should('be.disabled');
      });
  });

  it('can copy multiple catalogue items', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findAllByLabelText('Toggle select row').eq(2).click();

    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('link', { name: 'Beam Characterization' }).click();

        cy.findByRole('button', { name: 'Copy here' }).should('be.disabled');

        cy.findByText('Energy Meters V2').click();

        cy.startSnoopingBrowserMockedRequest();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(2);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          catalogue_category_id: '8967',
          name: 'Energy Meters 26',
          description: 'Precision energy meters for accurate measurements. 26',
          properties: [
            { id: '9', value: 1000 },
            { id: '10', value: '±0.5%' },
          ],
          id: '89',
          manufacturer_id: '1',
          cost_gbp: 500,
          cost_to_rework_gbp: null,
          days_to_replace: 7,
          days_to_rework: null,
          expected_lifetime_days: 3124,
          drawing_number: null,
          drawing_link: 'http://example-drawing-link.com',
          item_model_number: null,
          is_obsolete: true,
          obsolete_replacement_catalogue_item_id: '6',
          obsolete_reason: 'The item is no longer being manufactured',
          notes: 'Need to find new manufacturer. 26',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({
          catalogue_category_id: '8967',
          name: 'Energy Meters 27',
          description: 'Precision energy meters for accurate measurements. 27',
          properties: [
            { id: '9', value: 2000 },
            { id: '10', value: null },
          ],
          id: '6',
          manufacturer_id: '3',
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          expected_lifetime_days: 3635,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
          notes: 'Need to find new manufacturer. 27',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
    });
  });

  it('errors when copying multiple catalogue items to a catalogue category with different catalogue item properties ', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findAllByLabelText('Toggle select row').eq(2).click();

    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('link', { name: 'Beam Characterization' }).click();
        cy.findByText('Cameras').click();

        cy.findByRole('button', { name: 'Copy here' }).click();

        cy.contains(
          'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
        );
      });
  });
});
