/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import '@testing-library/cypress/add-commands';
import { MockedRequest } from 'msw';

let mockedRequests: MockedRequest[] = [];

Cypress.Commands.add('clearMocks', () => {
  mockedRequests = [];
});

Cypress.Commands.add('editEndpointResponse', ({ url, data, statusCode }) => {
  cy.window().then((window) => {
    const { worker, rest } = window.msw;

    worker.use(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.status(statusCode), ctx.json(data));
      })
    );
  });
});

Cypress.Commands.add('startSnoopingBrowserMockedRequest', () => {
  cy.window().then((window) => {
    const worker = window?.msw?.worker;

    worker.events.on('request:match', (req) => {
      mockedRequests.push(req);
    });
  });
});

Cypress.Commands.add('modifyCatalogueCategory', (values) => {
  if (values.editCatalogueCategoryName) {
    cy.findByRole('button', {
      name: `actions ${values.editCatalogueCategoryName} catalogue category button`,
    }).click();

    cy.findByRole('menuitem', {
      name: `edit ${values.editCatalogueCategoryName} catalogue category button`,
    }).click();

    if (values.newFormFields) {
      cy.findByLabelText('Catalogue Categories').click();
      cy.findByLabelText('Catalogue Items').click();
    }
  } else {
    cy.findByRole('button', { name: 'add catalogue category' }).click();
  }

  if (values.name !== undefined) {
    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Name *').type(values.name);
  }

  if (values.newFormFields) {
    // Assume want a leaf now
    !values.editCatalogueCategoryName &&
      cy.findByLabelText('Catalogue Items').click();

    // Add any required fields
    for (let i = 0; i < values.newFormFields.length; i++) {
      cy.findByRole('button', {
        name: 'Add catalogue category field entry',
      }).click();
    }

    cy.findAllByLabelText('Property Name *').should(
      'have.length',
      values.newFormFields.length
    );

    for (let i = 0; i < values.newFormFields.length; i++) {
      const field = values.newFormFields[i];

      if (field.name) {
        cy.findAllByLabelText('Property Name *').eq(i).type(field.name);
      }

      if (field.type) {
        cy.findAllByLabelText('Select Type *').eq(i).click();
        cy.findByRole('option', {
          name: field.type.charAt(0).toUpperCase() + field.type.slice(1),
        }).click();
      }

      if (field.unit) {
        cy.findAllByLabelText('Select Unit').eq(i).click();
        cy.findByRole('option', { name: field.unit }).click();
      }

      cy.findAllByLabelText('Select is mandatory?').eq(i).click();
      cy.findByRole('option', {
        name: field.mandatory ? 'Yes' : 'No',
      }).click();

      if (field.allowed_values) {
        cy.findAllByLabelText('Select Allowed values *').eq(i).click();
        cy.findByRole('option', {
          name: field.allowed_values.type === 'list' ? 'List' : 'Any',
        }).click();

        if (field.allowed_values.type === 'list') {
          for (let j = 0; j < field.allowed_values.values.length; j++) {
            cy.findByRole('button', {
              name: `Add list item ${i}`,
            }).click();

            cy.findAllByLabelText(`List Item ${j}`).should(
              'have.length',
              i + 1
            );

            cy.get(`[aria-label="List Item ${j}"]:eq(${i})`).type(
              field.allowed_values.values[j]
            );
          }
        }
      }
    }
  }

  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByText(values.name).should('exist');

  if (values.newFormFields) {
    cy.findByText(values.name).click();
    cy.findByRole('button', { name: 'Show/Hide columns' }).click();
    cy.findByText('Hide all').click();

    cy.findByText(
      `${values.newFormFields[0].name}${values.newFormFields[0].unit ? `(${values.newFormFields[0].unit})` : ''}`
    ).click();
    cy.findAllByText(
      `${values.newFormFields[0].name}${values.newFormFields[0].unit ? ` (${values.newFormFields[0].unit})` : ''}`
    ).should('have.length', 2);
    cy.go('back');
  }
});

