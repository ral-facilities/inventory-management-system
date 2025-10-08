import {
  addCatalogueCategories,
  duplicateCatalogueCategory,
} from '../catalogueCategories/functions';
import { addManufacturer } from '../manufacturers/functions';
import { addUnits } from '../units/functions';
import {
  addCatalogueItem,
  addFile,
  copyToCatalogueItems,
  deleteFile,
  downloadFile,
  duplicateCatalogueItem,
  editCatalogueItem,
  editFile,
  moveToCatalogueItems,
  obsoleteCatalogueItem,
  removePrimaryImage,
  setPrimaryImage,
  viewPrimaryImage,
} from './functions';

describe('catalogue items', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
    });
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'units',
      'attachments',
      'images',
    ]);
    // Prepare relevant data for catalogue items
    cy.visit('/manufacturers');
    addManufacturer(true);
    cy.visit('/settings/units');
    addUnits(['mm', 'nm'], true);
    cy.visit('/catalogue');
    addCatalogueCategories(true);
    duplicateCatalogueCategory('Spherical Lenses', 0);
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections([
      'catalogue_categories',
      'catalogue_items',
      'manufacturers',
      'units',
      'attachments',
      'images',
    ]);
  });

  it('CRUD for catalogue items, images and attachments', () => {
    addCatalogueItem();
    cy.findByText('Add Catalogue Item');
    cy.findByRole('progressbar').should('not.exist');
    cy.findAllByText('Plano-Convex Lens').last().click();
    cy.findAllByText('Plano-Convex Lens').should('have.length', 2);
    cy.findByRole('progressbar').should('not.exist');
    addFile(
      {
        files: [
          'cypress/fixtures/documents/test1.txt',
          'cypress/fixtures/documents/test2.txt',
        ],
      },
      'attachment',
      true
    );
    editFile(
      {
        originalFileName: 'test1.txt',
        newFileName: 'test file',
        title: 'test title',
        description: 'test description',
      },
      'attachment',
      true
    );
    downloadFile('test file.txt', 'attachment');
    deleteFile(['test2.txt', 'test file.txt'], 'attachment');
    addFile(
      {
        files: [
          'cypress/fixtures/images/logo1.png',
          'cypress/fixtures/images/logo2.png',
        ],
      },
      'image',
      true
    );
    setPrimaryImage(1, true);
    viewPrimaryImage();
    removePrimaryImage();
    editFile(
      {
        originalFileName: 'logo1.png',
        newFileName: 'badge',
        title: 'test title',
        description: 'test description',
      },
      'image',
      true
    );
    downloadFile('logo2.png', 'image');
    deleteFile(['badge.png', 'logo2.png'], 'image');
    cy.findByText('Spherical Lenses').click({ force: true });
    editCatalogueItem();
    duplicateCatalogueItem('Plano-Convex Lens 2');
    duplicateCatalogueItem('Plano-Convex Lens 2');
    obsoleteCatalogueItem({
      name: 'Plano-Convex Lens 2',
      obsolete_replacement: 'Plano-Convex Lens 2_copy_2',
      obsolete_reason: 'no longer manufactured',
      isObsolete: true,
    });
    copyToCatalogueItems({ checkedItems: ['Plano-Convex Lens 2_copy_1'] });
    moveToCatalogueItems({
      checkedItems: ['Plano-Convex Lens 2_copy_1', 'Plano-Convex Lens 2'],
    });
  });
});
