/// <reference types="Cypress" />

import { DOM, expectAll } from '../../cypress/helpers/dom.helper';
import { hardCodedListings } from './services/listings.data';
import { hardcodedElementsToTestList, FormElement } from '../../cypress/helpers/data.helper';
import { VehicleListing, ListingType } from './interfaces/listing.interface';
import { Spaceship, Speeder, VehicleType } from './interfaces/vehicle.interface';
import { DroidType } from './interfaces/droid.interface';

context(`EJawa demo`, () => {
  beforeEach(() => {
    cy.visit('');
  });

  it(`should have a default list displayed`, () => {
    DOM.list.objList.should('eql', hardcodedElementsToTestList(hardCodedListings));
  });

  it(`should click on the first element and display its data in the form`, () => {
    DOM.list.elements.cy.first().click();

    const x = hardCodedListings[0] as VehicleListing;
    const v = x.product as Spaceship;

    const expectedObj: FormElement = {
      title: x.title,
      price: '£' + x.price.toLocaleString(),
      inputs: {
        id: x.id,
        title: x.title,
        imageUrl: x.imageUrl,
        price: x.price + '',
        listingType: x.listingType,
        vehicleForm: {
          vehicleType: x.product.vehicleType,
          spaceshipForm: {
            color: v.color,
            canFire: v.canFire,
            wingCount: v.wingCount,
            crewMembers: v.crewMembers,
          },
        },
      },
    };

    DOM.form.getObj(VehicleType.SPACESHIP).should('eql', expectedObj);
  });

  it(`should be able to go from a spaceship to a speeder and update the form`, () => {
    DOM.list.elements.cy.eq(0).click();
    DOM.list.elements.cy.eq(1).click();

    const x = hardCodedListings[1] as VehicleListing;
    const v = x.product as Speeder;

    const expectedObj: FormElement = {
      title: x.title,
      price: '£' + x.price.toLocaleString(),
      inputs: {
        id: x.id,
        title: x.title,
        imageUrl: x.imageUrl,
        price: x.price + '',
        listingType: x.listingType,
        vehicleForm: {
          vehicleType: x.product.vehicleType,
          speederForm: {
            color: v.color,
            canFire: v.canFire,
            crewMembers: v.crewMembers,
            maximumSpeed: v.maximumSpeed,
          },
        },
      },
    };

    DOM.form.getObj(VehicleType.SPEEDER).should('eql', expectedObj);
  });

  it(`should display the (nested) errors from the form`, () => {
    DOM.createNewButton.click();

    DOM.form.errors.obj.should('eql', {
      formGroup: {
        oneOf: [['vehicleProduct', 'droidProduct']],
      },
      listingType: {
        required: true,
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.selectListingTypeByType(ListingType.VEHICLE);

    DOM.form.errors.obj.should('eql', {
      formGroup: {
        oneOf: [['vehicleProduct', 'droidProduct']],
      },
      vehicleProduct: {
        formGroup: {
          oneOf: [['speeder', 'spaceship']],
        },
        vehicleType: {
          required: true,
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.vehicleForm.selectVehicleTypeByType(VehicleType.SPACESHIP);

    DOM.form.errors.obj.should('eql', {
      vehicleProduct: {
        spaceship: {
          color: {
            required: true,
          },
          crewMembers: {
            required: true,
          },
          wingCount: {
            required: true,
          },
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.vehicleForm.addCrewMemberButton.click();

    DOM.form.errors.obj.should('eql', {
      vehicleProduct: {
        spaceship: {
          color: {
            required: true,
          },
          crewMembers: {
            crewMembers: [
              {
                firstName: {
                  required: true,
                },
                lastName: {
                  required: true,
                },
              },
            ],
          },
          wingCount: {
            required: true,
          },
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.selectListingTypeByType(ListingType.DROID);

    DOM.form.errors.obj.should('eql', {
      formGroup: {
        oneOf: [['vehicleProduct', 'droidProduct']],
      },
      droidProduct: {
        formGroup: {
          oneOf: [['assassinDroid', 'astromechDroid', 'protocolDroid', 'medicalDroid']],
        },
        droidType: {
          required: true,
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.droidForm.selectDroidTypeByType(DroidType.ASSASSIN);

    DOM.form.errors.obj.should('eql', {
      droidProduct: {
        assassinDroid: {
          color: {
            required: true,
          },
          name: {
            required: true,
          },
          weapons: {
            required: true,
          },
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });

    DOM.form.elements.droidForm.name.type(`IG-86 sentinel`);

    DOM.form.errors.obj.should('eql', {
      droidProduct: {
        assassinDroid: {
          color: {
            required: true,
          },
          weapons: {
            required: true,
          },
        },
      },
      title: {
        required: true,
      },
      imageUrl: {
        required: true,
      },
      price: {
        required: true,
      },
    });
  });

  it(`should display no error when form is valid`, () => {
    // we want to make sure that it's easy to detect from the template that there's no error
    // previously we returned an empty object which made that check way harder in the template
    DOM.list.elements.cy.eq(0).click();

    DOM.form.errors.cy.should('not.exist');
    DOM.form.noErrors.should('exist');
  });

  it(`should recursively disable the form when disabling the top formGroup`, () => {
    DOM.list.elements.cy.eq(0).click();

    DOM.form.cy.within(() => {
      cy.get(`mat-card`).within(() => {
        expectAll(`input`, el => el.should('be.enabled'));
        expectAll(`mat-select`, el => el.should('not.have.class', 'mat-select-disabled'));
        expectAll(`mat-slide-toggle`, el => el.should('not.have.class', 'mat-disabled'));
        expectAll(`button`, el => el.should('be.enabled'));
      });
    });

    DOM.readonlyToggle.click();

    DOM.form.cy.within(() => {
      cy.get(`mat-card`).within(() => {
        expectAll(`input`, el => el.should('be.disabled'));
        expectAll(`mat-select`, el => el.should('have.class', 'mat-select-disabled'));
        expectAll(`mat-slide-toggle`, el => el.should('have.class', 'mat-disabled'));
        expectAll(`button`, el => el.should('be.disabled'));
      });
    });
  });
});
