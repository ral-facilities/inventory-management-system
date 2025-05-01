import {
  addCatalogueCategories,
  duplicateCatalogueCategory,
} from '../catalogueCategories/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addUnits } from '../units/functions';
import {
  addCatalogueItem,
  addFile,
  copyToCatalogueItems,
  deleteFile,
  downloadFile,
  duplicateCatalogueItem,
  editCatalogueItem,
  editFile,
  moveToCatalogueItems,
  obsoleteCatalogueItem,
  setPrimaryImage,
  viewPrimaryImage,
} from './functions';

describe('catalogue items', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'units',
      'attachments',
      'images',
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
      'attachments',
      'images',
    ]);
  });

  it('CRUD for catalogue items, images and attachments', () => {
    addCatalogueItem();
    cy.findAllByText('Plano-Convex Lens').first().click();
    addFile(
      {
        files: [
          'cypress/fixtures/documents/test1.txt',
          'cypress/fixtures/documents/test2.txt',
        ],
      },
      'attachment',
      true
    );
    editFile(
      {
        originalFileName: 'test1.txt',
        newFileName: 'test file',
        title: 'test title',
        description: 'test description',
      },
      'attachment',
      true
    );
    downloadFile('test file.txt', 'attachment');
    deleteFile(['test2.txt', 'test file.txt'], 'attachment');
    addFile(
      {
        files: [
          'cypress/fixtures/images/logo1.png',
          'cypress/fixtures/images/logo2.png',
        ],
      },
      'image',
      true
    );
    setPrimaryImage(0, true);
    viewPrimaryImage();
    editFile(
      {
        originalFileName: 'logo1.png',
        newFileName: 'badge',
        title: 'test title',
        description: 'test description',
      },
      'image',
      true
    );
    downloadFile('logo2.png', 'image');
    deleteFile(['badge.png', 'logo2.png'], 'image');
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
