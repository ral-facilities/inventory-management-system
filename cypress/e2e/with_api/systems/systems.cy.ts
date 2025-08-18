import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addItem } from '../items/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addUnits } from '../units/functions';
import {
  addSystems,
  copyToSystems,
  deleteSystem,
  duplicateSystem,
  editSystems,
  modifySystem,
  moveItemToSystem,
  moveToSystems,
} from './functions';

describe('systems', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'items',
      'systems',
      'units',
    ]);
    // Prepare relevant data for systems
    cy.visit('/manufacturers');
    addManufacturer(true);
    cy.visit('/admin-ims/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/systems');
    addSystems();
    cy.visit('/catalogue');
    addCatalogueCategories(true);
    addCatalogueItem(true);
    addItem(true);
    cy.visit('/systems');
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

  it('CRUD for systems', () => {
    // add systems is in the before each as it is need for creating items
    editSystems();
    duplicateSystem('optics 2', 1);
    modifySystem({
      name: 'Storage 2',
      importance: 'high',
      type: 'Operational',
    });
    moveItemToSystem({
      checkedItems: [1],
      checkedItemsNames: ['Plano-Convex Lens'],
    });
    copyToSystems({
      checkedSystems: [2, 4],
      checkedSystemsNames: ['optics 2', 'optics 2_copy_1'],
    });
    moveToSystems({
      checkedSystems: [2, 4],
      checkedSystemsNames: ['optics 2', 'optics 2_copy_1'],
    });
    deleteSystem('Storage', 0);
  });
});
