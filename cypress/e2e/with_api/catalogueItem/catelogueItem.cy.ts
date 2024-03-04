import {
  addCatalogueCategories,
  saveAsCatalogueCategory,
} from '../catalogueCategory/functions';
import { addManufacturer } from '../manufacturer/functions';
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
    cy.dropIMSDB();
    // Prepare relevant data for catalogue items
    cy.visit('/manufacturer');
    addManufacturer();
    cy.visit('/catalogue');
    addCatalogueCategories();
    saveAsCatalogueCategory('Spherical Lenses');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
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