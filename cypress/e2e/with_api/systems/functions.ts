export const addSystem = (values: {
  name: string;
  description?: string;
  location?: string;
  owner?: string;
  importance: string;
}) => {
  cy.findByRole('button', { name: 'add system' }).click();
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
};

export const addSystems = () => {
  addSystem({ name: 'Storage', importance: 'high' });
  addSystem({
    name: 'optics 1',
    importance: 'medium',
    owner: 'Tim',
    location: 'R100, room 4 bench 5',
    description: 'optics for experiment RE3213',
  });
};
