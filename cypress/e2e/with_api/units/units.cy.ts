import { addUnits, deleteUnits } from './functions';

describe('Units', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'MicroFrontendToken',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOlsiYWRtaW4iXSwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.gWXkZNeLCgNA04KhkGcAUB8WwrrVr8HMKp8yd9BUEBfDuiN1yekPxwKJ7LZDndHqYL4z9WWfVsDE5vYyWfjDJjhoymuP-VYTAI2GxbmazRmknsl9L-vRo31oPX3v2Cs5V2tcBv7dM49gzY7w-dS0b9QsOrn4Y1z9zLj4kLpVtNm0EhtbwThxMk8qVNNtEu76TAnYrdWAoz7_IedBh9NRf48EKJFfoh4CSbfXhHsGRZjvAKnjU-khaibWP3aWuMzN1nwQJ8WasgvhPaxMxd1qzKTbfpMMjg2eo3hDcQogU545P8zO4PcfzIid1g9hF1vMgRsAtQNK385oqBjYfOOWZw'
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
