const modifyCatalogueCategory = (
  values: {
    editCatalogueCategoryName?: string;
    name: string;
    newFormFields?: {
      name: string;
      unit?: string;
      type: string;
      mandatory: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allowed_values?: { values: any[]; type: string };
    }[];
  },
  ignoreChecks?: boolean
) => {
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
    if (!values.editCatalogueCategoryName)
      cy.findByLabelText('Catalogue Items').click();

    for (let i = 0; i < values.newFormFields.length; i++) {
      const field = values.newFormFields[i];

      cy.findByText('Add Property').click();
      cy.findByRole('dialog', { name: 'Add Property' }).should('exist');

      if (field.name) {
        cy.findByLabelText('Property Name *').type(field.name);
      }

      if (field.type) {
        cy.findByLabelText('Select Type *').click();
        cy.findByRole('option', {
          name: field.type.charAt(0).toUpperCase() + field.type.slice(1),
        }).click();
      }

      if (field.unit) {
        cy.findByLabelText('Select Unit').click();
        cy.findByRole('option', { name: field.unit }).click();
      }

      cy.findByLabelText('Select is mandatory?').click();
      cy.findByRole('option', {
        name: field.mandatory ? 'Yes' : 'No',
      }).click();

      if (field.allowed_values) {
        cy.findByLabelText('Select Allowed values *').click();
        cy.findByRole('option', {
          name: field.allowed_values.type === 'list' ? 'List' : 'Any',
        }).click();

        if (field.allowed_values.type === 'list') {
          for (let j = 0; j < field.allowed_values.values.length; j++) {
            cy.findByRole('button', {
              name: `Add list item`,
            }).click();

            cy.findAllByLabelText('List item')
              .eq(j)
              .type(field.allowed_values.values[j]);
          }
        }
      }

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog', { name: 'Add Property' }).should('not.exist');
    }
  }

  cy.findByRole('button', { name: 'Save' }).click();
  if (values.editCatalogueCategoryName)
    cy.findByRole('button', { name: 'Close' }).click();
  if (!ignoreChecks) {
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
      // Two for column visibility changes (hide all and showing name column), one for actually going back
      cy.go('back');
      cy.go('back');
      cy.go('back');
    }
  }
};

const deleteCatalogueCategory = (name: string) => {
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `delete ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Continue' }).click();
};

export const duplicateCatalogueCategory = (name: string) => {
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `duplicate ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByText(`${name}_copy_1`).should('exist');
};

const copyToCatalogueCategory = (values: { checkedCategories: string[] }) => {
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Copy to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Copy here' }).click();
  cy.findByRole('dialog').should('not.exist');

  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
    deleteCatalogueCategory(`${values.checkedCategories[i]}`);
  }
};

const moveToCatalogueCategory = (values: { checkedCategories: string[] }) => {
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Move to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Move here' }).click();
  cy.findByRole('dialog').should('not.exist');

  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
  }
};

export const addCatalogueCategories = (ignoreChecks?: boolean) => {
  modifyCatalogueCategory(
    {
      name: 'Lenses',
    },
    ignoreChecks
  );

  cy.findByText('Lenses').click();

  modifyCatalogueCategory(
    {
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
    },
    ignoreChecks
  );
};

export const editCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  modifyCatalogueCategory({
    editCatalogueCategoryName: 'Lenses',
    name: 'Lenses 2',
  });

  cy.findByText('Lenses 2').click();

  modifyCatalogueCategory({
    editCatalogueCategoryName: 'Spherical Lenses',
    name: 'Spherical Lenses 2',
  });
};

export const duplicateCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  duplicateCatalogueCategory('Lenses 2');
  cy.findByText('Lenses 2').click();
  duplicateCatalogueCategory('Spherical Lenses 2');
};

export const copyToCatalogueCategories = () => {
  copyToCatalogueCategory({
    checkedCategories: ['Spherical Lenses 2', 'Spherical Lenses 2_copy_1'],
  });
};

export const moveToCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByText('Lenses 2').click();
  moveToCatalogueCategory({
    checkedCategories: ['Spherical Lenses 2', 'Spherical Lenses 2_copy_1'],
  });
};

export const deleteCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  deleteCatalogueCategory('Spherical Lenses 2');
  deleteCatalogueCategory('Spherical Lenses 2_copy_1');
  deleteCatalogueCategory('Lenses 2');
  deleteCatalogueCategory('Lenses 2_copy_1');
};
