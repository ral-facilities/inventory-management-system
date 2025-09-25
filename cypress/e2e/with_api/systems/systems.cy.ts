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
    cy.window().then((win) => {
      win.localStorage.setItem(
        'MicroFrontendToken',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOlsiYWRtaW4iXSwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.gWXkZNeLCgNA04KhkGcAUB8WwrrVr8HMKp8yd9BUEBfDuiN1yekPxwKJ7LZDndHqYL4z9WWfVsDE5vYyWfjDJjhoymuP-VYTAI2GxbmazRmknsl9L-vRo31oPX3v2Cs5V2tcBv7dM49gzY7w-dS0b9QsOrn4Y1z9zLj4kLpVtNm0EhtbwThxMk8qVNNtEu76TAnYrdWAoz7_IedBh9NRf48EKJFfoh4CSbfXhHsGRZjvAKnjU-khaibWP3aWuMzN1nwQJ8WasgvhPaxMxd1qzKTbfpMMjg2eo3hDcQogU545P8zO4PcfzIid1g9hF1vMgRsAtQNK385oqBjYfOOWZw'
      );
    });
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
    cy.visit('/settings/units');
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
