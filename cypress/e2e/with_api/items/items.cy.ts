import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addSystems, modifySystem } from '../systems/functions';
import { addUnits } from '../units/functions';
import {
  addItem,
  addProperty,
  deleteItem,
  deleteProperty,
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
    cy.setCurrentUserToAdmin();
    addManufacturer(true);
    cy.visit('/settings/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/systems');
    addSystems(true);
    modifySystem(
      { name: 'Scrapped', importance: 'high', type: 'Scrapped' },
      true
    );
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
    deleteProperty();
    cy.findByText('Total Items: 2').should('exist');
    cy.findByRole('progressbar').should('not.exist');
    cy.findAllByText('MX4332424').should('have.length', 2);
    modifyItem({
      editIndex: 0,
      system: 'Scrapped',
    });
    deleteItem('No serial number', 0);
    cy.findByRole('progressbar').should('not.exist');
    cy.findAllByText('MX4332424').should('have.length', 1);
  });
});
