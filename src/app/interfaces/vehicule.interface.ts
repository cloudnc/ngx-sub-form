export enum VehiculeType {
  SPACESHIP = 'Spaceship',
  LAND = 'Land',
}

export interface BaseVehicule {
  id: string;
  color: string;
  canFire: boolean;
  numberOfPeopleOnBoard: number;
}

export interface Spaceship extends BaseVehicule {
  vehiculeType: VehiculeType.SPACESHIP;
  // https://goo.gl/t7i9iw
  numberOfWings: 0 | 2 | 3;
}

export interface Land extends BaseVehicule {
  vehiculeType: VehiculeType.LAND;
  handlebarLength: number;
}

export type OneVehicule = Spaceship | Land;
