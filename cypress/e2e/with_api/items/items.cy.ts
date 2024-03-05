import { addCatalogueCategories } from '../catalogueCategory/functions';
import { addCatalogueItem } from '../catalogueItem/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems } from '../systems/functions';
import { addItem, deleteItem, editItem, saveAsItem } from './functions';

describe('items', () => {
  beforeEach(() => {
    cy.dropIMSDB();
    // Prepare relevant data for items
    cy.visit('/manufacturers');
    addManufacturer();
    cy.visit('/systems');
    addSystems();
    cy.visit('/catalogue');
    addCatalogueCategories();
    addCatalogueItem();
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
  });

  it('CRUD for items', () => {
    addItem();
    editItem();
    saveAsItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
    deleteItem('MX4332424', 0);
  });
});
