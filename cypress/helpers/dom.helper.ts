/// <reference types="Cypress" />

import { ListElement, FormElement } from './data.helper';
import { VehicleType } from '../../src/app/interfaces/vehicle.interface';

const getTextFromTag = (element: HTMLElement, tag: string): string =>
  Cypress.$(element)
    .find(`*[data-${tag}]`)
    .text()
    .trim();

const getTextFromInput = (element: HTMLElement, tag: string): string =>
  Cypress.$(element)
    .find(`*[data-${tag}]`)
    .val() + '';

const getSelectedOptionFromSelect = (element: HTMLElement, tag: string): string =>
  Cypress.$(element)
    .find(`*[data-${tag}] .mat-select-value-text`)
    .text()
    .trim();

const getToggleValue = (element: HTMLElement, tag: string): boolean =>
  Cypress.$(element)
    .find(`*[data-${tag}]`)
    .hasClass('mat-checked');

export const DOM = {
  get list() {
    return {
      get cy() {
        return cy.get(`app-listings`);
      },
      get elements() {
        return {
          get cy() {
            return DOM.list.cy.within(() => {
              cy.get(`*[data-list-item]`);
            });
          },
        };
      },
      get objList(): Cypress.Chainable<ListElement[]> {
        return DOM.list.elements.cy.then($elements => {
          return $elements
            .map((_, element) => ({
              title: getTextFromTag(element, 'title'),
              type: getTextFromTag(element, 'type'),
              price: getTextFromTag(element, 'price'),
              subType: getTextFromTag(element, 'sub-type'),
              details: getTextFromTag(element, 'details'),
            }))
            .get();
        });
      },
    };
  },
  get form() {
    return {
      get cy() {
        return cy.get('app-listing');
      },
      get obj(): Cypress.Chainable<FormElement> {
        const getVehiculeObj = (element: HTMLElement, type: VehicleType) =>
          ({
            Spaceship: {
              spaceshipForm: {
                color: getTextFromInput(element, 'input-color'),
                canFire: getToggleValue(element, 'input-can-fire'),
                numberOfPeopleOnBoard: +getTextFromInput(element, 'input-number-of-people-on-board'),
                numberOfWings: +getTextFromInput(element, 'input-number-of-wings'),
              },
            },
            Speeder: {
              speederForm: {
                color: getTextFromInput(element, 'input-color'),
                canFire: getToggleValue(element, 'input-can-fire'),
                numberOfPeopleOnBoard: +getTextFromInput(element, 'input-number-of-people-on-board'),
                maximumSpeed: +getTextFromInput(element, 'input-maximum-speed'),
              },
            },
          }[type]);

        return DOM.form.cy.then($element => {
          return $element
            .map((_, element) => ({
              title: getTextFromTag(element, 'title'),
              price: getTextFromTag(element, 'price'),
              inputs: {
                id: getTextFromInput(element, 'input-id'),
                title: getTextFromInput(element, 'input-title'),
                imageUrl: getTextFromInput(element, 'input-image-url'),
                price: getTextFromInput(element, 'input-price'),
                listingType: getSelectedOptionFromSelect(element, 'select-listing-type'),
                vehiculeForm: {
                  vehiculeType: getSelectedOptionFromSelect(element, 'select-vehicule-type'),
                  ...getVehiculeObj(element, getSelectedOptionFromSelect(
                    element,
                    'select-vehicule-type',
                  ) as VehicleType),
                },
              },
            }))
            .get()[0];
        });
      },
    };
  },
};
