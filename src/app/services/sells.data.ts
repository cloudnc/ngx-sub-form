import { SellType, OneSell } from '../interfaces/sell.interface';
import { DroidType, Languages, AstromechDroidShape, AssassinDroidWeapon } from '../interfaces/droid.interface';
import { VehiculeType } from '../interfaces/vehicule.interface';

export const hardCodedSells: OneSell[] = [
  {
    id: '3f71b7eb-4a4f-40e6-9fca-e8cc7c0199c3',
    price: 45000000,
    sellType: SellType.VEHICULE,
    product: {
      id: 'f7c7493b-f5df-46c5-90b7-afb0ff44c2ec',
      color: '#cec80d',
      canFire: true,
      numberOfPeopleOnBoard: 35,
      numberOfWings: 4,
      vehiculeType: VehiculeType.SPACESHIP,
    },
  },
  {
    id: 'c01ad30c-d686-4db2-9a3c-6cf91c494bf0',
    price: 500000,
    sellType: SellType.VEHICULE,
    product: {
      id: 'fdf64083-aa13-4668-aa4c-5f68bddef683',
      color: '#2468f7',
      canFire: true,
      numberOfPeopleOnBoard: 20,
      vehiculeType: VehiculeType.LAND,
      numberOfWheels: 4,
    },
  },
  {
    id: '99178909-7db2-4b75-99e5-028b2d4f6755',
    price: 150000,
    sellType: SellType.DROID,
    product: {
      id: 'c6723f9d-7e26-4c22-8545-dd29fe0fb34e',
      color: '#b38d03',
      name: 'Proto',
      droidType: DroidType.PROTOCOL,
      spokenLanguages: [Languages.DROIDSPEAK, Languages.HUTTESE],
    },
  },
  {
    id: '8aa98e18-838c-4a19-975e-2366c2566544',
    price: 210000,
    sellType: SellType.DROID,
    product: {
      id: '4fef91bb-97ae-4840-891e-178eb0a43727',
      color: '#07c911',
      name: 'Medic',
      droidType: DroidType.MEDICAL,
      canHealHumans: true,
      canFixRobots: true,
    },
  },
  {
    id: '08c2c071-f03e-4a63-93b7-bd3df0f2987c',
    price: 215000,
    sellType: SellType.DROID,
    product: {
      id: 'cc925c0d-0fa3-4f83-9826-6c41808f3ee7',
      color: '#ff0a0a',
      name: 'Test',
      droidType: DroidType.ASTROMECH,
      numberOfToolsCarried: 15,
      shape: AstromechDroidShape.REGULAR,
    },
  },
  {
    id: '0258166e-13b5-4580-a63b-7c1914ef660f',
    price: 350000,
    sellType: SellType.DROID,
    product: {
      id: 'bdbb865d-fb90-4e96-a8d0-be93d1b352a4',
      color: '#cc6969',
      name: 'acwer fg',
      droidType: DroidType.ASSASSIN,
      weapons: [AssassinDroidWeapon.AXE, AssassinDroidWeapon.FLAME_THROWER],
    },
  },
];
