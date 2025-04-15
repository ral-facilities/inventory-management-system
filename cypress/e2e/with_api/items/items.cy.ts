import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems } from '../systems/functions';
import { addUnits } from '../units/functions';
import { addUsageStatuses } from '../usageStatuses/functions';
import {
  addAttachment,
  addItem,
  addProperty,
  deleteAttachment,
  deleteItem,
  duplicateItem,
  editAttachment,
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
    ]);
  });

  it('CRUD for items', () => {
    addItem();
    editItem();
    duplicateItem('MX4332424', 0);
    addProperty();
    editProperty();
    deleteItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
  });

  it('CRUD for attachments', () => {
    addItem();
    cy.findByLabelText('MX432424').click();
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
    deleteAttachment(['test2.txt', 'test file.txt']);
  });
});
