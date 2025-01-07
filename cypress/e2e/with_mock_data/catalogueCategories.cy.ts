describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  function createMockData() {
    const data = [];
    for (let index = 1; index < 50; index++) {
      data.push({
        id: index.toString(),
        name: 'Test ' + index.toString(),
        parent_id: null,
        code: index.toString(),
        is_leaf: false,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [],
      });
    }
    return data;
  }

  it('should create the breadcrumbs when navigating to a non root catalogue category', () => {
    cy.visit('/catalogue/8');
    cy.findByRole('link', { name: 'Motion' }).should('be.visible');
    cy.findByText('Actuators').should('be.visible');

    cy.findByRole('link', { name: 'Motion' }).click();
    cy.findByRole('link', { name: 'Motion' }).should('not.exist');
    cy.findByText('Actuators').should('exist');
    cy.findByText('Motion').should('be.visible');
    cy.url().should('include', '/catalogue/2');
  });

  it('displays and hides filters, applies and clears name filter on catalogue categories', () => {
    cy.visit('/catalogue');
    cy.findByText('Motion').should('exist');
    cy.findByText('Show Filters').click();
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByLabelText('Filter by Name').type('beam');
    cy.findByText('Motion').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('Motion').should('exist');
    cy.findByText('Hide Filters').click();
    cy.findByText('Show Filters').should('exist');
  });

  it('should navigate back to the root directory when the home button is pressed', () => {
    cy.visit('/catalogue/8');
    cy.findByRole('link', { name: 'Motion' }).should('exist');
    cy.findByText('Actuators').should('exist');
    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
    cy.findByRole('link', { name: 'Motion' }).should('not.exist');
    cy.findByText('Actuators').should('not.exist');
  });

  it('should be able to navigate through categories while preserving the page state when going back', () => {
    cy.editEndpointResponse({
      url: '/v1/catalogue-categories',
      data: createMockData(),
      statusCode: 200,
    });

    cy.findByText('Test 1').should('exist');
    cy.findByText('Test 45').should('not.exist');
    cy.location('search').should('eq', '');

    // Categories per page
    cy.findByRole('combobox', { name: 'Categories per page' }).within(() =>
      cy.findByText('30').should('be.visible')
    );
    cy.findByRole('combobox', { name: 'Categories per page' }).click();
    cy.findByRole('listbox').within(() => {
      cy.findByText('45').click();
    });
    cy.findByText('Test 45').should('exist');
    cy.location('search').should(
      'eq',
      '?state=N4IgDiBcpghg5gUwMoEsBeioBYCsAacBRASQDsATRADygAYBfBoA'
    );

    cy.findByText('Test 1').click();
    cy.location('search').should('eq', '');
    cy.findByRole('combobox', { name: 'Categories per page' }).within(() =>
      cy.findByText('30').should('be.visible')
    );

    // Ensure same state is recovered
    cy.go('back');

    cy.location('search').should(
      'eq',
      '?state=N4IgDiBcpghg5gUwMoEsBeioBYCsAacBRASQDsATRADygAYBfBoA'
    );
    cy.findByRole('combobox', { name: 'Categories per page' }).within(() =>
      cy.findByText('45').should('be.visible')
    );
  });

  it('should be able to change page', () => {
    cy.editEndpointResponse({
      url: '/v1/catalogue-categories',
      data: createMockData(),
      statusCode: 200,
    });

    cy.findByText('Test 1').should('exist');
    cy.findByRole('button', { name: 'Go to page 2' }).click();

    cy.findByText('Test 31').should('exist');
  });

  it('should be able to change max results', () => {
    cy.editEndpointResponse({
      url: '/v1/catalogue-categories',
      data: createMockData(),
      statusCode: 200,
    });

    cy.findByText('Test 1').should('exist');
    cy.findByText('Test 45').should('not.exist');
    cy.findByRole('combobox').click();
    cy.findByRole('option', { name: '45' }).click();

    cy.findByText('Test 45').should('exist');
  });

  it('display error message when there is no name when adding a catalogue category', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
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
          'A catalogue category with the same name already exists within the same parent catalogue category. Please enter a different name.'
        );
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('adds a catalogue category where isLeaf is false', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    // Doesn't seem to wait for save to click on CI, so allowing an extra pause here
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({ name: 'test', is_leaf: false })
      );
    });
  });

  it('"duplicate" a catalogue category', () => {
    cy.findByRole('button', {
      name: 'actions Motion catalogue category button',
    }).click();
    cy.findByText('Duplicate').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({ name: 'Motion_copy_1', is_leaf: false })
      );
    });
  });

  it('displays error message when user tries to delete a catalogue category that has children elements', () => {
    cy.findByRole('button', {
      name: 'actions Motion catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
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
    cy.findByRole('button', { name: 'Continue' }).should('be.disabled');
  });

  it('delete a catalogue category', () => {
    cy.findByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
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
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Please enter a property name.').should('exist');

    cy.findAllByLabelText('Property Name *').last().type('Updated Field 2');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByText('Number').click();
    cy.findAllByLabelText('Select Unit').last().click();
    cy.findByRole('option', { name: 'millimeters' }).click();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test',
          is_leaf: true,
          properties: [
            { name: 'Updated Field 1', type: 'boolean', mandatory: false },
            {
              name: 'Updated Field 2',
              type: 'number',
              unit_id: '5',
              mandatory: false,
            },
          ],
        })
      );
    });
  });

  it('adds a catalogue category where isLeaf is true with a list of allowed values', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Please enter a property name.').should('exist');

    cy.findAllByLabelText('Property Name *').last().type('Updated Field 2');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByText('Number').click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(0).type('10');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (postRequests) => {
      expect(postRequests.length).equal(1);
      const request = postRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test',
          is_leaf: true,
          properties: [
            { name: 'Updated Field 1', type: 'boolean', mandatory: false },
            {
              name: 'Updated Field 2',
              type: 'number',
              mandatory: false,
              allowed_values: { type: 'list', values: [10] },
            },
          ],
        })
      );
    });
  });

  it('displays the allowed values list error states (Text)', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Text').click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findAllByLabelText('Property Name *').last().type('Updated Field 2');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByRole('option', { name: 'Text' }).click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByLabelText('List item').eq(2).type('10');
    cy.findAllByLabelText('List item').eq(3).type('10');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('Please enter a value.').should('have.length', 2);
    cy.findAllByText('Duplicate value.').should('have.length', 2);

    // Clearing the errors

    cy.findAllByLabelText('List item').eq(3).clear();
    cy.findAllByLabelText('List item').eq(3).type('11');
    cy.findAllByText('Duplicate value').should('have.length', 0);

    cy.findAllByLabelText('List item').eq(0).type('10');
    cy.findAllByLabelText('List item').eq(1).type('11');
    cy.findAllByText('Please enter a value').should('have.length', 0);
  });

  it('displays the allowed values list error states and check if the error states are in the correct location (number)', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Number').click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(0).type('dsadd');
    cy.findAllByLabelText('List item').eq(1).type('10');

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findAllByLabelText('Property Name *').eq(1).type('Updated Field 2');
    cy.findAllByLabelText('Select Type *').eq(1).click();
    cy.findByRole('option', { name: 'Number' }).click();
    cy.findAllByLabelText('Select Allowed values *').eq(1).click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByLabelText('List item').eq(2).type('dsadd');
    cy.findAllByLabelText('List item').eq(3).type('10');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('Please enter a valid number.').should('have.length', 2);

    // Clearing the errors

    cy.findAllByLabelText('Delete list item').eq(0).click();
    cy.findAllByLabelText('Delete list item').eq(1).click();
    cy.findAllByText('Please enter a valid number.').should('have.length', 0);
  });

  it('displays the allowed values list error states (number)', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();
    cy.findByLabelText('Property Name *').type('Updated Field 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Number').click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findAllByLabelText('Property Name *').eq(1).type('Updated Field 2');
    cy.findAllByLabelText('Select Type *').eq(1).click();
    cy.findByRole('option', { name: 'Number' }).click();
    cy.findAllByLabelText('Select Allowed values *').eq(1).click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(1).click();
    cy.findAllByLabelText('List item').eq(2).type('10');
    cy.findAllByLabelText('List item').eq(3).type('10');

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findAllByLabelText('Property Name *').last().type('Updated Field 3');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByRole('option', { name: 'Number' }).click();
    cy.findAllByLabelText('Select Allowed values *').last().click();
    cy.findByRole('option', { name: 'List' }).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(2).click();
    cy.findAllByRole('button', { name: 'Add list item' }).eq(2).click();
    cy.findAllByLabelText('List item').eq(4).type('10b');
    cy.findAllByLabelText('List item').eq(5).type('10c');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('Please enter a value.').should('have.length', 2);
    cy.findAllByText('Duplicate value.').should('have.length', 2);
    cy.findAllByText('Please enter a valid number.').should('have.length', 2);

    // Clearing the errors

    cy.findAllByLabelText('List item').eq(4).clear();
    cy.findAllByLabelText('List item').eq(4).type('11');
    cy.findAllByLabelText('List item').eq(5).clear();
    cy.findAllByLabelText('List item').eq(5).type('12');
    cy.findAllByText('Please enter a valid number.').should('have.length', 0);

    cy.findAllByLabelText('List item').eq(3).clear();
    cy.findAllByLabelText('List item').eq(3).type('11');
    cy.findAllByText('Duplicate value.').should('have.length', 0);

    cy.findAllByLabelText('List item').eq(0).first().type('10');
    cy.findAllByLabelText('List item').eq(1).first().type('11');
    cy.findAllByText('Please enter a value.').should('have.length', 0);
  });

  it('displays error message when duplicate names for properties are entered', () => {
    cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
    cy.findByLabelText('Name *').type('test');

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findByLabelText('Property Name *').type('Duplicate');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('button', {
      name: 'Add catalogue category field entry',
    }).click();

    cy.findAllByLabelText('Property Name *').last().type('Duplicate');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByText('Number').click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText(
      'Duplicate property name. Please change the name or remove the property.'
    ).should('exist');
  });

  it('edits a catalogue category (non leaf node)', () => {
    cy.visit('/catalogue/1');
    cy.findByRole('button', {
      name: 'actions Amp Meters catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Amp Meters catalogue category button',
    }).click();
    cy.findByLabelText('Name *').type('1');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({ name: 'Amp Meters1' })
      );
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('displays error message if none of the fields have changed', () => {
    cy.findByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Beam Characterization catalogue category button',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'There have been no changes made. Please change the name field value or press Close.'
        );
      });
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
  });

  it('opens add dialog from directory and then closes it', () => {
    cy.visit('/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add Catalogue Category' }).click();
      });

    cy.findByLabelText('Name *').should('be.visible');

    cy.findByRole('button', { name: 'Cancel' }).click();

    //checks directory is the only dialog on screen
    cy.findAllByRole('dialog').should('have.length', 1);
  });

  it('can move multiple catalogue categories', () => {
    cy.visit('/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();
        cy.findByText('Motion').click();

        cy.startSnoopingBrowserMockedRequest();
        cy.findByRole('button', { name: 'Move here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({ parent_id: '2' })
      );
      expect(patchRequests[0].url.toString()).to.contain('/4');
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({ parent_id: '2' })
      );
      expect(patchRequests[1].url.toString()).to.contain('/79');
      expect(JSON.stringify(await patchRequests[2].json())).equal(
        JSON.stringify({ parent_id: '2' })
      );
      expect(patchRequests[2].url.toString()).to.contain('/19');
    });
  });

  it('copies multiple catalogue category (at root)', () => {
    cy.visit('/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();

        cy.startSnoopingBrowserMockedRequest();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          id: '4',
          name: 'Cameras',
          parent_id: null,
          code: 'cameras',
          is_leaf: true,
          properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              unit_id: '1',
              mandatory: true,
              allowed_values: null,
              id: '1',
            },
            {
              name: 'Frame Rate',
              type: 'number',
              unit: 'fps',
              unit_id: '2',
              mandatory: false,
              allowed_values: null,
              id: '2',
            },
            {
              name: 'Sensor Type',
              type: 'string',
              unit: null,
              unit_id: null,
              mandatory: true,
              allowed_values: null,
              id: '3',
            },
            {
              name: 'Sensor brand',
              type: 'string',
              unit: null,
              unit_id: null,
              mandatory: false,
              allowed_values: null,
              id: '4',
            },
            {
              name: 'Broken',
              type: 'boolean',
              unit: null,
              unit_id: null,
              mandatory: true,
              allowed_values: null,
              id: '5',
            },
            {
              name: 'Older than five years',
              type: 'boolean',
              unit: null,
              unit_id: null,
              mandatory: false,
              allowed_values: null,
              id: '6',
            },
          ],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({
          id: '79',
          name: 'test_dup',
          parent_id: null,
          code: 'test_dup',
          is_leaf: false,
          properties: [],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await patchRequests[2].json())).equal(
        JSON.stringify({
          id: '19',
          name: 'Amp Meters',
          parent_id: null,
          code: 'amp-meters',
          is_leaf: false,
          properties: [],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
    });
  });

  it('copies multiple catalogue categories', () => {
    cy.visit('/catalogue/1');
    cy.findByLabelText('Cameras checkbox').click();
    cy.findByLabelText('test_dup checkbox').click();
    cy.findByLabelText('Amp Meters checkbox').click();
    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('navigate to catalogue home').click();
        cy.findByText('Motion').click();

        cy.startSnoopingBrowserMockedRequest();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(3);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          id: '4',
          name: 'Cameras',
          parent_id: '2',
          code: 'cameras',
          is_leaf: true,
          properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              unit_id: '1',
              mandatory: true,
              allowed_values: null,
              id: '1',
            },
            {
              name: 'Frame Rate',
              type: 'number',
              unit: 'fps',
              unit_id: '2',
              mandatory: false,
              allowed_values: null,
              id: '2',
            },
            {
              name: 'Sensor Type',
              type: 'string',
              unit: null,
              unit_id: null,
              mandatory: true,
              allowed_values: null,
              id: '3',
            },
            {
              name: 'Sensor brand',
              type: 'string',
              unit: null,
              unit_id: null,
              mandatory: false,
              allowed_values: null,
              id: '4',
            },
            {
              name: 'Broken',
              type: 'boolean',
              unit: null,
              unit_id: null,
              mandatory: true,
              allowed_values: null,
              id: '5',
            },
            {
              name: 'Older than five years',
              type: 'boolean',
              unit: null,
              unit_id: null,
              mandatory: false,
              allowed_values: null,
              id: '6',
            },
          ],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({
          id: '79',
          name: 'test_dup',
          parent_id: '2',
          code: 'test_dup',
          is_leaf: false,
          properties: [],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await patchRequests[2].json())).equal(
        JSON.stringify({
          id: '19',
          name: 'Amp Meters',
          parent_id: '2',
          code: 'amp-meters',
          is_leaf: false,
          properties: [],
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
    });
  });

  it('category with no data displays no results found', () => {
    cy.visit('/catalogue/16');
    cy.findByText(
      'There are no catalogue categories. Please add a category using the button in the top left of your screen'
    ).should('exist');
  });

  it('category with no items displays no items found message', () => {
    cy.visit('/catalogue/17');
    cy.findByText(
      'No results found: Try adding an item by using the Add Catalogue Item button on the top left of your screen'
    ).should('exist');
  });

  it('expired url displays search not found message', () => {
    cy.visit('/catalogue/not-exist');
    cy.findByText(
      `The catalogue route you are trying to access doesn't exist. Please click the Home button to navigate back to the Catalogue Home page.`,
      { timeout: 10000 }
    ).should('exist');
  });

  it('when root has no data it displays no categories error message', () => {
    cy.editEndpointResponse({
      url: '/v1/catalogue-categories',
      data: [],
      statusCode: 200,
    });
    cy.findByText(
      'There are no catalogue categories. Please add a category using the button in the top left of your screen'
    ).should('exist');
  });

  it('add a new property (type string)', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    cy.findByLabelText('Property Name *').type('test 1');
    cy.findAllByLabelText('Select is mandatory?').last().click();
    cy.findByRole('option', { name: 'Yes' }).click();
    cy.findByLabelText('Default value *').type('test');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          type: 'string',
          mandatory: true,
          default_value: 'test',
        })
      );
    });
  });
  it('add a new property (type number)', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    cy.findByLabelText('Property Name *').type('test 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByRole('option', { name: 'Number' }).click();
    cy.findByLabelText('Select is mandatory?').click();
    cy.findByRole('option', { name: 'No' }).click();
    cy.findByLabelText('Default value').type('1');
    cy.findByLabelText('Select Unit').click();
    cy.findByRole('option', { name: 'millimeters' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          type: 'number',
          unit_id: '5',
          mandatory: false,
          default_value: 1,
        })
      );
    });
  });

  it('add a new property (type boolean)', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    cy.findByLabelText('Property Name *').type('test 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByRole('option', { name: 'Boolean' }).click();
    cy.findByLabelText('Select Default value').click();
    cy.findByRole('option', { name: 'False' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          type: 'boolean',
          mandatory: false,
          default_value: false,
        })
      );
    });
  });

  it('add a new property (type string and with allowed values )', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    cy.findByLabelText('Property Name *').type('test 1');

    cy.findAllByLabelText('Select is mandatory?').last().click();
    cy.findByRole('option', { name: 'Yes' }).click();

    cy.findByLabelText('Select Allowed values *').click();
    cy.findByRole('option', { name: 'List' }).click();

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(0).type('10');

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(1).type('11');

    cy.findByLabelText('Select Default value *').click();
    cy.findByRole('option', { name: '11' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          type: 'string',
          mandatory: true,
          allowed_values: { type: 'list', values: ['10', '11'] },
          default_value: '11',
        })
      );
    });
  });

  it('add a new property (type number and with allowed values)', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    cy.findByLabelText('Property Name *').type('test 1');
    cy.findByLabelText('Select Type *').click();
    cy.findByRole('option', { name: 'Number' }).click();
    cy.findAllByLabelText('Select is mandatory?').last().click();
    cy.findByRole('option', { name: 'No' }).click();

    cy.findByLabelText('Select Allowed values *').click();
    cy.findByRole('option', { name: 'List' }).click();

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(0).type('10');

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(1).type('11');

    cy.findByLabelText('Select Default value').click();
    cy.findByRole('option', { name: '11' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          type: 'number',
          mandatory: false,
          allowed_values: { type: 'list', values: [10, 11] },
          default_value: 11,
        })
      );
    });
  });

  it('display add form errors on property dialog', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByText('Add Property').click();

    // Initiate missing value errors

    cy.findByLabelText('Select Allowed values *').click();
    cy.findByRole('option', { name: 'List' }).click();

    cy.findByRole('button', { name: 'Add list item' }).click();

    cy.findAllByLabelText('Select is mandatory?').last().click();
    cy.findByRole('option', { name: 'Yes' }).click();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Please enter a property name.').should('exist');
    cy.findByText('Please enter a value.').should('exist');
    cy.findByText(
      'Please enter a valid value as this field is mandatory.'
    ).should('exist');

    // Clear error missing value errors and initiate duplicate errors

    cy.findByLabelText('Property Name *').type('Axis');

    cy.findAllByLabelText('List item').eq(0).type('test1');

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').eq(1).type('test1');

    cy.findByLabelText('Select Default value *').click();
    cy.findAllByRole('option', { name: 'test1' }).first().click();

    cy.findByText('Please enter a property name.').should('not.exist');
    cy.findByText('Please enter a value.').should('not.exist');
    cy.findByText(
      'Please enter a valid value as this field is mandatory.'
    ).should('not.exist');

    cy.findAllByText('Duplicate value.').should('have.length', 1);

    cy.findAllByLabelText('List item').eq(1).clear();
    cy.findAllByLabelText('List item').eq(1).type('test2');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Duplicate property name. Please change the name.').should(
      'exist'
    );

    // Clear duplicate value errors and initiate invalid type errors

    cy.findByLabelText('Property Name *').clear();
    cy.findByLabelText('Property Name *').type('test');

    cy.findByLabelText('Select Type *').click();
    cy.findByRole('option', { name: 'Number' }).click();

    cy.findByLabelText('Select Default value *').click();
    cy.findAllByRole('option', { name: 'test2' }).first().click();

    cy.findByText('Duplicate property name. Please change the name.').should(
      'not.exist'
    );
    cy.findByText('Duplicate value.').should('not.exist');

    cy.findAllByText('Please enter a valid number.').should('have.length', 1);

    cy.findAllByLabelText('List item').eq(1).clear();
    cy.findAllByLabelText('List item').eq(1).type('hgjf');

    cy.findAllByText('Please enter a valid number.').should('have.length', 1);

    // Clear the invalid type errors
    cy.findAllByLabelText('List item').eq(1).clear();
    cy.findAllByLabelText('List item').eq(1).type('2');

    cy.findAllByLabelText('List item').eq(0).clear();
    cy.findAllByLabelText('List item').eq(0).type('1');

    cy.findByLabelText('Select Default value *').click();
    cy.findAllByRole('option', { name: '2' }).first().click();

    cy.findByText('Please enter a valid number.').should('not.exist');
  });

  it('edits an existing property', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByLabelText('Edit property Axis').click();

    cy.findByLabelText('Property Name *').clear();
    cy.findByLabelText('Property Name *').type('test 1');

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').last().type('a');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties/:property_id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
          allowed_values: { type: 'list', values: ['y', 'x', 'z', 'a'] },
        })
      );
    });
  });

  it('edits an existing property name', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByLabelText('Edit property Axis').click();

    cy.findByLabelText('Property Name *').clear();
    cy.findByLabelText('Property Name *').type('test 1');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties/:property_id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          name: 'test 1',
        })
      );
    });
  });

  it('edits an existing property allowed values', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByLabelText('Edit property Axis').click();

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findAllByLabelText('List item').last().type('a');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Add Property').should('have.length', 1);

    // Active waiting (test column filters) for the patch request below
    cy.findAllByLabelText('Filter by Name').last().type('Axis');
    cy.findByRole('button', { name: 'Clear Filters' }).should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should(
      'be.not.disabled'
    );

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:catalogue_category_id/properties/:property_id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(await request.json())).equal(
        JSON.stringify({
          allowed_values: { type: 'list', values: ['y', 'x', 'z', 'a'] },
        })
      );
    });
  });

  it('display edit form errors on property dialog (mandatory errors)', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByLabelText('Edit property Axis').click();

    // Initiate missing value errors

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();

    cy.findByLabelText('Property Name *').clear();

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Please enter a property name.').should('exist');
    cy.findAllByText('Please enter a value.').should('have.length', 3);
  });

  it('display edit form errors on property dialog', () => {
    cy.visit('/catalogue/10');

    cy.findByRole('button', {
      name: 'actions Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findByRole('menuitem', {
      name: 'edit Dry Vacuum Pumps catalogue category button',
    }).click();

    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByLabelText('Edit property Pumping Speed').click();

    // Clear error missing value errors and initiate duplicate errors
    cy.findByLabelText('Property Name *').clear();
    cy.findByLabelText('Property Name *').type('Axis');

    cy.findByRole('checkbox', {
      name: 'Confirm understanding and proceed checkbox',
    }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();
    cy.findByRole('button', { name: 'Add list item' }).click();

    cy.findAllByLabelText('List item').eq(3).type('1');
    cy.findAllByLabelText('List item').eq(4).type('1');
    cy.findAllByText('Duplicate value.').should('have.length', 1);
    cy.findAllByLabelText('List item').eq(5).type('1');
    cy.findAllByText('Duplicate value.').should('have.length', 1);

    cy.findByText('Duplicate property name. Please change the name.').should(
      'exist'
    );

    // Clear duplicate value errors

    cy.findByLabelText('Property Name *').clear();
    cy.findByLabelText('Property Name *').type('test');
    cy.findAllByLabelText('List item').eq(4).clear();
    cy.findAllByLabelText('List item').eq(4).type('test2');
    cy.findAllByLabelText('List item').eq(5).clear();
    cy.findAllByLabelText('List item').eq(5).type('test3');

    cy.findByText('Duplicate property name. Please change the name.').should(
      'not.exist'
    );
    cy.findByText('Duplicate value.').should('not.exist');

    // initiate invalid type errors

    cy.findAllByText('Please enter a valid number.').should('have.length', 2);

    // Clear the invalid type errors
    cy.findAllByLabelText('List item').eq(3).clear();
    cy.findAllByLabelText('List item').eq(3).type('900');
    cy.findAllByLabelText('Delete list item').eq(1).click();
    cy.findAllByLabelText('Delete list item').eq(1).click();

    cy.findByText('Please enter a valid number.').should('not.exist');
  });
  // The tooltip tests are very flaky; issue to fix later: https://github.com/ral-facilities/inventory-management-system/issues/637
  it.skip('display overflow tooltip on hover', () => {
    // Card view
    cy.findByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    ).trigger('mouseenter', { force: true });
    cy.findAllByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    ).should('have.length', 2);

    // Navigate to table view
    cy.findAllByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    )
      .first()
      .click();

    // Breadcrumbs
    cy.findByText(
      'overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow'
    ).trigger('mouseover');

    cy.findAllByText(
      'overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow'
    ).should('have.length', 2);

    cy.findAllByText(
      'overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow'
    )
      .first()
      .trigger('mouseout');

    // Table cell

    cy.findByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    ).should('exist');

    cy.findByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    ).trigger('mouseover', { force: true });

    cy.findAllByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    ).should('have.length', 2);

    cy.findAllByText(
      'Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow Overflow'
    )
      .first()
      .trigger('mouseout');
  });
});
