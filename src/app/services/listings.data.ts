import { ListingType, OneListing } from '../interfaces/listing.interface';
import { DroidType, Languages, AstromechDroidShape, AssassinDroidWeapon } from '../interfaces/droid.interface';
import { VehicleType } from '../interfaces/vehicle.interface';

export const hardCodedListings: OneListing[] = [
  {
    id: '3f71b7eb-4a4f-40e6-9fca-e8cc7c0199c3',
    price: 45000000,
    title: 'Millenium Falcon',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/4/43/MillenniumFalconTFA-Fathead.png/revision/latest/scale-to-width-down/1000?cb=20161110011442',
    listingType: ListingType.VEHICLE,
    product: {
      color: '#cec80d',
      canFire: true,
      crewMembers: [
        { firstName: 'Obi-Wan', lastName: 'Kenobi' },
        { firstName: 'R2', lastName: 'D2' },
      ],
      wingCount: 0,
      vehicleType: VehicleType.SPACESHIP,
    },
  },
  {
    id: 'c01ad30c-d686-4db2-9a3c-6cf91c494bf0',
    price: 500000,
    title: 'X-34 landspeeder',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/5/54/X34-landspeeder.jpg/revision/latest?cb=20080316031428',
    listingType: ListingType.VEHICLE,
    product: {
      color: '#2468f7',
      canFire: true,
      crewMembers: [{ firstName: 'Anakin', lastName: 'Skywalker' }],
      vehicleType: VehicleType.SPEEDER,
      maximumSpeed: 250,
    },
  },
  {
    id: '99178909-7db2-4b75-99e5-028b2d4f6755',
    price: 150000,
    title: 'C-3PO Protocol Droid',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/5/51/C-3PO_EP3.png/revision/latest?cb=20131005124036',
    listingType: ListingType.DROID,
    product: {
      color: '#b38d03',
      name: 'Proto',
      droidType: DroidType.PROTOCOL,
      spokenLanguages: [Languages.DROIDSPEAK, Languages.HUTTESE],
    },
  },
  {
    id: '8aa98e18-838c-4a19-975e-2366c2566544',
    price: 210000,
    title: '2-1B Medial Droid',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/b/b6/2-1B_negtd.jpg/revision/latest/scale-to-width-down/200?cb=20100616170941',
    listingType: ListingType.DROID,
    product: {
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
    title: 'R2D2 Astromech Droid',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/e/eb/ArtooTFA2-Fathead.png/revision/latest/scale-to-width-down/1000?cb=20161108040914',
    listingType: ListingType.DROID,
    product: {
      color: '#ff0a0a',
      name: 'Test',
      droidType: DroidType.ASTROMECH,
      toolCount: 15,
      shape: AstromechDroidShape.REGULAR,
    },
  },
  {
    id: '0258166e-13b5-4580-a63b-7c1914ef660f',
    price: 350000,
    title: 'K2-S0 Security Droid',
    imageUrl:
      'https://vignette.wikia.nocookie.net/starwars/images/f/fd/K-2SO_Sideshow.png/revision/latest?cb=20170302003128',
    listingType: ListingType.DROID,
    product: {
      color: '#cc6969',
      name: 'acwer fg',
      droidType: DroidType.ASSASSIN,
      weapons: [AssassinDroidWeapon.AXE, AssassinDroidWeapon.FLAME_THROWER],
    },
  },
];
