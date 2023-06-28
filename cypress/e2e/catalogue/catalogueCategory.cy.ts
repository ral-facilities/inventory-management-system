describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.visit('/catalogue');
  });
  it('should create the breadcrumbs from the url', () => {
    cy.visit('/catalogue/motion/actuators');
    cy.findByRole('link', { name: 'motion' }).should('be.visible');
    cy.findByText('actuators').should('be.visible');

    cy.findByRole('link', { name: 'motion' }).click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
    cy.findByText('motion').should('be.visible');
    cy.url().should('include', '/catalogue/motion');
  });

  it('should navigate back to the root directory when the home button is pressed', () => {
    cy.visit('/catalogue/motion/actuators');
    cy.findByRole('link', { name: 'motion' }).should('exist');
    cy.findByText('actuators').should('exist');
    cy.findByTestId('home-button-catalogue').click();
    cy.findByRole('link', { name: 'motion' }).should('not.exist');
    cy.findByText('actuators').should('not.exist');
  });

  it('display error message when there is no name when adding a catalogue category', () => {
    cy.findByTestId('add-button-catalogue').click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('Please enter a name. Request failed with status code 422');
      });
    cy.findByLabelText('Name*').type('test_dup');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'A catalogue category with the same name already exists within the parent catalogue category. Request failed with status code 409'
        );
      });
  });

  it('adds a catalogue category', () => {
    cy.findByTestId('add-button-catalogue').click();
    cy.findByLabelText('Name*').type('test');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/catalogue-categories',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(2);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal('{"name":"test"}');
    });
  });
});
