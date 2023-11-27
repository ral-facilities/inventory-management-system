describe('Catalogue Items', () => {
  beforeEach(() => {
    cy.visit('/inventory-management-system/catalogue/4');
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

    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();
    cy.findByLabelText('Older than five years').click();
    cy.findByText('False').click();

    cy.findByLabelText('Manufacturer Name *').type('test');
    cy.findByLabelText('Manufacturer URL *').type('https://test.co.uk');
    cy.findByLabelText('Manufacturer Address *').type('1 house test TX3 6TY');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"catalogue_category_id":"4","name":"test","cost_gbp":5000,"cost_to_rework_gbp":400,"days_to_replace":14,"days_to_rework":5,"description":"test Description","item_model_number":"MXtest","is_obsolete":false,"obsolete_reason":null,"obsolete_replacement_catalogue_item_id":null,"drawing_link":"https://example.com","drawing_number":"MX43242","properties":[{"name":"Resolution","value":18},{"name":"Frame Rate","value":60},{"name":"Sensor Type","value":"IO"},{"name":"Sensor brand","value":"pixel"},{"name":"Broken","value":true},{"name":"Older than five years","value":false}],"manufacturer":{"name":"test","address":"1 house test TX3 6TY","url":"https://test.co.uk"}}'
      );
    });
  });

  it('"save as" a catalogue item', () => {
    cy.visit('/inventory-management-system/catalogue/5');

    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Save as').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"catalogue_category_id":"5","name":"Energy Meters 27_copy1","cost_gbp":600,"cost_to_rework_gbp":89,"days_to_replace":7,"days_to_rework":60,"description":"Precision energy meters for accurate measurements. 27","item_model_number":null,"is_obsolete":false,"obsolete_reason":null,"obsolete_replacement_catalogue_item_id":null,"drawing_link":null,"drawing_number":null,"properties":[{"name":"Measurement Range","value":2000}],"manufacturer":{"name":"Manufacturer A","url":"http://example.com","address":"10 My Street"}}'
      );
    });
  });

  it('adds a catalogue item only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();

    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').type('14');

    cy.findByLabelText('Manufacturer Name *').type('test');
    cy.findByLabelText('Manufacturer URL *').type('https://test.co.uk');
    cy.findByLabelText('Manufacturer Address *').type('1 house test TX3 6TY');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-items',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"catalogue_category_id":"4","name":"test","cost_gbp":5000,"cost_to_rework_gbp":null,"days_to_replace":14,"days_to_rework":null,"description":null,"item_model_number":null,"is_obsolete":false,"obsolete_reason":null,"obsolete_replacement_catalogue_item_id":null,"drawing_link":null,"drawing_number":null,"properties":[{"name":"Resolution","value":18},{"name":"Sensor Type","value":"IO"},{"name":"Broken","value":true}],"manufacturer":{"name":"test","address":"1 house test TX3 6TY","url":"https://test.co.uk"}}'
      );
    });
  });

  it('displays the error messages and clears when values are changed', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('This field is mandatory').should('have.length', 2);
    cy.findByText('Please enter a name').should('exist');
    cy.findByText('Please enter a cost').should('exist');
    cy.findByText('Please enter how many days it would take to replace').should(
      'exist'
    );
    cy.findByText('Please select either True or False').should('exist');

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();
    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').type('14');

    cy.findAllByText('This field is mandatory').should('have.length', 0);
    cy.findByText('Please enter name').should('not.exist');
    cy.findByText('Please select either True or False').should('not.exist');
    cy.findByText('Please enter a cost').should('not.exist');
    cy.findByText('Please enter how many days it would take to replace').should(
      'not.exist'
    );

    // value error from number field

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Cost (£) *').clear();
    cy.findByLabelText('Time to replace (days) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('dsfs');
    cy.findByLabelText('Frame Rate (fps)').type('fdsfsd');
    cy.findByLabelText('Cost (£) *').type('gfdg');
    cy.findByLabelText('Time to replace (days) *').type('32gf');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('Please enter a valid number').should('have.length', 4);

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('12');
    cy.findByLabelText('Frame Rate (fps)').clear();
    cy.findByLabelText('Frame Rate (fps)').type('12');
    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Cost (£) *').clear();
    cy.findByLabelText('Cost (£) *').type('5000');
    cy.findByLabelText('Time to replace (days) *').clear();
    cy.findByLabelText('Time to replace (days) *').type('14');

    cy.findAllByText('Please enter a valid number').should('have.length', 0);

    cy.findByText('Please enter a Manufacturer Name').should('exist');
    cy.findByText('Please enter a Manufacturer URL').should('exist');
    cy.findByText('Please enter a Manufacturer Address').should('exist');

    cy.findByLabelText('Manufacturer Name *').type('test');
    cy.findByLabelText('Manufacturer URL *').type('test.co.uk');
    cy.findByLabelText('Drawing link').type('test.co.uk');
    cy.findByLabelText('Manufacturer Address *').type('1 house test TX3 6TY');

    cy.findByText('Please enter a Manufacturer Name').should('not.exist');
    cy.findByText('Please enter a Manufacturer URL').should('not.exist');
    cy.findByText('Please enter a Manufacturer Address').should('not.exist');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText(
      'Please enter a valid Manufacturer URL. Only "http://" and "https://" links with typical top-level domain are accepted'
    ).should('exist');
    cy.findAllByText(
      'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
    ).should('exist');
    cy.findByLabelText('Manufacturer URL *').clear();
    cy.findByLabelText('Drawing link').clear();
    cy.findByLabelText('Manufacturer URL *').type('https://test.co.uk');
    cy.findByLabelText('Drawing link').type('https://test.co.uk');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByText(
      'Please enter a valid Manufacturer URL. Only "http://" and "https://" links with typical top-level domain are accepted'
    ).should('not.exist');
    cy.findAllByText(
      'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
    ).should('not.exist');
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

    cy.findByRole('link', { name: 'Back to Cameras table view' }).click();

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
    cy.findByLabelText('Resolution (megapixels) *').should('have.value', '12');
    cy.findByLabelText('Frame Rate (fps)').should('have.value', '30');
    cy.findByLabelText('Sensor Type *').should('have.value', 'CMOS');
    cy.findByRole('button', { name: 'Cancel' }).click();
  });

  it('displays the expired landing page message and navigates back to the catalogue home', () => {
    cy.visit('/inventory-management-system/catalogue/items/1fds');

    cy.findByText(
      `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
    ).should('exist');

    cy.findByRole('link', { name: 'Home' }).click();

    cy.findByText('Motion').should('exist');
  });

  it('displays error message when user tries to delete a catalogue item that has children elements', () => {
    cy.visit('/inventory-management-system/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Delete').click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Catalogue item has children elements and cannot be deleted, please delete the children elements first'
        );
      });
  });

  it('delete a catalogue item', () => {
    cy.visit('/inventory-management-system/catalogue/5');
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
    cy.visit('/inventory-management-system/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByRole('button', { name: 'Save' }).click();
  });

  it('displays error message if catalogue item has children elements', () => {
    cy.visit('/inventory-management-system/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type('test_has_children_elements');

    cy.findByLabelText('Measurement Range (Joules) *').type('0');

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Catalogue item has children elements and cannot be edited, please delete the children elements first'
        );
      });
  });

  it('edit a catalogue item (Catalogue item details)', () => {
    cy.visit('/inventory-management-system/catalogue/5');
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
    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"test","description":null,"cost_gbp":6000,"cost_to_rework_gbp":894,"days_to_replace":71,"days_to_rework":605,"drawing_number":"MX43242","drawing_link":"https://example.com","item_model_number":"MXtest"}'
      );
    });
  });

  it('edit a catalogue item (properties)', () => {
    cy.visit('/inventory-management-system/catalogue/5');
    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Measurement Range (Joules) *').type('0');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-items/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"properties":[{"name":"Measurement Range","value":20000}]}'
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
    cy.findByText('Beam Characterization').click();
    cy.findByText('Cameras').click();

    cy.findAllByRole('row', { name: 'Cameras 2 row' })
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
          obsolete_replacement_catalogue_item_id: '2',
        })
      );
    });
  });

  it('make an obsolete item not obsolete', () => {
    cy.visit('/inventory-management-system/catalogue/5');

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
    cy.visit('/inventory-management-system/catalogue/5');

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

  it('can navigate to an items replacment', () => {
    cy.visit('/inventory-management-system/catalogue/5');

    cy.findAllByRole('link', { name: 'Click here' }).eq(0).click();

    cy.url().should('contain', 'inventory-management-system/catalogue/items/6');
  });
});
