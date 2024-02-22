# Inventory Management System

The Inventory Management System is a [ReactJs](https://reactjs.org/)-based web application. It is a [micro-frontend](https://micro-frontends.org/) that can be integrated with the parent web application [SciGateway](https://github.com/ral-facilities/scigateway).

The Inventory Management System uses Yarn workspaces to manage it's monorepo structure, so please use [Yarn](https://yarnpkg.com/lang/en/docs/install/) instead of npm for package management.

The SciGateway application offers features such as authentication and authorisation functionality, notifications, cookies management.

For more details about the project's architecture, development guidelines and installation procedures, visit the [SciGateway documentation](https://github.com/ral-facilities/scigateway/wiki).

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Code structure

The project is structured as a monorepo. This means that the actual code packages are located under `inventory-management-system`

### Available Scripts

In the project directory, you can run:

### `yarn install`

This will install all the project dependencies. Running `yarn install` at the top
level initialises all the packages, and you will be ready to start development in any of them!

### `yarn start`

Runs the `start` script, which runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Runs unit tests for all packages

### `yarn e2e`

Runs e2e tests for all packages

### `yarn lint:js`

Lints all packages

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## How to run

### Docker Setup

#### Prerequisites

- Docker installed (if you want to run the microservice inside Docker)

1. Ensure that Docker is installed and running on your machine.
2. Clone the repository and navigate to the project directory:
   ```bash
   git clone git@github.com:ral-facilities/inventory-management-system.git
   cd inventory-management-system
   ```
3. Create a inventory-management-system-settings.json file
   ```bash
   cp public/inventory-management-system-settings.example.json public/inventory-management-system-settings.json
   ```
4. Build and start the Docker containers:
   ```bash
   docker-compose up
   ```
   The website should now be running inside Docker at http://localhost:3000.

### Local Setup

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
   yarn inventory-management-system
   ```

### End-to-End Testing (Locally)

This guide outlines the steps to perform end-to-end testing for the Inventory Management System (IMS) locally. You have two options: testing with the actual API and testing with mocked data.

#### Testing with API

1. **Set up IMS-API with an Empty Database**: Begin by setting up the IMS-API using the instructions provided in the [IMS-API repository](https://github.com/ral-facilities/inventory-management-system-api). Ensure that the database is empty to maintain test consistency.

2. **Configure IMS-API URL**: Add the IMS-API URL to the `inventory-management-system-settings.json` file. This file likely contains various settings for your IMS application.

3. **Host IMS-API and IMS-Frontend Together**: To prevent CORS errors during testing, ensure both IMS-API and IMS-Frontend (production build) are hosted on the same machine.

4. **Run Testing Scripts**:
   - Execute `yarn e2e:api` or `yarn e2e:interactive` depending on your preferred testing mode. These scripts are configured to perform end-to-end testing with the API.

#### Testing without API (Using MSW Mock Data)

1. **Run Testing Scripts**:
   - Execute `yarn e2e` or `yarn e2e:interactive` to perform end-to-end testing without relying on the actual API. This setup utilizes MSW (Mock Service Worker) to simulate API responses.

By following these instructions, you can effectively conduct end-to-end testing for the Inventory Management System. Choose the method that best suits your testing requirements and development environment.

**Note:** On the CI environment, the IMS-API is hosted on `127.0.0.1` due to issues with `localhost`.
