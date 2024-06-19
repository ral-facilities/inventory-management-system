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
