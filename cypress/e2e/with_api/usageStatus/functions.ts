export const modifyUsageStatus = (
  values: {
    value: string;
  },
  ignoreChecks?: boolean
) => {
  cy.findByRole('button', { name: 'Add Usage Status' }).click();

  cy.findByLabelText('Value *').clear();
  cy.findByLabelText('Value *').type(values.value);

  cy.findByRole('button', { name: 'Save' }).click();

  if (!ignoreChecks) {
    cy.findByText(values.value).should('exist');
    cy.findByText(values.value).click();
    cy.findAllByText(values.value).should('have.length.gte', 1);
  }
};

export const addUsageStatuses = (
  newUsageStatuses: string[],
  ignoreChecks?: boolean
) => {
  for (let index = 0; index < newUsageStatuses.length; index++) {
    const value = newUsageStatuses[index];
    modifyUsageStatus(
      {
        value: value,
      },
      ignoreChecks
    );

    cy.findByText(value).click();
  }
};

export const deleteUsageStatuses = (values: string[]) => {
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    cy.findByLabelText(`${value} row`).within(() => {
      cy.findByLabelText('Row Actions').click();
    });
    cy.findByLabelText(`Delete usage status ${value}`).click();

    cy.findByRole('button', { name: 'Continue' }).click();
    cy.findByText(value).should('not.exist');
  }
};
