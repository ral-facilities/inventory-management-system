describe('App', () => {
  afterEach(() => {});

  let spyErrorLog;
  before(() => {
    Cypress.on('window:before:load', (win) => {
      spyErrorLog = cy.spy(win.console, 'error'); // can be: log, warn
    });
  });

  after(() => {
    cy.clearMocks();
    expect(spyErrorLog).not.to.be.called;
  });

  it('should load correctly', () => {
    cy.visit('/catalogue');
    cy.get('#inventory-management-system').should('be.visible');
  });

  it('displays no categories error message at root', () => {
    cy.intercept({
      method: 'GET',
      url: '**/catalogue-categories?parent_id=null',
    })
      .as('getCatalogueCategoryData')
      .debug();
    cy.visit('/catalogue');
    cy.wait('@getCatalogueCategoryData', { timeout: 10000 }).debug();
    cy.findByText(
      'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
    )
      .should('exist')
      .debug();
  });
});
