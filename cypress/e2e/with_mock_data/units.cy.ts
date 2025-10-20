describe('Units', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
      );
    });
    cy.visit('/settings/units');
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

  it('sets and clears the table filters', () => {
    cy.findByText('megapixels').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');

    cy.findByLabelText('Filter by Value').type('kilogram');
    cy.findByText('kilograms').should('exist');
    cy.findAllByText('megapixels').should('not.exist');

    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('megapixels').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
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
