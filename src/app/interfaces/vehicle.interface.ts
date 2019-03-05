export enum VehicleType {
  SPACESHIP = 'Spaceship',
  SPEEDER = 'Speeder',
}

export interface BaseVehicle {
  id: string;
  color: string;
  canFire: boolean;
  numberOfPeopleOnBoard: number;
}

export interface Spaceship extends BaseVehicle {
  vehicleType: VehicleType.SPACESHIP;
  numberOfWings: number;
}

export interface Land extends BaseVehicle {
  vehicleType: VehicleType.SPEEDER;
  maximumSpeed: number;
}

export type OneVehicle = Spaceship | Land;
