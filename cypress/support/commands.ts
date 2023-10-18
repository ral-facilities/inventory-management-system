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

let mockedRequests = [];

Cypress.Commands.add('clearMocks', () => {
  mockedRequests = [];
});

Cypress.Commands.add('startSnoopingBrowserMockedRequest', () => {
  cy.window().then((window) => {
    const worker = window?.msw?.worker;

    worker.events.on('request:match', (req) => {
      mockedRequests.push(req);
    });
  });
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
      clearMocks(): Chainable<JQuery<HTMLElement>>
      /**
       * Use before findBrowserMockedRequests for checking specific requests were sent
       * @example cy.startSnoopingBrowserMockedRequest()
       */
      startSnoopingBrowserMockedRequest(): Chainable<JQuery<HTMLElement>>
      /**
       * Returns a request that was recorded after 'startSnoopingBrowserMockedRequest' was called
       * 
       * URL is a pattern matching URL that uses the same behavior as handlers URL matching
       * e.g. '* /events/groups/:groupId' without the space
       * @example cy.findBrowserMockedRequests({
                    method: 'POST',
                    url: '/v1/catalogue-categories',
                  }).should((patchRequests) => {
                    expect(patchRequests.length).equal(1);
                    const request = patchRequests[0];
                    expect(JSON.stringify(request.body)).equal(
                      '{"name":"test","is_leaf":false}'
                    );
                  });
       */
      findBrowserMockedRequests({method, url}: any): Chainable<unknown>
    }
  }
}
