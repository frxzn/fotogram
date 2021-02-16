import { MediaResponse, UserResponse } from '../../interfaces';
import { bakeImageList } from '../../utils/utils';

beforeEach('mock api', () => {
  cy.intercept('search/topsearch', { fixture: 'search.json' }).as('getSearch');
  cy.intercept('query_hash=6305d415e36c0a5f0abb6daba312f2dd', {
    fixture: 'media.json',
  }).as('getMedia');
});

describe('test multiple pages', () => {
  it('tests landing page', () => {
    cy.visit('/');

    cy.get('#close-icon').should('not.exist');
    cy.get('#spinner').should('not.exist');

    cy.get('#search-input').should('be.empty').type('arianagrande');

    cy.get('#close-icon').should('exist');
    cy.get('#spinner').should('exist');

    cy.wait('@getSearch').then((xhr) => {
      cy.get('#close-icon').should('exist');
      cy.get('#spinner').should('not.exist');
      if (xhr.response) {
        const res = xhr.response.body as UserResponse;
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a')
          .should('have.length', res.users.length)
          .each(($user, index) => {
            const user = res.users[index];

            cy.wrap($user).within(() => {
              cy.get('.username').should('have.text', user.user.username);
            });
          });
        cy.get('#scales').should('not.be.checked').click();
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a').should(
          'have.length',
          res.users.filter((item) => !item.user.is_private).length
        );
        cy.get('#scales').should('be.checked').click();
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a').should(
          'have.length',
          res.users.length
        );
        cy.get('.pages__StyledH1-sc-1dapdfj-2').click();
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a').should(
          'not.exist'
        );
        cy.get('#search-input').should('have.value', 'arianagrande').click();
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a').should('exist');
        cy.get('#close-icon').click().should('not.exist');
        cy.get('#search-input').should('be.empty');
        cy.get('.LandingSearchBar__UserList-sc-1hyvv97-6>a').should(
          'not.exist'
        );
      }
    });
  });

  it('tests profile page', () => {
    cy.visit('/arianagrande');
    cy.get('.react-spinner-material').should('exist');

    cy.wait('@getMedia').then((xhr) => {
      if (xhr.response) {
        const res = xhr.response.body as MediaResponse;
        const arr = bakeImageList(
          res.data.user.edge_owner_to_timeline_media.edges
        );
        cy.get('.ImageGrid__GridContainer-sc-8s99vi-0>a')
          .should('have.length', arr.length)
          .each(($item, index) => {
            const image = arr[index];
            cy.wrap($item)
              .scrollIntoView()
              .within(() => {
                cy.get('img')
                  .should('be.visible')
                  .should('have.attr', 'src', image.preview);
              });
          });
      }
    });
  });
});
