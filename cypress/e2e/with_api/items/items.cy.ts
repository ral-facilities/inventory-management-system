import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems } from '../systems/functions';
import { addUnits } from '../units/functions';
import { addUsageStatuses } from '../usageStatuses/functions';
import {
  addFile,
  addItem,
  addProperty,
  deleteFile,
  deleteItem,
  downloadFile,
  duplicateItem,
  editFile,
  editItem,
  editProperty,
} from './functions';

describe('items', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'items',
      'systems',
      'units',
      'usage_statuses',
      'attachments',
      'images',
    ]);
    // Prepare relevant data for items
    cy.visit('/admin-ims/usage-statuses');
    addUsageStatuses(['New', 'Used']);
    cy.visit('/manufacturers');
    addManufacturer(true);
    cy.visit('/admin-ims/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/systems');
    addSystems(true);
    cy.visit('/catalogue');
    addCatalogueCategories(true);
    addCatalogueItem(true);
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'items',
      'systems',
      'units',
      'usage_statuses',
      'attachments',
      'images',
    ]);
  });

  it('CRUD for items and attachments', () => {
    addItem();
    editItem();
    duplicateItem('MX4332424', 0);
    addProperty();
    editProperty();
    cy.findByText('Plano-Convex Lens').click();
    cy.findByText('Items').click();
    cy.findAllByText('MX4332424').first().click();
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
    cy.findByText('Items').click();
    deleteItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
  });
});
