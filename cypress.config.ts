import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    video: false,
    retries: {
      runMode: 3,
      openMode: 1,
    },
    // TODO: Figure out if this is needed and if so remove require
    // setupNodeEvents(on, config) {
    //   // `on` is used to hook into various events Cypress emits
    //   // `config` is the resolved Cypress config
    //   on('task', {
    //     // eslint-disable-next-line @typescript-eslint/no-var-requires
    //     failed: require('cypress-failed-log/src/failed')(),
    //   });
    // },
  },
});
