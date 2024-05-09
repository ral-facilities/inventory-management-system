import { addUnits } from '../units/functions';
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
    cy.dropIMSCollections(['catalogue_categories', 'units']);
    cy.visit('/catalogue');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['catalogue_categories']);
  });

  it('CRUD for catalogue categories', () => {
    //Prepare data for catalogue categories
    cy.visit('/adminPage/units');
    addUnits(
      [
        'megapixels',
        'fps',
        'Joules',
        'micrometers',
        'millimeters',
        'kilograms',
        'liters per second',
        'millibar',
        'volts',
      ],
      true
    );
    cy.visit('/catalogue');
    addCatalogueCategories();
    editCatalogueCategories();
    saveAsCatalogueCategories();
    copyToCatalogueCategories();
    moveToCatalogueCategories();
    deleteCatalogueCategories();
  });
});
