import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  viewportWidth: 1500,
  viewportHeight: 1400,

  e2e: {
    baseUrl: 'http://localhost:4765',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
