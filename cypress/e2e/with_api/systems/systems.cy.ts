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
  navigateToItemsTableViaSpares,
} from './functions';

describe('systems', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
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
    navigateToItemsTableViaSpares();
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
