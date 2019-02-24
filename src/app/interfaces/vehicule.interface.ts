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
  numberOfWings: number;
}

export interface Land extends BaseVehicule {
  vehiculeType: VehiculeType.LAND;
  numberOfWheels: number;
}

export type OneVehicule = Spaceship | Land;
