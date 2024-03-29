import {
  addCatalogueCategories,
  saveAsCatalogueCategory,
} from '../catalogueCategories/functions';
import { addManufacturer } from '../manufacturers/functions';
import {
  addCatalogueItem,
  copyToCatalogueItems,
  editCatalogueItem,
  moveToCatalogueItems,
  obsoleteCatalogueItem,
  saveAsCatalogueItem,
} from './functions';

describe('catalogue items', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
    ]);
    // Prepare relevant data for catalogue items
    cy.visit('/manufacturers');
    addManufacturer(true);
    cy.visit('/catalogue');
    addCatalogueCategories(true);
    saveAsCatalogueCategory('Spherical Lenses');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
    ]);
  });

  it('CRUD for catalogue items', () => {
    addCatalogueItem();
    editCatalogueItem();
    saveAsCatalogueItem('Plano-Convex Lens 2');
    obsoleteCatalogueItem({
      name: 'Plano-Convex Lens 2',
      obsolete_replacement: 'Plano-Convex Lens 2_copy_1',
      obsolete_reason: 'no longer manufactured',
      isObsolete: true,
    });
    copyToCatalogueItems({ checkedItems: ['Plano-Convex Lens 2_copy_1'] });
    moveToCatalogueItems({
      checkedItems: ['Plano-Convex Lens 2_copy_1', 'Plano-Convex Lens 2'],
    });
  });
});
