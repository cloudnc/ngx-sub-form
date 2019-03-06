import { OneDroid } from './droid.interface';
import { OneVehicle } from './vehicle.interface';

export enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

export interface BaseListing {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

export interface VehicleListing extends BaseListing {
  listingType: ListingType.VEHICLE;
  product: OneVehicle;
}

export interface DroidListing extends BaseListing {
  listingType: ListingType.DROID;
  product: OneDroid;
}

export type OneListing = VehicleListing | DroidListing;
