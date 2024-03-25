import {
  addCatalogueCategories,
  copyToCatalogueCategories,
  deleteCatalogueCategories,
  editCatalogueCategories,
  moveToCatalogueCategories,
  saveAsCatalogueCategories,
} from './functions';

describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.dropIMSCollections(['catalogue_categories']);
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['catalogue_categories']);
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
