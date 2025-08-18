import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems } from '../systems/functions';
import { addUnits } from '../units/functions';
import {
  addItem,
  addProperty,
  deleteItem,
  duplicateItem,
  editItem,
  editProperty,
  modifyItem,
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
    ]);
    // Prepare relevant data for items
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
    ]);
  });

  it('CRUD for items', () => {
    addItem();
    editItem();
    duplicateItem('MX4332424', 0);
    addProperty();
    editProperty();
    modifyItem({
      edit: 0,
      system: 'Storage',
    });
    modifyItem({
      edit: 0,
      system: 'Storage',
    });
    deleteItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
  });
});
