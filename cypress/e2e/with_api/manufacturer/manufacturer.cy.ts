import {
  addManufacturer,
  deleteManufacturer,
  editManufacturer,
} from './functions';

describe('Manufacturer', () => {
  beforeEach(() => {
    cy.dropIMSDB();
    cy.visit('/manufacturer');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
  });

  it('CRUD for Manufacturer', () => {
    addManufacturer();
    editManufacturer();
    deleteManufacturer('ThorsLab');
  });
});
