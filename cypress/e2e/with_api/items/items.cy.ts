import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems } from '../systems/functions';
import {
  addItem,
  addProperty,
  deleteItem,
  editItem,
  editProperty,
  saveAsItem,
} from './functions';

describe('items', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'items',
      'systems',
    ]);
    // Prepare relevant data for items
    cy.visit('/manufacturers');
    addManufacturer(true);
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
    ]);
  });

  it('CRUD for items', () => {
    addItem();
    editItem();
    saveAsItem('MX4332424', 0);
    addProperty();
    editProperty();
    deleteItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
  });
});
