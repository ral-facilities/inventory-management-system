describe('Manufacturer', () => {
  beforeEach(() => {
    cy.visit('/manufacturer');
  });

  it('should render in table headers', () => {
    cy.visit('/manufacturer');
    cy.findByText('Actions').should('be.visible');
    cy.findByText('Name').should('be.visible');
    cy.findByText('URL').should('be.visible');
    cy.findByText('Address').should('be.visible');
  });

  it('should render manufacturer data', () => {
    cy.visit('/manufacturer');

    cy.findByText('Manufacturer A').should('be.visible');
    cy.findByText('Manufacturer B').should('be.visible');
    cy.findByText('Manufacturer C').should('be.visible');
    cy.findByText('example.com').should('be.visible');
    cy.findByText('test.co.uk').should('be.visible');
    cy.findByText('123test.com').should('be.visible');
    cy.findByText('10 My Street').should('be.visible');
    cy.findByText('11 My Street').should('be.visible');
    cy.findByText('12 My Street').should('be.visible');
  });

  it('manufacturer url is correct and opens new webpage', () => {
    cy.visit('/manufacturer');
    const url = cy.findByText('example.com');

    url
      .should('be.visible')
      .then((url) => {
        expect(url).to.have.attr('target', '_blank');
        url.attr('target', '_self');
      })
      .click();
    cy.url().should('include', 'example.com');
  });
});
