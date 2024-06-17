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
import { HttpResponse } from 'msw';

let mockedRequests: Request[] = [];

Cypress.Commands.add('clearMocks', () => {
  mockedRequests = [];
});

Cypress.Commands.add('editEndpointResponse', ({ url, data, statusCode }) => {
  cy.window().its('msw').should('not.equal', undefined);
  cy.window().then((window) => {
    const { worker, http } = window.msw;

    worker.use(
      http.get(url, () => {
        return HttpResponse.json(data, { status: statusCode });
      })
    );
  });
});

Cypress.Commands.add('startSnoopingBrowserMockedRequest', () => {
  cy.window().then((window) => {
    const worker = window?.msw?.worker;

    // Use start here instead of match as needs to be done before the request is read to
    // avoid errors as an MDN Request's contents can only be read once. We then clone it
    // here to ensure the MSW handlers can call .json() on it, and also any Cypress tests
    // which would otherwise have failed for the same reason as json() can only be called
    // once on the original request.
    worker.events.on('request:start', ({ request }: { request: Request }) => {
      mockedRequests.push(request.clone());
    });
  });
});

Cypress.Commands.add('dropIMSCollections', (collections: string[]) => {
  collections.forEach((collection) =>
    cy.exec(
      `docker exec -i $(docker ps | grep mongo | awk '{ print $1 }') mongosh ims --username "root" --password "example" --authenticationDatabase=admin --eval "db.${collection}.drop()"`
    )
  );
});

/**
 * URL is a pattern matching URL that uses the same behavior as handlers URL matching
 * e.g. '* /events/groups/:groupId' without the space
 */
Cypress.Commands.add('findBrowserMockedRequests', ({ method, url }) => {
  return cy.window().then((window) => {
    const msw = window?.msw;
    if (msw) {
      const { matchRequestUrl } = msw;

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
            const matchesUrl = matchRequestUrl(new URL(req.url), url).matches;
            return matchesMethod && matchesUrl;
          })
        );
      });
    }
  });
});

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    msw: { http: any; worker: any; matchRequestUrl: any };
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
      editEndpointResponse({
        url,
        data,
        statusCode,
      }: {
        url: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
        statusCode: number;
      }): Chainable<unknown>;
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
      }: {
        method: string;
        url: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }): Chainable<any>;
      /**
       * Deletes the IMS collections
       *
       * @example cy.dropIMSCollections(['catalogue_categories']);
       */
      dropIMSCollections(collections: string[]): Chainable<unknown>;
    }
  }
}
