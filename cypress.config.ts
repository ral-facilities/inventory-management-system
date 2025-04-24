import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    chromeWebSecurity: false,
    video: false,
    retries: {
      runMode: 0,
      openMode: 1,
    },
  },
});
