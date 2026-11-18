import { execSync } from 'child_process';
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
    setupNodeEvents(on) {
      on('task', {
        exec(command: string) {
          return execSync(command, { encoding: 'utf-8' });
        },
      });
    },
  },
});
