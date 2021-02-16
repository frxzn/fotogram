import { mock } from '../mock-data';

beforeEach('mock api', () => {
  cy.intercept('search/topsearch', (req) => {
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    const qs = params.get('query');
    req.reply(mock(qs));
  });
});

describe('My first test', () => {
  it('Does not do much', () => {
    cy.visit('/');
    cy.get('#search-input').type('aaa');
  });
});
