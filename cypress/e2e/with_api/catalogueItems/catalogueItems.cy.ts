import {
  addCatalogueCategories,
  duplicateCatalogueCategory,
} from '../catalogueCategories/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addUnits } from '../units/functions';
import {
  addAttachment,
  addCatalogueItem,
  copyToCatalogueItems,
  deleteAttachment,
  downloadAttachment,
  duplicateCatalogueItem,
  editAttachment,
  editCatalogueItem,
  moveToCatalogueItems,
  obsoleteCatalogueItem,
} from './functions';

describe('catalogue items', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'units',
    ]);
    // Prepare relevant data for catalogue items
    cy.visit('/manufacturers');
    addManufacturer(true);
    cy.visit('/admin-ims/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/catalogue');
    addCatalogueCategories(true);
    duplicateCatalogueCategory('Spherical Lenses', 0);
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'units',
    ]);
  });

  it('CRUD for catalogue items', () => {
    addCatalogueItem();
    cy.findAllByText('Plano-Convex Lens').first().click();
    addAttachment(
      {
        files: [
          'cypress/fixtures/documents/test1.txt',
          'cypress/fixtures/documents/test2.txt',
        ],
      },
      true
    );
    editAttachment(
      {
        originalFileName: 'test1.txt',
        newFileName: 'test file',
        title: 'test title',
        description: 'test description',
      },
      true
    );
    downloadAttachment('test file.txt');
    deleteAttachment(['test2.txt', 'test file.txt']);
    cy.findByText('Spherical Lenses').click();
    editCatalogueItem();
    duplicateCatalogueItem('Plano-Convex Lens 2');
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
