import { OneVehicule } from './vehicule.interface';
import { OneDroid } from './droid.interface';

export enum SellType {
  VEHICULE = 'Vehicule',
  DROID = 'Droid',
}

export interface BaseSell {
  id: string;
  price: number;
}

export interface VehiculeSell extends BaseSell {
  sellType: SellType.VEHICULE;
  product: OneVehicule;
}

export interface DroidSell extends BaseSell {
  sellType: SellType.DROID;
  product: OneDroid;
}

export type OneSell = VehiculeSell | DroidSell;
