describe('Catalogue Items', () => {
  beforeEach(() => {
    cy.visit('/catalogue/4');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('adds a catalogue item', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Description').type('test Description');
    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Cost to rework (£)').type('400');
    cy.findByLabelText('Time to replace (days) *').type('14');
    cy.findByLabelText('Time to rework (days)').type('5');
    cy.findByLabelText('Drawing number').type('MX43242');
    cy.findByLabelText('Drawing link').type('https://example.com');
    cy.findByLabelText('Model number').type('MXtest');
    cy.findByLabelText('Manufacturer *').click().type('Man{downArrow}{enter}');
    cy.findByLabelText('Notes').click().type('This is a test note');

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
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
          catalogue_category_id: '4',
          name: 'test',
          cost_gbp: 5000,
          cost_to_rework_gbp: 400,
          days_to_replace: 14,
          days_to_rework: 5,
          description: 'test Description',
          item_model_number: 'MXtest',
          is_obsolete: false,
          obsolete_reason: null,
          obsolete_replacement_catalogue_item_id: null,
          drawing_link: 'https://example.com',
          drawing_number: 'MX43242',
          manufacturer_id: '1',
          notes: 'This is a test note',
          properties: [
            { name: 'Resolution', value: 18 },
            { name: 'Frame Rate', value: 60 },
            { name: 'Sensor Type', value: 'IO' },
            { name: 'Sensor brand', value: 'pixel' },
            { name: 'Broken', value: true },
            { name: 'Older than five years', value: false },
          ],
        })
      );
    });
  });

  it('"save as" a catalogue item', () => {
    cy.visit('/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Save as').click();

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
          catalogue_category_id: '5',
          name: 'Energy Meters 27_copy_1',
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          description: 'Precision energy meters for accurate measurements. 27',
          item_model_number: null,
          is_obsolete: false,
          obsolete_reason: null,
          obsolete_replacement_catalogue_item_id: null,
          drawing_link: null,
          drawing_number: null,
          manufacturer_id: '3',
          notes: 'Need to find new manufacturer. 27',
          properties: [
            { name: 'Measurement Range', value: 2000 },
            { name: 'Accuracy', value: null },
          ],
        })
      );
    });
  });

  it('adds a catalogue item only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').type('14');

    cy.findByLabelText('Manufacturer *').click().type('Man{downArrow}{enter}');

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Sensor Type *').type('IO');
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
          catalogue_category_id: '4',
          name: 'test',
          cost_gbp: 5000,
          cost_to_rework_gbp: null,
          days_to_replace: 14,
          days_to_rework: null,
          description: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_reason: null,
          obsolete_replacement_catalogue_item_id: null,
          drawing_link: null,
          drawing_number: null,
          manufacturer_id: '1',
          notes: null,
          properties: [
            { name: 'Resolution', value: 18 },
            { name: 'Frame Rate', value: null },
            { name: 'Sensor Type', value: 'IO' },
            { name: 'Sensor brand', value: null },
            { name: 'Broken', value: true },
            { name: 'Older than five years', value: null },
          ],
        })
      );
    });
  });

  it('adds a catalogue item only mandatory fields (allowed list of values)', () => {
    cy.visit('/catalogue/12');
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').type('14');

    cy.findByLabelText('Manufacturer *').click().type('Man{downArrow}{enter}');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Ultimate Pressure (millibar) *').type('0.2');
    cy.findByLabelText('Pumping Speed *').click();
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
          catalogue_category_id: '12',
          name: 'test',
          cost_gbp: 5000,
          cost_to_rework_gbp: null,
          days_to_replace: 14,
          days_to_rework: null,
          description: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_reason: null,
          obsolete_replacement_catalogue_item_id: null,
          drawing_link: null,
          drawing_number: null,
          manufacturer_id: '1',
          notes: null,
          properties: [
            { name: 'Pumping Speed', value: 400 },
            { name: 'Ultimate Pressure', value: 0.2 },
            { name: 'Axis', value: 'y' },
          ],
        })
      );
    });
  });

  it('displays the error messages and clears when values are changed', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByText('Please enter a name').should('exist');
    cy.findByText('Please enter a cost').should('exist');
    cy.findByText('Please enter how many days it would take to replace').should(
      'exist'
    );
    cy.findByText(
      'Please choose a manufacturer, or add a new manufacturer'
    ).should('exist');

    cy.findByRole('button', { name: 'Next' }).should('be.disabled');

    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').type('14');
    cy.findByLabelText('Manufacturer *').click().type('Man{downArrow}{enter}');

    cy.findByText('Please enter name').should('not.exist');
    cy.findByText('Please select either True or False').should('not.exist');
    cy.findByText('Please enter a cost').should('not.exist');
    cy.findByText('Please enter how many days it would take to replace').should(
      'not.exist'
    );
    cy.findByText(
      'Please chose a manufacturer, or add a new manufacturer'
    ).should('not.exist');

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).click();

    cy.findByText('Please select either True or False').should('exist');

    cy.findAllByText(
      'Please enter a valid value as this field is mandatory'
    ).should('have.length', 2);
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();

    cy.findAllByText(
      'Please enter a valid value as this field is mandatory'
    ).should('have.length', 0);

    // value error from number field

    cy.findByRole('button', { name: 'Back' }).click();

    cy.findByLabelText('Cost (£) *').clear();
    cy.findByLabelText('Time to replace (days) *').clear();
    cy.findByLabelText('Cost (£) *').type('gfdg');
    cy.findByLabelText('Time to replace (days) *').type('32gf');
    cy.findByLabelText('Drawing link').type('test.co.uk');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findAllByText('Please enter a valid number').should('have.length', 2);
    cy.findAllByText(
      'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
    ).should('exist');
    cy.findByRole('button', { name: 'Next' }).should('be.disabled');
    cy.findByLabelText('Cost (£) *').clear();
    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').clear();
    cy.findByLabelText('Time to replace (days) *').type('14');
    cy.findByLabelText('Drawing link').clear();
    cy.findByLabelText('Drawing link').type('https://test.co.uk');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('dsfs');
    cy.findByLabelText('Frame Rate (fps)').type('fdsfsd');
    cy.findByRole('button', { name: 'Finish' }).click();

    cy.findAllByText('Please enter a valid number').should('have.length', 2);

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('12');
    cy.findByLabelText('Frame Rate (fps)').clear();
    cy.findByLabelText('Frame Rate (fps)').type('12');

    cy.findByRole('button', { name: 'Finish' }).should('not.disabled');
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

  it('navigates to the landing page, toggles the properties and navigates back to the table view', () => {
    cy.findByText('Cameras 1').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');
    cy.findByLabelText('Close catalogue item properties').should('exist');

    cy.findByLabelText('Close catalogue item properties').click();

    cy.findByLabelText('Close catalogue item properties').should('not.exist');
    cy.findByLabelText('Show catalogue item properties').should('exist');

    cy.findByLabelText('Close catalogue item manufacturer details').should(
      'exist'
    );

    cy.findByLabelText('Close catalogue item manufacturer details').click();

    cy.findByLabelText('Close catalogue item manufacturer details').should(
      'not.exist'
    );
    cy.findByLabelText('Show catalogue item manufacturer details').should(
      'exist'
    );

    cy.findByRole('link', { name: 'cameras' }).click();

    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');
  });

  it('navigates to the landing page, and opens the edit dialog and closes', () => {
    cy.findByText('Cameras 1').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');
    cy.findByRole('button', { name: 'Edit' }).click();
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
    cy.url().should('contain', '/manufacturer/1');
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
    cy.visit('/catalogue/item/1fds');

    cy.findByText(
      `This catalogue item doesn't exist. Please click the Home button on the top left of you screen to navigate to the catalogue home`
    ).should('exist');

    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();

    cy.findByText('Motion').should('exist');
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
          'Catalogue item has child elements and cannot be deleted, please delete the children elements first'
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
        cy.contains('Please edit a form entry before clicking save');
      });
    cy.findByRole('button', { name: 'Finish' }).should('be.disabled');
  });

  it('displays error message if catalogue item has children elements', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type('test_has_children_elements');
    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Measurement Range (Joules) *').type('0');

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Catalogue item has child elements and cannot be edited');
      });
    cy.findByRole('button', { name: 'Finish' }).should('be.disabled');
  });

  it('edit a catalogue item (Catalogue item details)', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Description').clear();
    cy.findByLabelText('Cost (£) *').type('0');
    cy.findByLabelText('Cost to rework (£)').type('4');
    cy.findByLabelText('Time to replace (days) *').type('1');
    cy.findByLabelText('Time to rework (days)').type('5');
    cy.findByLabelText('Drawing number').type('MX43242');
    cy.findByLabelText('Drawing link').type('https://example.com');
    cy.findByLabelText('Model number').type('MXtest');
    cy.findByLabelText('Manufacturer *')
      .click()
      .type('Man{downArrow}{downArrow}{enter}');
    cy.findAllByLabelText('Notes').clear().type('This is an updated note');
    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Next' }).click();
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
          name: 'test',
          description: null,
          cost_gbp: 6000,
          cost_to_rework_gbp: 894,
          days_to_replace: 71,
          days_to_rework: 605,
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
    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Measurement Range (Joules) *').type('0');

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
            { name: 'Measurement Range', value: 20000 },
            { name: 'Accuracy', value: null },
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

  it('make an item obsolete (no details)', () => {
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Obsolete').click();

    cy.findByLabelText('Is Obsolete').click();
    cy.findByRole('option', { name: 'Yes' }).click();

    cy.findByText('Obsolete Replacement').click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByText('Finish').click();

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

    cy.findByLabelText('Is Obsolete').click();
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

    cy.findByLabelText('Is Obsolete').click();
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

  it.only('can open and close add dialog in obsolete dialog', () => {
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Obsolete').click();

    cy.findByText('Obsolete Replacement').click();

    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByRole('button', { name: 'Cancel' }).click();

    //checks directory is the only dialog on screen
    cy.findAllByRole('dialog').should('have.length', 1);
  });

  it('can navigate to a catalogue items replacement', () => {
    cy.visit('/catalogue/5');

    cy.findAllByRole('link', { name: 'Click here' }).eq(1).click();

    cy.url().should('contain', 'catalogue/item/6');
  });

  it('can navigate to an items page from the table view', () => {
    cy.visit('/catalogue/5');

    cy.findAllByRole('link', { name: 'Click here' }).eq(0).click();

    cy.url().should('contain', 'catalogue/item/89/items');
  });

  it('can navigate to an items page from the landing page', () => {
    cy.visit('/catalogue/5');
    cy.findByText('Energy Meters 26').click();

    cy.findAllByRole('link', { name: 'Items' }).eq(0).click();

    cy.url().should('contain', 'catalogue/item/89/items');
  });

  it.only('opens add dialog for categories in directory and has functionality of save as', () => {
    cy.visit('/catalogue/5');
    cy.findAllByLabelText('Toggle select row').first().click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
      });

    cy.findByLabelText('Name *').should('be.visible');

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

        cy.findByRole('link', { name: 'beam-characterization' }).click();
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
        cy.findByRole('link', { name: 'beam-characterization' }).click();
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
        cy.findByRole('link', { name: 'beam-characterization' }).click();
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
        cy.findByRole('link', { name: 'beam-characterization' }).click();

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
            { name: 'Measurement Range', value: 1000, unit: 'Joules' },
            { name: 'Accuracy', value: '±0.5%', unit: '' },
          ],
          id: '89',
          manufacturer_id: '1',
          cost_gbp: 500,
          cost_to_rework_gbp: null,
          days_to_replace: 7,
          days_to_rework: null,
          drawing_number: null,
          drawing_link: 'http://example-drawing-link.com',
          item_model_number: null,
          is_obsolete: true,
          obsolete_replacement_catalogue_item_id: '6',
          obsolete_reason: 'The item is no longer being manufactured',
          notes: 'Need to find new manufacturer. 26',
        })
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({
          catalogue_category_id: '8967',
          name: 'Energy Meters 27',
          description: 'Precision energy meters for accurate measurements. 27',
          properties: [
            { name: 'Measurement Range', value: 2000, unit: 'Joules' },
            {
              name: 'Accuracy',
              value: null,
              unit: '',
            },
          ],
          id: '6',
          manufacturer_id: '3',
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
          notes: 'Need to find new manufacturer. 27',
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
        cy.findByRole('link', { name: 'beam-characterization' }).click();
        cy.findByText('Cameras').click();

        cy.findByRole('button', { name: 'Copy here' }).click();

        cy.contains(
          'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
        );
      });
  });
});
