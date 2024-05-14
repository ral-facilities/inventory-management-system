import { addCatalogueCategories } from '../catalogueCategories/functions';
import { addCatalogueItem } from '../catalogueItems/functions';
import { addItem } from '../items/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addUsageStatuses } from '../usageStatus/functions';
import {
  addSystems,
  copyToSystems,
  deleteSystem,
  editSystems,
  modifySystem,
  moveItemToSystem,
  moveToSystems,
  saveAsSystem,
} from './functions';

describe('systems', () => {
  beforeEach(() => {
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'items',
      'systems',
      'usage_statuses',
    ]);
    // Prepare relevant data for systems
    cy.visit('adminPage/usage-status');
    addUsageStatuses(['New', 'Used']);
    cy.visit('/manufacturers');
    addManufacturer(true);
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
      'usage_statuses',
    ]);
  });

  it('CRUD for systems', () => {
    // add systems is in the before each as it is need for creating items
    editSystems();
    saveAsSystem('optics 2', 1);
    modifySystem({ name: 'Storage 2', importance: 'high' });
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
