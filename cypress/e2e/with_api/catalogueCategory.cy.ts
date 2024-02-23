export const addCatalogueCategories = () => {
  cy.modifyCatalogueCategory({
    name: 'Lensess',
  });

  cy.findByText('Lensess').click();

  cy.modifyCatalogueCategory({
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

export const editCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.modifyCatalogueCategory({
    editCatalogueCategoryName: 'Lensess',
    name: 'Lenses',
  });

  cy.findByText('Lenses').click();

  cy.modifyCatalogueCategory({
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
  cy.saveAsCatalogueCategory('Lenses');
  cy.findByText('Lenses').click();
  cy.saveAsCatalogueCategory('Spherical Lenses');
};

const copyToCatalogueCategories = () => {
  cy.copyToCatalogueCategory({
    checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
  });
};

const moveToCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByText('Lenses').click();
  cy.moveToCatalogueCategory({
    checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
  });
};

const deleteCatalogueCategories = () => {
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.deleteCatalogueCategory('Spherical Lenses');
  cy.deleteCatalogueCategory('Spherical Lenses_copy_1');
  cy.deleteCatalogueCategory('Lenses');
  cy.deleteCatalogueCategory('Lenses_copy_1');
};

describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.deleteCatalogueCategoryDB();
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.deleteCatalogueCategoryDB();
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
