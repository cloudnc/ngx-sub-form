/// <reference types="Cypress" />

import { ListElement, FormElement, extractErrors } from './data.helper';
import { VehicleType } from '../../src/app/interfaces/vehicle.interface';
import { ListingType } from '../../src/app/interfaces/listing.interface';
import { DroidType } from '../../src/app/interfaces/droid.interface';

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
  get createNewButton() {
    return cy.get('*[data-create-new]');
  },
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
      get errors() {
        return {
          get cy() {
            return cy.get(`*[data-errors]`);
          },
          get obj() {
            return DOM.form.errors.cy.then(extractErrors);
          },
        };
      },
      get noErrors() {
        return cy.get(`*[data-no-error]`);
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
      get elements() {
        return {
          get title() {
            return cy.get(`*[data-input-title]`);
          },
          get imageUrl() {
            return cy.get(`*[data-input-image-url]`);
          },
          get price() {
            return cy.get(`*[data-input-price]`);
          },
          get selectListingType() {
            return cy.get(`*[data-select-listing-type]`);
          },
          selectListingTypeByType: (type: ListingType) => {
            DOM.form.elements.selectListingType.click();

            return cy.get(`*[data-select-listing-type-option]`).within(() => cy.contains(type).click());
          },
          get droidForm() {
            return {
              get name() {
                return cy.get(`*[data-input-name]`);
              },
              get selectDroidType() {
                return cy.get(`*[data-select-droid-type]`);
              },
              selectDroidTypeByType: (type: DroidType) => {
                DOM.form.elements.droidForm.selectDroidType.click();

                return cy.get(`*[data-select-droid-type-option]`).within(() => cy.contains(type).click());
              },
            };
          },
        };
      },
    };
  },
};
