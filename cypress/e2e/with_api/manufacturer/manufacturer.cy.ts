import {
  addManufacturer,
  deleteManufacturer,
  editManufacturer,
} from './functions';

describe('Manufacturer', () => {
  beforeEach(() => {
    cy.dropIMSDB();
    cy.visit('/manufacturers');
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
