import { addUnits, deleteUnits } from './functions';

describe('Units', () => {
  beforeEach(() => {
    cy.dropIMSCollections(['units']);
    cy.visit('/admin-ims/units');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['units']);
  });

  it('CRD for units', () => {
    addUnits([
      'megapixels',
      'fps',
      'Joules',
      'micrometers',
      'millimeters',
      'kilograms',
      'liters per second',
      'millibar',
      'volts',
    ]);
    deleteUnits([
      'megapixels',
      'fps',
      'Joules',
      'micrometers',
      'millimeters',
      'kilograms',
      'liters per second',
      'millibar',
      'volts',
    ]);
  });
});
