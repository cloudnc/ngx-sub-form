/// <reference types="Cypress" />

import { DroidType } from '../../src/app/interfaces/droid.interface';
import { ListingType } from '../../src/app/interfaces/listing.interface';
import { VehicleType } from '../../src/app/interfaces/vehicle.interface';

const getTextFromTag = (element: HTMLElement, tag: string): string =>
  Cypress.$(element).find(`*[data-${tag}]`).text().trim();

const getTextFromInput = (element: HTMLElement, tag: string): string =>
  Cypress.$(element).find(`*[data-${tag}]`).val() + '';

const getSelectedOptionFromSelect = (element: HTMLElement, tag: string): string =>
  Cypress.$(element).find(`*[data-${tag}] .mat-mdc-select-min-line`).text().trim();

const getToggleValue = (element: HTMLElement, tag: string): boolean =>
  Cypress.$(element).find(`*[data-${tag}]`).hasClass('mat-mdc-slide-toggle-checked');

const getCrewMembers = (element: HTMLElement): { firstName: string; lastName: string }[] =>
  Cypress.$(element)
    .find('*[data-crew-member]')
    .map((_, $element) => ({
      firstName: getTextFromInput($element, 'input-crew-member-first-name'),
      lastName: getTextFromInput($element, 'input-crew-member-last-name'),
    }))
    .get();

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
            return DOM.list.cy.find('*[data-list-item]');
          },
        };
      },
    };
  },
  get readonlyToggle() {
    return cy.get(`*[data-readonly]`);
  },
  get form() {
    return {
      get cy() {
        return cy.get('app-listing');
      },
      get errors() {
        return cy.get(`*[data-errors]`);
      },
      get noErrors() {
        return cy.get(`*[data-no-error]`);
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

            return cy.contains(`*[data-select-listing-type-option]`, type).click();
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

                return cy.contains(`*[data-select-droid-type-option]`, type).click();
              },
            };
          },
          get vehicleForm() {
            return {
              get name() {
                return cy.get(`*[data-input-name]`);
              },
              get selectVehicleType() {
                return cy.get(`*[data-select-vehicle-type]`);
              },
              selectVehicleTypeByType: (type: VehicleType) => {
                DOM.form.elements.vehicleForm.selectVehicleType.click();

                return cy.contains(`*[data-select-vehicle-type-option]`, type).click();
              },
              get addCrewMemberButton() {
                return cy.get(`*[data-btn-add-crew-member]`);
              },
            };
          },
        };
      },
    };
  },
};

const getVehicleObj = (element: HTMLElement, vehicleType: VehicleType) =>
  ({
    Spaceship: {
      spaceshipForm: {
        color: getTextFromInput(element, 'input-color'),
        canFire: getToggleValue(element, 'input-can-fire'),
        crewMembers: getCrewMembers(element),
        wingCount: +getTextFromInput(element, 'input-number-of-wings'),
      },
    },
    Speeder: {
      speederForm: {
        color: getTextFromInput(element, 'input-color'),
        canFire: getToggleValue(element, 'input-can-fire'),
        crewMembers: getCrewMembers(element),
        maximumSpeed: +getTextFromInput(element, 'input-maximum-speed'),
      },
    },
  }[vehicleType]);

export const getFormValue = (form: JQuery<HTMLElement>, type: VehicleType) =>
  form
    .map((_, element) => ({
      title: getTextFromTag(element, 'title'),
      price: getTextFromTag(element, 'price'),
      inputs: {
        id: getTextFromInput(element, 'input-id'),
        title: getTextFromInput(element, 'input-title'),
        imageUrl: getTextFromInput(element, 'input-image-url'),
        price: getTextFromInput(element, 'input-price'),
        listingType: getSelectedOptionFromSelect(element, 'select-listing-type'),
        vehicleForm: {
          vehicleType: getSelectedOptionFromSelect(element, 'select-vehicle-type'),
          ...getVehicleObj(element, type),
        },
      },
    }))
    .get()[0];

export const getFormList = ($elements: JQuery<HTMLElement>) => {
  return $elements
    .map((_, element) => ({
      title: getTextFromTag(element, 'title'),
      type: getTextFromTag(element, 'type'),
      price: getTextFromTag(element, 'price'),
      subType: getTextFromTag(element, 'sub-type'),
      details: getTextFromTag(element, 'details'),
    }))
    .get();
};
