import { addUnits, deleteUnits } from './functions';

describe('Units', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
    });
    cy.dropIMSCollections(['units']);
    cy.visit('/settings/units');
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