Cypress.Commands.add('deleteCatalogueCategory', (name) => {
  cy.intercept({
    method: 'DELETE',
    url: '**/catalogue-categories/*',
  }).as('getCatalogueCategoryData');
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `delete ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
});

Cypress.Commands.add('saveAsCatalogueCategory', (name) => {
  cy.intercept({
    method: 'POST',
    url: '**/catalogue-categories',
  }).as('getCatalogueCategoryData');
  cy.findByRole('button', {
    name: `actions ${name} catalogue category button`,
  }).click();

  cy.findByRole('menuitem', {
    name: `save as ${name} catalogue category button`,
  }).click();

  cy.findByRole('button', { name: 'Save' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByText(`${name}_copy_1`).should('exist');
});

Cypress.Commands.add('copyToCatalogueCategory', (values) => {
  cy.intercept({
    method: 'POST',
    url: '**/catalogue-categories',
  }).as('getCatalogueCategoryData');

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Copy to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Copy here' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
    cy.deleteCatalogueCategory(`${values.checkedCategories[i]}`);
  }
});

Cypress.Commands.add('moveToCatalogueCategory', (values) => {
  cy.intercept({
    method: 'PATCH',
    url: '**/catalogue-categories/*',
  }).as('getCatalogueCategoryData');

  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByLabelText(`${values.checkedCategories[i]} checkbox`).click();
  }
  cy.findByRole('button', { name: 'Move to' }).click();
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  cy.findByRole('button', { name: 'Move here' }).click();
  cy.wait('@getCatalogueCategoryData', { timeout: 10000 });
  cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
  for (let i = 0; i < values.checkedCategories.length; i++) {
    cy.findByText(`${values.checkedCategories[i]}`).should('exist');
  }
});

Cypress.Commands.add('deleteCatalogueCategoryDB', () => {
  cy.exec(
    `docker exec -i $(docker ps | grep mongo | awk '{ print $1 }') mongosh ims --username "root" --password "example" --authenticationDatabase=admin --eval "db.catalogue_categories.drop()"`
  );
});

/**
 * URL is a pattern matching URL that uses the same behavior as handlers URL matching
 * e.g. '* /events/groups/:groupId' without the space
 */
Cypress.Commands.add('findBrowserMockedRequests', ({ method, url }) => {
  return cy.window().then((window) => {
    const { matchRequestUrl } = window?.msw;

    return new Cypress.Promise((resolve, reject) => {
      if (
        !method ||
        !url ||
        typeof method !== 'string' ||
        typeof url !== 'string'
      ) {
        return reject(
          `Invalid parameters passed. Method: ${method} Url: ${url}`
        );
      }
      resolve(
        mockedRequests.filter((req) => {
          const matchesMethod =
            req.method && req.method.toLowerCase() === method.toLowerCase();
          const matchesUrl = matchRequestUrl(req.url, url).matches;
          return matchesMethod && matchesUrl;
        })
      );
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Clear all mocks
       * @example cy.clearMocks()
       */
      clearMocks(): Chainable<JQuery<HTMLElement>>;
      /**
       * Use before findBrowserMockedRequests for checking specific requests were sent
       * @example cy.startSnoopingBrowserMockedRequest()
       */
      startSnoopingBrowserMockedRequest(): Chainable<JQuery<HTMLElement>>;
      /**
       * Edits the response of the endpoint request 
       * 
       * @example  cy.editEndpointResponse({
                    url: '/v1/catalogue-categories',
                    data: [],
                    statusCode: 200,
                   });
       */
      editEndpointResponse({ url, data, statusCode }: any): Chainable<unknown>;
      /**
       * Returns a request that was recorded after 'startSnoopingBrowserMockedRequest' was called
       * 
       * URL is a pattern matching URL that uses the same behavior as handlers URL matching
       * e.g. '* /events/groups/:groupId' without the space
       * @example cy.findBrowserMockedRequests({
                    method: 'POST',
                    url: '/v1/catalogue-categories',
                  }).should(async (postRequests) => {
                    expect(postRequests.length).equal(1);
                    const request = postRequests[0];
                    expect(JSON.stringify(await request.json())).equal(
                      '{"name":"test","is_leaf":false}'
                    );
                  });
       */
      findBrowserMockedRequests({
        method,
        url,
      }: any): Chainable<MockedRequest[]>;

      modifyCatalogueCategory(values: any): Chainable<unknown>;
      /**
       * Adds / Edits a catalogue category 
       * 
       * @example cy.addCatalogueCategory({
                  name: 'Beam Characterization',
                  newFormFields: [
                    {
                      name: 'Pumping Speed',
                      type: 'number',
                      unit: 'Hz',
                      mandatory: true,
                      allowed_values: { type: 'list', values: [300, 400, 500] },
                    },
                    {
                      name: 'Resolution',
                      type: 'number',
                      unit: 'W',
                      mandatory: true,
                    },
                  ],
                });
      */
      deleteCatalogueCategory(name: string): Chainable<unknown>;
      /**
       * Deletes a catalogue category
       *
       * @example cy.deleteCatalogueCategory('Lenses');
       */
      deleteCatalogueCategoryDB(): Chainable<unknown>;
      /**
       * Deletes the catalogue category database from mongodb
       *
       * @example cy.deleteCatalogueCategory('Lenses');
       */
      saveAsCatalogueCategory(name: string): Chainable<unknown>;
      /**
       * Saves as a catalogue category
       *
       * @example cy.saveAsCatalogueCategory('Lenses');
       */
      copyToCatalogueCategory(values: any): Chainable<unknown>;
      /**
       * Copy to for catalogue category. Copies to root
       *
       * @example cy.copyToCatalogueCategory({
                  checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
                  });
       */
      moveToCatalogueCategory(values: any): Chainable<unknown>;
      /**
       * Move to for catalogue category. Moves to root
       *
       * @example cy.moveToCatalogueCategory({
                  checkedCategories: ['Spherical Lenses', 'Spherical Lenses_copy_1'],
                  });
       */
    }
  }
}
