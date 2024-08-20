import { addUnits } from '../units/functions';
import {
  addCatalogueCategories,
  copyToCatalogueCategories,
  deleteCatalogueCategories,
  editCatalogueCategories,
  moveToCatalogueCategories,
  duplicateCatalogueCategories,
} from './functions';

describe('Catalogue Category', () => {
  beforeEach(() => {
    cy.dropIMSCollections(['catalogue_categories', 'units']);
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['catalogue_categories', 'units']);
  });

  it('CRUD for catalogue categories', () => {
    //Prepare data for catalogue categories
    cy.visit('/admin-ims/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/catalogue');
    addCatalogueCategories();
    editCatalogueCategories();
    duplicateCatalogueCategories();
    copyToCatalogueCategories();
    moveToCatalogueCategories();
    deleteCatalogueCategories();
  });
});
