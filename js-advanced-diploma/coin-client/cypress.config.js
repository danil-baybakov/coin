/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const { defineConfig } = require("cypress");

// eslint-disable-next-line no-undef
module.exports = defineConfig({
  e2e: {
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:8080/',
  },
});
