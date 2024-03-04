import { addCatalogueCategories } from '../catalogueCategory/functions';
import { addCatalogueItem } from '../catalogueItem/functions';
import { addItem } from '../items/functions';
import { addManufacturer } from '../manufacturer/functions';
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
    cy.dropIMSDB();
    // Prepare relevant data for systems
    cy.visit('/manufacturer');
    addManufacturer();
    cy.visit('/systems');
    addSystems();
    cy.visit('/catalogue');
    addCatalogueCategories();
    addCatalogueItem();
    addItem();
    cy.visit('/systems');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
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