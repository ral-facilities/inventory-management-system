describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.visit('/inventory-management-system/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('should create the breadcrumbs when navigating to a non root catalogue category', () => {
    cy.visit('/inventory-management-system/catalogue/8');
    cy.findByRole('link', { name: 'motion' }).should('be.visible');
    cy.findByText('actuators').should('be.visible');

    cy.findByRole('link', { name: 'motion' }).click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
    cy.findByText('motion').should('be.visible');
    cy.url().should('include', '/catalogue/2');
  });

  it('should navigate back to the root directory when the home button is pressed', () => {
    cy.visit('/inventory-management-system/catalogue/8');
    cy.findByRole('link', { name: 'motion' }).should('exist');
    cy.findByText('actuators').should('exist');
    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
  });

  it('display error message when there is no name when adding a catalogue category', () => {
    cy.findByRole('button', { name: 'add catalogue category' }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a name.');
      });
    cy.findByLabelText('Name *').type('test_dup');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'A catalogue category with the same name already exists within the parent catalogue category'
        );
      });
  });

  it('adds a catalogue category where isLeaf is false', () => {
    cy.findByRole('button', { name: 'add catalogue category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"test","is_leaf":false}'
      );
    });
  });

  it('displays error message when user tries to delete a catalogue category that has children elements', () => {
    cy.findByRole('button', {
      name: 'delete Motion catalogue category button',
    }).click();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Catalogue category has children elements and cannot be deleted, please delete the children elements first'
        );
      });
  });

  it('delete a catalogue category', () => {
    cy.findByRole('button', {
      name: 'delete Beam Characterization catalogue category button',
    }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('adds a catalogue category where isLeaf is true', () => {
    cy.findByRole('button', { name: 'add catalogue category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Property Name is required').should('exist');
    cy.findByText('Select Type is required').should('exist');

    cy.findAllByLabelText('Property Name *').last().type('Updated Field');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByText('Number').click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"test","is_leaf":true,"catalogue_item_properties":[{"name":"Updated Field","type":"boolean","mandatory":false},{"name":"Updated Field","type":"number","unit":"","mandatory":false}]}'
      );
    });
  });

  it('edits a catalogue category (non leaf node)', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByRole('button', {
      name: 'edit Amp Meters catalogue category button',
    }).click();
    cy.findByLabelText('Name *').type('1');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal('{"name":"Amp Meters1"}');
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('displays error message if none of the fields have changed', () => {
    cy.findByRole('button', {
      name: 'edit Beam Characterization catalogue category button',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please edit a form entry before clicking save');
      });
  });

  it('displays error message if it received an unknown error from the api', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByRole('button', {
      name: 'edit Cameras catalogue category button',
    }).click();
    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type('Error 500');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please refresh and try again');
      });
  });
  it('edits a catalogue category with catalogue properties', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByRole('button', {
      name: 'edit Voltage Meters catalogue category button',
    }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findAllByLabelText('Property Name *').first().clear();
    cy.findAllByLabelText('Property Name *').first().type('Updated Field');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"catalogue_item_properties":[{"name":"Updated Field","type":"number","unit":"volts","mandatory":true},{"name":"Accuracy","type":"string","mandatory":true}]}'
      );
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('edits a catalogue category from a leaf node to a non-leaf node ', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByRole('button', {
      name: 'edit Cameras catalogue category button',
    }).click();
    cy.findByLabelText('Catalogue Categories').click();
    cy.findByLabelText('Name *').type('1');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Cameras1","is_leaf":false}'
      );
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('moves multiple catalogue category', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();
        cy.findByRole('button', { name: 'Move here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(patchRequests[0].body)).equal('{"parent_id":null}');
      expect(patchRequests[0].url.toString()).to.contain('/4');
      expect(JSON.stringify(patchRequests[1].body)).equal('{"parent_id":null}');
      expect(patchRequests[1].url.toString()).to.contain('/79');
      expect(JSON.stringify(patchRequests[2].body)).equal('{"parent_id":null}');
      expect(patchRequests[2].url.toString()).to.contain('/19');
    });
  });

  it('copies multiple catalogue category (at root)', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(patchRequests[0].body)).equal(
        '{"name":"Cameras","is_leaf":true,"catalogue_item_properties":[{"name":"Resolution","type":"number","unit":"megapixels","mandatory":true},{"name":"Frame Rate","type":"number","unit":"fps","mandatory":false},{"name":"Sensor Type","type":"string","mandatory":true},{"name":"Sensor brand","type":"string","mandatory":false},{"name":"Broken","type":"boolean","mandatory":true},{"name":"Older than five years","type":"boolean","mandatory":false}]}'
      );
      expect(JSON.stringify(patchRequests[1].body)).equal(
        '{"name":"test_dup","is_leaf":false}'
      );
      expect(JSON.stringify(patchRequests[2].body)).equal(
        '{"name":"Amp Meters","is_leaf":false}'
      );
    });
  });

  it('copies multiple catalogue categories', () => {
    cy.visit('/inventory-management-system/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();
        cy.findByText('Motion').click();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(patchRequests[0].body)).equal(
        '{"name":"Cameras","is_leaf":true,"parent_id":"2","catalogue_item_properties":[{"name":"Resolution","type":"number","unit":"megapixels","mandatory":true},{"name":"Frame Rate","type":"number","unit":"fps","mandatory":false},{"name":"Sensor Type","type":"string","mandatory":true},{"name":"Sensor brand","type":"string","mandatory":false},{"name":"Broken","type":"boolean","mandatory":true},{"name":"Older than five years","type":"boolean","mandatory":false}]}'
      );
      expect(JSON.stringify(patchRequests[1].body)).equal(
        '{"name":"test_dup","is_leaf":false,"parent_id":"2"}'
      );
      expect(JSON.stringify(patchRequests[2].body)).equal(
        '{"name":"Amp Meters","is_leaf":false,"parent_id":"2"}'
      );
    });
  });

  it('category with no data displays no results found', () => {
    cy.visit('/inventory-management-system/catalogue/16');
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });

  it('category with no items displays no items found message', () => {
    cy.visit('/inventory-management-system/catalogue/17');
    cy.findByText(
      'No results found: Try adding an item by using the Add Catalogue Item button in the top right of your screen'
    ).should('exist');
  });

  it('expired url displays search not found message', () => {
    cy.visit('/inventory-management-system/catalogue/not-exist');
    cy.findByText(
      'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
    ).should('exist');
  });

  it('add button disabled when expired url is used', () => {
    cy.visit('/inventory-management-system/catalogue/not-exist');

    cy.findByRole('button', { name: 'add catalogue category' }).should(
      'be.disabled'
    );
  });

  it('when root has no data it displays no catagories error message', () => {
    cy.editEndpointResponse({
      url: '/v1/catalogue-categories/',
      data: [],
      statusCode: 200,
    });
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });
});
