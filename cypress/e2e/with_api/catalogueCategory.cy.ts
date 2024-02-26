const modifyCatalogueCategory = (values: {
  editCatalogueCategoryName?: string;
  name: string;
  newFormFields?: {
    name: string;
    unit?: string;
    type: string;
    mandatory: boolean;
    allowed_values?: { values: any[]; type: string };
  }[];
}) => {
  if (values.editCatalogueCategoryName) {
    cy.findByRole('button', {
      name: `actions ${values.editCatalogueCategoryName} catalogue category button`,
    }).click();

    cy.findByRole('menuitem', {
      name: `edit ${values.editCatalogueCategoryName} catalogue category button`,
    }).click();

    if (values.newFormFields) {
      cy.findByLabelText('Catalogue Categories').click();
      cy.findByLabelText('Catalogue Items').click();
    }
  } else {
    cy.findByRole('button', { name: 'add catalogue category' }).click();
  }

  if (values.name !== undefined) {
    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type(values.name);
  }

  if (values.newFormFields) {
    // Assume want a leaf now
    !values.editCatalogueCategoryName &&
      cy.findByLabelText('Catalogue Items').click();

    // Add any required fields
    for (let i = 0; i < values.newFormFields.length; i++) {
      cy.findByRole('button', {
        name: 'Add catalogue category field entry',
      }).click();
    }

    cy.findAllByLabelText('Property Name *').should(
      'have.length',
      values.newFormFields.length
    );

    for (let i = 0; i < values.newFormFields.length; i++) {
      const field = values.newFormFields[i];

      if (field.name) {
        cy.findAllByLabelText('Property Name *').eq(i).type(field.name);
      }

      if (field.type) {
        cy.findAllByLabelText('Select Type *').eq(i).click();
        cy.findByRole('option', {
          name: field.type.charAt(0).toUpperCase() + field.type.slice(1),
        }).click();
      }

      if (field.unit) {
        cy.findAllByLabelText('Select Unit').eq(i).click();
        cy.findByRole('option', { name: field.unit }).click();
      }

      cy.findAllByLabelText('Select is mandatory?').eq(i).click();
      cy.findByRole('option', {
        name: field.mandatory ? 'Yes' : 'No',
      }).click();

      if (field.allowed_values) {
        cy.findAllByLabelText('Select Allowed values *').eq(i).click();
        cy.findByRole('option', {
          name: field.allowed_values.type === 'list' ? 'List' : 'Any',
        }).click();

        if (field.allowed_values.type === 'list') {
          for (let j = 0; j < field.allowed_values.values.length; j++) {
            cy.findByRole('button', {
              name: `Add list item ${i}`,
            }).click();

            cy.findAllByLabelText(`List Item ${j}`).should(
              'have.length',
              i + 1
            );

            cy.get(`[aria-label="List Item ${j}"]:eq(${i})`).type(
              field.allowed_values.values[j]
            );
          }
        }
      }
    }
  }

  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByText(values.name).should('exist');

  if (values.newFormFields) {
    cy.findByText(values.name).click();
    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByText('Hide all').click();

    cy.findByText(
      `${values.newFormFields[0].name}${values.newFormFields[0].unit ? `(${values.newFormFields[0].unit})` : ''}`
    ).click();
    cy.findAllByText(
      `${values.newFormFields[0].name}${values.newFormFields[0].unit ? ` (${values.newFormFields[0].unit})` : ''}`
    ).should('have.length', 2);
    cy.go('back');
  }
};

const deleteCatalogueCategory = (name: string) => {
  cy.intercept({
    method: 'DELETE',
    url: '**/catalogue-categories/*',
  }).as('getCatalogueCategoryData');
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `delete ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
};

const saveAsCatalogueCategory = (name: string) => {
  cy.intercept({
    method: 'POST',
    url: '**/catalogue-categories',
  }).as('getCatalogueCategoryData');
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `save as ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Save' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByText(`${name}_copy_1`).should('exist');
};

const copyToCatalogueCategory = (values: { checkedCategories: string[] }) => {
  cy.intercept({
    method: 'POST',
    url: '**/catalogue-categories',
  }).as('getCatalogueCategoryData');

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Copy to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Copy here' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
    deleteCatalogueCategory(`${values.checkedCategories[i]}`);
  }
};

const moveToCatalogueCategory = (values: { checkedCategories: string[] }) => {
  cy.intercept({
    method: 'PATCH',
    url: '**/catalogue-categories/*',
  }).as('getCatalogueCategoryData');

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Move to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Move here' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
  }
};

const addCatalogueCategories = () => {
  modifyCatalogueCategory({
    name: 'Lensess',
  });

  cy.findByText('Lensess').click();

  modifyCatalogueCategory({
    name: 'Spherical Lenses2',
    newFormFields: [
      {
        name: 'Substrate',
        type: 'text',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: ['N-BK7', 'UV Fused Siilica', 'Fused Silica'],
        },
      },
      {
        name: 'Diameter2',
        type: 'number',
        unit: 'mm',
        mandatory: false,
      },
      {
        name: 'Wavelength Range',
        type: 'text',
        unit: 'nm',
        mandatory: true,
      },
      {
        name: 'Broken3',
        type: 'boolean',
        mandatory: false,
      },
    ],
  });
};

const editCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  modifyCatalogueCategory({
    editCatalogueCategoryName: 'Lensess',
    name: 'Lenses',
  });

  cy.findByText('Lenses').click();

  modifyCatalogueCategory({
    editCatalogueCategoryName: 'Spherical Lenses2',
    name: 'Spherical Lenses',
    newFormFields: [
      {
        name: 'Substrate',
        type: 'text',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: ['N-BK7', 'UV Fused Silica', 'Fused Silica'],
        },
      },
      {
        name: 'Diameter',
        type: 'number',
        unit: 'mm',
        mandatory: false,
      },
      {
        name: 'Wavelength Range',
        type: 'text',
        unit: 'nm',
        mandatory: true,
      },
      {
        name: 'Broken',
        type: 'boolean',
        mandatory: false,
      },
    ],
  });
};

const saveAsCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  saveAsCatalogueCategory('Lenses');
  cy.findByText('Lenses').click();
  saveAsCatalogueCategory('Spherical Lenses');
};

const copyToCatalogueCategories = () => {
  copyToCatalogueCategory({
    checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
  });
};

const moveToCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByText('Lenses').click();
  moveToCatalogueCategory({
    checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
  });
};

const deleteCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  deleteCatalogueCategory('Spherical Lenses');
  deleteCatalogueCategory('Spherical Lenses_copy_1');
  deleteCatalogueCategory('Lenses');
  deleteCatalogueCategory('Lenses_copy_1');
};

describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.dropIMSDB();
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
  });

  it('CRUD for catalogue categories', () => {
    addCatalogueCategories();
    editCatalogueCategories();
    saveAsCatalogueCategories();
    copyToCatalogueCategories();
    moveToCatalogueCategories();
    deleteCatalogueCategories();
  });
});
