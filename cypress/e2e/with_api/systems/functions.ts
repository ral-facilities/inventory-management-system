export const modifySystem = (values: {
  index?: number;
  name: string;
  description?: string;
  location?: string;
  owner?: string;
  importance: string;
}) => {
  if (typeof values.index === 'number') {
    cy.findAllByLabelText('Row Actions').eq(values.index).click();
    cy.findByText('Edit').click();
  } else {
    cy.findByRole('button', { name: 'add system' }).click();
  }
  cy.findByLabelText('Name *').clear();
  cy.findByLabelText('Name *').type(values.name);
  if (values.description) {
    cy.findByLabelText('Description').clear();
    cy.findByLabelText('Description').type(values.description);
  } else {
    cy.findByLabelText('Description').clear();
  }

  if (values.location) {
    cy.findByLabelText('Location').clear();
    cy.findByLabelText('Location').type(values.location);
  } else {
    cy.findByLabelText('Location').clear();
  }

  if (values.owner) {
    cy.findByLabelText('Owner').clear();
    cy.findByLabelText('Owner').type(values.owner);
  } else {
    cy.findByLabelText('Owner').clear();
  }

  cy.findByLabelText('Importance').click();
  cy.findByRole('option', { name: values.importance }).click();

  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByText(values.name).click();

  cy.findAllByText(values.name).should('have.length.gte', 1);
  values.description && cy.findByText(values.description).should('exist');
  values.owner && cy.findByText(values.owner).should('exist');
  values.location && cy.findByText(values.location).should('exist');
  cy.findByText(values.importance).should('exist');

  cy.go('back');
};

export const saveAsSystem = (name: string, index: number) => {
  cy.findAllByLabelText('Row Actions').eq(index).click();
  cy.findByText(`Save as`).click();

  cy.findByRole('button', { name: 'Save' }).click();

  cy.findAllByText(`${name}_copy_1`).should('exist');
};

export const deleteSystem = (name: string, index: number) => {
  cy.findAllByLabelText('Row Actions').eq(index).click();
  cy.findByText(`Delete`).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.findByText(name).should('not.exist');
};

export const copyToSystems = (values: {
  checkedSystems: number[];
  checkedSystemsNames: string[];
}) => {
  cy.intercept({
    method: 'POST',
    url: '**/systems',
  }).as('postSystems');
  cy.intercept({
    method: 'GET',
    url: '**/systems/*',
  }).as('getSystemsData');

  for (let i = 0; i < values.checkedSystems.length; i++) {
    cy.findAllByLabelText('Toggle select row')
      .eq(values.checkedSystems[i])
      .click();
  }

  cy.findByRole('button', { name: 'Copy to' }).click();

  cy.findByRole('dialog').within(() => {
    cy.findByText('Storage').click();
  });

  cy.findByRole('button', { name: 'Copy here' }).click();
  cy.wait('@postSystems', { timeout: 10000 });
  cy.findByRole('dialog').should('not.exist');
  cy.findByText('Storage').click();
  cy.wait('@getSystemsData', { timeout: 10000 });
  for (let i = 0; i < values.checkedSystems.length; i++) {
    deleteSystem(values.checkedSystemsNames[i], 0);
  }
  cy.go('back');
};

export const moveToSystems = (values: {
  checkedSystems: number[];
  checkedSystemsNames: string[];
}) => {
  cy.intercept({
    method: 'PATCH',
    url: '**/systems/*',
  }).as('patchSystems');
  cy.intercept({
    method: 'GET',
    url: '**/systems/*',
  }).as('getSystemsData');

  for (let i = 0; i < values.checkedSystems.length; i++) {
    cy.findAllByLabelText('Toggle select row')
      .eq(values.checkedSystems[i])
      .click();
  }

  cy.findByRole('button', { name: 'Move to' }).click();

  cy.findByRole('dialog').within(() => {
    cy.findByText('Storage').click();
  });

  cy.findByRole('button', { name: 'Move here' }).click();
  cy.wait('@patchSystems', { timeout: 10000 });
  cy.findByRole('dialog').should('not.exist');

  cy.findByText('Storage').click();
  cy.wait('@getSystemsData', { timeout: 10000 });
  for (let i = 0; i < values.checkedSystems.length; i++) {
    deleteSystem(values.checkedSystemsNames[i], 0);
  }
  cy.go('back');
};

export const moveItemToSystem = (values: {
  checkedItems: number[];
  checkedItemsNames: string[];
}) => {
  cy.intercept({
    method: 'PATCH',
    url: '**/items/*',
  }).as('patchItems');
  cy.intercept({
    method: 'GET',
    url: '**/systems/*',
  }).as('getSystemsData');

  cy.findByText('Storage').click();

  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findAllByLabelText('Toggle select row')
      .eq(values.checkedItems[i])
      .click();
  }

  cy.findByRole('button', { name: 'Move to' }).click();

  cy.findByRole('dialog').within(() => {
    cy.findByRole('button', { name: 'navigate to systems home' }).click();
    cy.findByText('Storage 2').click();
  });

  cy.findByRole('button', { name: 'Move here' }).click();

  cy.findByRole('dialog').should('not.exist');
  cy.wait('@patchItems', { timeout: 10000 });

  cy.findByRole('button', { name: 'navigate to systems home' }).click();
  cy.findByText('Storage 2').click();
  cy.wait('@getSystemsData', { timeout: 10000 });
  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findByText(values.checkedItemsNames[i]).should('exist');
  }
  cy.findByRole('button', { name: 'navigate to systems home' }).click();
};

export const addSystems = () => {
  modifySystem({ name: 'Storage', importance: 'high' });
  modifySystem({
    name: 'optics 1',
    importance: 'medium',
    owner: 'Tim',
    location: 'R100, room 4 bench 5',
    description: 'optics for experiment RE3213',
  });
};

export const editSystems = () => {
  modifySystem({
    index: 1,
    name: 'optics 2',
    importance: 'high',
    owner: 'John',
    location: 'R90, room 4 bench 5',
    description: 'optics for experiment RY434',
  });
};
