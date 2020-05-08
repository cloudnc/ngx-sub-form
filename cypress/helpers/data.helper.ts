import { CrewMember } from '../../src/app/interfaces/crew-member.interface';
import { DroidType } from '../../src/app/interfaces/droid.interface';
import { ListingType, OneListing } from '../../src/app/interfaces/listing.interface';
import { VehicleType } from '../../src/app/interfaces/vehicle.interface';
import { UnreachableCase } from '../../src/app/shared/utils';

export interface ListElement {
  readonly title: string;
  readonly type: string;
  readonly price: string;
  readonly subType: string;
  readonly details: string;
}

export type VehicleFormElement = {
  readonly vehicleType: string;
} & (
  | {
      readonly spaceshipForm: {
        readonly color: string;
        readonly canFire: boolean;
        readonly crewMembers: CrewMember[];
        readonly wingCount: number;
      };
    }
  | {
      readonly speederForm: {
        readonly color: string;
        readonly canFire: boolean;
        readonly crewMembers: CrewMember[];
        readonly maximumSpeed: number;
      };
    }
);

export interface DroidFormElement {
  readonly droidType: string;
  // @todo handle different cases
  readonly protocolDroidForm: {
    readonly color: string;
    readonly name: string;
    readonly spokenLanguages: string;
  };
}

export interface FormElement {
  readonly title: string;
  readonly price: string;
  readonly inputs: {
    readonly id: string;
    readonly title: string;
    readonly imageUrl: string;
    readonly price: string;
    readonly listingType: string;
  } & { readonly vehicleForm: VehicleFormElement };
}

export const hardcodedElementToTestElement = (item: OneListing): ListElement => {
  const title: string = item.title;
  const type: string = item.listingType;
  const price: string = item.price.toLocaleString();

  let subType: string;
  let details: string;

  switch (item.listingType) {
    case ListingType.DROID: {
      subType = item.product.droidType;

      switch (item.product.droidType) {
        case DroidType.ASSASSIN:
          details = `Weapons: ${item.product.weapons.join(', ')}`;
          break;

        case DroidType.ASTROMECH:
          details = `Number of tools: ${item.product.toolCount}`;
          break;

        case DroidType.MEDICAL:
          details = [
            item.product.canHealHumans ? `Can heal humans` : `Can't heal humans`,
            item.product.canFixRobots ? `can fix robots` : `can't fix robots`,
          ].join(', ');
          break;

        case DroidType.PROTOCOL:
          details = `Spoken languages: ${item.product.spokenLanguages.join(', ')}`;
          break;

        default:
          throw new UnreachableCase(item.product);
      }
      break;
    }

    case ListingType.VEHICLE: {
      subType = item.product.vehicleType;

      switch (item.product.vehicleType) {
        case VehicleType.SPACESHIP:
          details = [
            `Crew members: ${item.product.crewMembers
              .map(crewMember => `${crewMember.firstName} ${crewMember.lastName}`)
              .join(', ')}`,
            item.product.canFire ? `can fire` : `can't fire`,
            `number of wings: ${item.product.wingCount}`,
          ].join(', ');
          break;

        case VehicleType.SPEEDER:
          details = [
            `Crew members: ${item.product.crewMembers
              .map(crewMember => `${crewMember.firstName} ${crewMember.lastName}`)
              .join(', ')}`,
            item.product.canFire ? `can fire` : `can't fire`,
            `maximum speed: ${item.product.maximumSpeed}kph`,
          ].join(', ');
          break;

        default:
          throw new UnreachableCase(item.product);
      }

      break;
    }

    default:
      throw new UnreachableCase(item);
  }

  return {
    title,
    type,
    price,
    subType,
    details,
  };
};

export const hardcodedElementsToTestList = (items: OneListing[]): ListElement[] =>
  items.map(item => hardcodedElementToTestElement(item));

export const extractErrors = (errors: JQuery<HTMLElement>) => {
  return JSON.parse(errors.text().trim());
};
