import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,
    video: false,
    retries: {
      runMode: 4,
      openMode: 1,
    },
  },
});
