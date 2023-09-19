describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.visit('/inventory-management-system/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('should create the breadcrumbs from the url', () => {
    cy.visit('/inventory-management-system/catalogue/motion/actuators');
    cy.findByRole('link', { name: 'motion' }).should('be.visible');
    cy.findByText('actuators').should('be.visible');

    cy.findByRole('link', { name: 'motion' }).click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
    cy.findByText('motion').should('be.visible');
    cy.url().should('include', '/catalogue/motion');
  });

  it('should navigate back to the root directory when the home button is pressed', () => {
    cy.visit('/inventory-management-system/catalogue/motion/actuators');
    cy.findByRole('link', { name: 'motion' }).should('exist');
    cy.findByText('actuators').should('exist');
    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
  });

  it('display error message when there is no name when adding a catalogue category', () => {
    cy.findByTestId('AddIcon').click();
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

    cy.findByRole('dialog').findByTestId('AddIcon').click();
    cy.findByLabelText('Property Name *').type('Updated Field');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('dialog').findByTestId('AddIcon').click();

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

  it('edits a catalogue category', () => {
    cy.findByRole('button', {
      name: 'edit Beam Characterization catalogue category button',
    }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Beam Characterization","is_leaf":false}'
      );
      expect(request.url.toString()).to.contain('1');
    });
  });
  it('edits a catalogue category with catalogue properties', () => {
    cy.findByRole('button', {
      name: 'edit Beam Characterization catalogue category button',
    }).click();

    cy.findByLabelText('Catalogue Items').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog').findByTestId('AddIcon').click();
    cy.findByLabelText('Property Name *').type('Updated Field');
    cy.findByLabelText('Select Type *').click();
    cy.findByText('Boolean').click();

    cy.findByRole('dialog').findByTestId('AddIcon').click();

    cy.findAllByLabelText('Property Name *').last().type('Updated Field');
    cy.findAllByLabelText('Select Type *').last().click();
    cy.findByText('Number').click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/catalogue-categories/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        '{"name":"Beam Characterization","is_leaf":true,"catalogue_item_properties":[{"name":"Updated Field","type":"boolean","mandatory":false},{"name":"Updated Field","type":"number","unit":"","mandatory":false}]}'
      );
      expect(request.url.toString()).to.contain('1');
    });
  });

  it('category with no data displays no results found', () => {
    cy.visit('/inventory-management-system/catalogue/X-RAY-Beams');
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });

  it('category with no items displays no items found message', () => {
    cy.visit(
      '/inventory-management-system/catalogue/High-Power-Lasers/Frequency'
    );
    cy.findByText(
      'There are no items. Try adding an item by using the Add Catalogue Item button in the top right of your screen'
    ).should('exist');
  });

  it('expired url displays search not found message', () => {
    cy.visit('/inventory-management-system/catalogue/not-exist');
    cy.findByText(
      'The category you searched for does not exist. Try searching for a different category or use the add button to add the category.'
    ).should('exist');
  });

  it('when root has no data it displays no catagories error message', () => {
    cy.window().then(async (window) => {
      // Reference global instances set in "src/mocks/browser.js".

      const { worker, rest } = window.msw;
      worker.use(
        rest.get('/v1/catalogue-categories/', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json([]));
        })
      );
    });
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    ).should('exist');
  });
});
