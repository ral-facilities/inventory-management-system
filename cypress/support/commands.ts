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

Cypress.Commands.add('dropIMSDB', () => {
  cy.exec(
    `docker exec -i $(docker ps | grep mongo | awk '{ print $1 }') mongosh ims --username "root" --password "example" --authenticationDatabase=admin --eval "db.catalogue_categories.drop()"`
  );
  //Todo remove other collections
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

      dropIMSDB(): Chainable<unknown>;
      /**
       * Deletes the IMS databases
       *
       * @example cy.dropIMSDB();
       */
    }
  }
}
