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
