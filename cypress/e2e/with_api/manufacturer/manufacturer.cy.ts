import {
  addManufacturer,
  deleteManufacturer,
  editManufacturer,
} from './functions';

describe('Manufacturer', () => {
  beforeEach(() => {
    cy.dropIMSCollections(['manufacturers']);
    cy.visit('/manufacturers');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['manufacturers']);
  });

  it('CRUD for Manufacturer', () => {
    addManufacturer();
    editManufacturer();
    deleteManufacturer('ThorsLab');
  });
});
