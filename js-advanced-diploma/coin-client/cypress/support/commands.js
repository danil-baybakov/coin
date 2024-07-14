/* eslint-disable prettier/prettier */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
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

const USER = 'developer';
const PASSWORD = 'skillbox';
const BASE_URL = 'http://localhost:8080';

Cypress.Commands.add('login', (idSession) => {
  cy.session(
    idSession,
    () => {
      cy.visit('/login');
      cy.get('[data-name="login"]').type(`${USER}`);
      cy.get('[data-name="password"]').type(`${PASSWORD}{enter}`, {
        log: false,
      });

      cy.url().should('include', '/accounts');
    },
    {
      validate: () => {
        cy.getAllSessionStorage().then((result) => {
          expect(result).to.have.nested.property(`${BASE_URL}.token`);
        });
      },
    },
  );
});
