describe('Admin Page', () => {
  it('should render admin page correctly', () => {
    cy.visit('/admin-ims');
    cy.findByText('Units').should('be.visible');
    cy.findByText('Usage Statuses').should('be.visible');
  });

  describe('UsageStatus', () => {
    beforeEach(() => {
      cy.visit('/admin-ims/usage-statuses');
    });
    afterEach(() => {
      cy.clearMocks();
    });

    it('should render table correctly', () => {
      cy.findByText('Value').should('be.visible');
      cy.findByText('Last modified').should('be.visible');
      cy.findByText('Created').should('be.visible');

      cy.findByText('New').should('be.visible');
    });

    it('adds a usage status and deals with errors correctly', () => {
      cy.findByRole('button', { name: 'Add Usage Status' }).click();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please enter a value.').should('be.visible');

      cy.findByLabelText('Value *').type('test_dup');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText(
        'A usage status with the same value already exists. Please enter a different value.'
      ).should('be.visible');

      cy.findByLabelText('Value *').clear();
      cy.findByLabelText('Value *').type('test');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/usage-statuses',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        const request = postRequests[0];
        expect(JSON.stringify(await request.json())).equal('{"value":"test"}');
      });
    });

    it('deletes a usage status', () => {
      cy.findAllByLabelText('Row Actions').first().click();
      cy.findByText('Delete').click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Continue' }).click();

      cy.findBrowserMockedRequests({
        method: 'DELETE',
        url: '/v1/usage-statuses/:id',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];
        expect(request.url.toString()).to.contain('1');
      });
    });

    it('shows error if trying to delete a unit that is in a catalogue category', () => {
      cy.findAllByLabelText('Row Actions').eq(2).click();
      cy.findByText('Delete').click();

      cy.findByRole('button', { name: 'Continue' }).click();

      cy.findByText(
        'This usage status is currently used by one or more items. Remove all uses before deleting it here.'
      );
    });
  });
  describe('Units', () => {
    beforeEach(() => {
      cy.visit('/admin-ims/units');
    });
    afterEach(() => {
      cy.clearMocks();
    });

    it('should render table correctly', () => {
      cy.findByText('Value').should('be.visible');
      cy.findByText('Last modified').should('be.visible');
      cy.findByText('Created').should('be.visible');

      cy.findByText('megapixels').should('be.visible');
    });

    it('adds a unit and deals with errors correctly', () => {
      cy.findByRole('button', { name: 'Add Unit' }).click();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please enter a value.').should('be.visible');

      cy.findByLabelText('Value *').type('test_dup');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText(
        'A unit with the same value already exists. Please enter a different value.'
      ).should('be.visible');

      cy.findByLabelText('Value *').clear();
      cy.findByLabelText('Value *').type('test');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/units',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        const request = postRequests[0];
        expect(JSON.stringify(await request.json())).equal('{"value":"test"}');
      });
    });

    it('deletes a unit', () => {
      cy.findAllByLabelText('Row Actions').first().click();
      cy.findByText('Delete').click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Continue' }).click();

      cy.findBrowserMockedRequests({
        method: 'DELETE',
        url: '/v1/units/:id',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];
        expect(request.url.toString()).to.contain('1');
      });
    });

    it('shows error if trying to delete a unit that is in a catalogue category', () => {
      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Delete').click();

      cy.findByRole('button', { name: 'Continue' }).click();

      cy.findByText(
        'This unit is currently used by one or more catalogue categories. Remove all uses before deleting it here.'
      );
    });
  });

  describe('Spares Definition', () => {
    beforeEach(() => {
      cy.visit('/admin-ims');
    });
    afterEach(() => {
      cy.clearMocks();
    });

    it('disables save button when checkbox is not checked', () => {
      cy.findByText('Spares definition').click();

      cy.findByRole('button', { name: 'Save' }).should('be.disabled');

      cy.findByLabelText('Confirm understanding and proceed checkbox').click();

      cy.findByRole('button', { name: 'Save' }).should('be.enabled');
    });

    it('closes the dialog when Cancel button is clicked', () => {
      cy.findByText('Spares definition').click();

      cy.findByRole('dialog').should('exist');

      cy.findByRole('button', { name: 'Cancel' }).click();

      cy.findByRole('dialog').should('not.exist');
    });

    it('should modify spares definition', () => {
      cy.findByText('Spares definition').click();

      cy.findByRole('combobox').click();
      cy.findByRole('option', { name: 'Scrapped' }).click();

      cy.findByLabelText('Confirm understanding and proceed checkbox').click();
      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'PUT',
        url: '/v1/settings/spares_definition',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        const request = postRequests[0];
        expect(JSON.stringify(await request.json())).equal(
          JSON.stringify({
            usage_statuses: [
              {
                id: '0',
              },
              {
                id: '2',
              },
              {
                id: '3',
              },
            ],
          })
        );
      });
    });

    it('displays error message if spares definition has not changed and clears when value is changed', () => {
      cy.findByText('Spares definition').click();

      cy.findByLabelText('Confirm understanding and proceed checkbox').click();

      cy.findByRole('button', { name: 'Save' }).click();

      cy.findByText(
        'No changes detected in the spares definition. Please update the spares definition or select Cancel to exit.'
      ).should('exist');

      cy.findByRole('combobox').click();
      cy.findByRole('option', { name: 'Scrapped' }).click();

      cy.findByText(
        'No changes detected in the spares definition. Please update the spares definition or select Cancel to exit.'
      ).should('not.exist');
    });

    it('displays error message if spares definition has less then 1 usage status and clears when value is changed', () => {
      cy.findByText('Spares definition').click();

      cy.findByRole('combobox').click();
      cy.findByRole('option', { name: 'Used' }).click();
      cy.findByRole('combobox').click();
      cy.findByRole('option', { name: 'New' }).click();

      cy.findByLabelText('Confirm understanding and proceed checkbox').click();

      cy.findByRole('button', { name: 'Save' }).click();

      cy.findByText(
        'The list must have at least one item. Please add a usage status.'
      ).should('exist');

      cy.findByRole('combobox').click();
      cy.findByRole('option', { name: 'Scrapped' }).click();

      cy.findByText(
        'The list must have at least one item. Please add a usage status.'
      ).should('not.exist');
    });
  });
});
