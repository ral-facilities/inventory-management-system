import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    video: false,
    retries: {
      runMode: 0,
      openMode: 1,
    },
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on('task', {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        failed: require('cypress-failed-log/src/failed')(),
      });
    },
  },
});
