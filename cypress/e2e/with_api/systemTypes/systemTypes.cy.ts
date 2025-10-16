describe('System Types', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
      );
    });
    cy.visit('/settings/system-types');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('View system types ', () => {
    // Check system types render correctly
    cy.findByText('Storage').should('exist');
    cy.findByText('Operational').should('exist');
    cy.findByText('Scrapped').should('exist');

    // Check that spares defintion button filters the table
    cy.findByRole('button', { name: 'Show Spares Definition' }).click();

    cy.findByText('Operational').should('not.exist');
    cy.findByText('Scrapped').should('not.exist');
    cy.findByText('Storage').should('exist');

    // filters by spares defintion from the settings page

    cy.findByRole('button', { name: 'navigate to settings home' }).click();
    cy.findByText('Spares Definition').click();
    cy.findByText('Operational').should('not.exist');
    cy.findByText('Scrapped').should('not.exist');
    cy.findByText('Storage').should('exist');
  });
});
