describe('Catalogue Items', () => {
  beforeEach(() => {
    cy.visit(
      '/inventory-management-system/catalogue/beam-characterization/cameras'
    );
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('adds a catalogue item', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Description').type('test Description');
    cy.findByLabelText('Resolution (megapixels) *').type(18);
    cy.findByLabelText('Frame Rate (fps)').type(60);
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
        '{"catalogue_category_id":"4","name":"test","description":"test Description","properties":[{"name":"Resolution","value":18},{"name":"Frame Rate","value":60},{"name":"Sensor Type","value":"IO"},{"name":"Sensor brand","value":"pixel"},{"name":"Broken","value":true},{"name":"Older than five years","value":false}],"manufacturer":{"name":"test","address":"1 house test TX3 6TY","web_url":"https://test.co.uk"}}'
      );
    });
  });

  it('adds a catalogue item only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Resolution (megapixels) *').type(18);
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();

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
        '{"catalogue_category_id":"4","name":"test","description":"","properties":[{"name":"Resolution","value":18},{"name":"Sensor Type","value":"IO"},{"name":"Broken","value":true}],"manufacturer":{"name":"test","address":"1 house test TX3 6TY","web_url":"https://test.co.uk"}}'
      );
    });
  });

  it('displays the error messages and clears when values are changed', () => {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('This field is mandatory').should('have.length', 2);
    cy.findByText('Please enter name').should('exist');
    cy.findByText('Please select either True or False').should('exist');

    cy.findByLabelText('Name *').type('test');
    cy.findByLabelText('Resolution (megapixels) *').type(18);
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Broken *').click();
    cy.findByText('True').click();

    cy.findAllByText('This field is mandatory').should('have.length', 0);
    cy.findByText('Please enter name').should('not.exist');
    cy.findByText('Please select either True or False').should('not.exist');

    // value error from number field

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('dsfs');
    cy.findByLabelText('Frame Rate (fps)').type('fdsfsd');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('Please enter a valid number').should('have.length', 2);

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Resolution (megapixels) *').type('12');
    cy.findByLabelText('Frame Rate (fps)').clear();
    cy.findByLabelText('Frame Rate (fps)').type('12');

    cy.findAllByText('Please enter a valid number').should('have.length', 0);

    cy.findByText('Please enter a Manufacturer Name').should('exist');
    cy.findByText('Please enter a Manufacturer URL').should('exist');
    cy.findByText('Please enter a Manufacturer Address').should('exist');

    cy.findByLabelText('Manufacturer Name *').type('test');
    cy.findByLabelText('Manufacturer URL *').type('test.co.uk');
    cy.findByLabelText('Manufacturer Address *').type('1 house test TX3 6TY');

    cy.findByText('Please enter a Manufacturer Name').should('not.exist');
    cy.findByText('Please enter a Manufacturer URL').should('not.exist');
    cy.findByText('Please enter a Manufacturer Address').should('not.exist');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText(
      'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
    ).should('exist');
    cy.findByLabelText('Manufacturer URL *').clear();
    cy.findByLabelText('Manufacturer URL *').type('https://test.co.uk');

    cy.findByText(
      'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
    ).should('not.exist');
  });

  it('displays the table view correctly', () => {
    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');
  });

  it.only('navigates to the landing page, toggles the properties and navigates back to the table view', () => {
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

  it('displays the expired landing page message and navigates back to the catalogue home', () => {
    cy.visit('/inventory-management-system/catalogue/items/1fds');

    cy.findByText(
      `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
    ).should('exist');

    cy.findByRole('link', { name: 'Home' }).click();

    cy.findByText('Motion').should('exist');
  });
  it('checks the href property of the manufacturer link', () => {
    // Find the element containing the link
    const row = cy.findByRole('row', { name: 'Cameras 1 row' });

    row.within(() => {
      // Find the link element
      cy.findByText('http://example.com')
        .should('have.attr', 'href')
        .should('include', 'http://example.com'); // Check href attribute value

      cy.findByText('http://example.com')
        .should('have.attr', 'target')
        .should('include', '_blank'); // Check target attribute value
    });
  });
});
