# Inventory Management System

The Inventory Management System is a [ReactJs](https://reactjs.org/)-based web application. It is a [micro-frontend](https://micro-frontends.org/) that can be integrated with the parent web application [SciGateway](https://github.com/ral-facilities/scigateway).

The Inventory Management System uses Yarn workspaces to manage it's monorepo structure, so please use [Yarn](https://yarnpkg.com/lang/en/docs/install/) instead of npm for package management.

The SciGateway application offers features such as authentication and authorisation functionality, notifications, cookies management.

For more details about the project's architecture, development guidelines and installation procedures, visit the [SciGateway documentation](https://github.com/ral-facilities/scigateway/wiki).

## Getting Started with Vite

This project uses [Vite](https://vitejs.dev/).

### Available Scripts

In the project directory, you can run:

#
#### Prerequisites

- Node.js (https://nodejs.org/en/) - (LTS version at the time of writing is 16.17.0)
- NPM (comes with the node.js installation)
- An IDE for developing with JavaScript (VS Code is a good cross-platform suggestion)
- [Yarn 3.5.0](https://yarnpkg.com/lang/en/docs/install/)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone git@github.com:ral-facilities/inventory-management-system.git
   cd inventory-management-system
   ```
2. Run install all the dependancies
   ```bash
   yarn install
   ```
3. Create a inventory-management-system-settings.json file
   ```bash
   cp public/inventory-management-system-settings.example.json public/inventory-management-system-settings.json
   ```
4. Start the website
   ```bash
   yarn dev
   ```

### End-to-End Testing (Locally)

This guide outlines the steps to perform end-to-end testing for the Inventory Management System (IMS) locally. You have two options: testing with the actual API and testing with mocked data.

#### Testing with API

1. **Set up IMS-API with an Empty Database**: Begin by setting up the IMS-API using the instructions provided in the [IMS-API repository](https://github.com/ral-facilities/inventory-management-system-api). Ensure that the database is empty to maintain test consistency.

2. **Configure IMS-API URL**: Add the IMS-API URL to the `inventory-management-system-settings.json` file. This file likely contains various settings for your IMS application.

3. **Host IMS-API and IMS-Frontend Together**: To prevent CORS errors during testing, ensure both IMS-API and IMS-Frontend (production build) are hosted on the same machine.

4. **Run Testing Scripts**:
   - Execute `yarn e2e:api` or `yarn e2e:interactive:api` depending on your preferred testing mode. These scripts are configured to perform end-to-end testing with the API.

#### Testing without API (Using MSW Mock Data)

1. **Run Testing Scripts**:
   - Execute `yarn e2e` or `yarn e2e:interactive` to perform end-to-end testing without relying on the actual API. This setup utilizes MSW (Mock Service Worker) to simulate API responses.

By following these instructions, you can effectively conduct end-to-end testing for the Inventory Management System. Choose the method that best suits your testing requirements and development environment.

**Note:** On the CI environment, the IMS-API is accessed via `127.0.0.1` due to issues with `localhost`.
