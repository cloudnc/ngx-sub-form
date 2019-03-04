export enum DroidType {
  PROTOCOL = 'Protocol',
  MEDICAL = 'Medical',
  ASTROMECH = 'Astromech',
  ASSASSIN = 'Assassin',
}

export interface BaseDroid {
  id: string;
  color: string;
  name: string;
}

export enum Languages {
  DROIDSPEAK = 'Droidspeak',
  EWOKESE = 'Ewokese',
  HUTTESE = 'Huttese',
  JAWAESE = 'Jawaese',
  SITH = 'Sith',
  SHYRIIWOOK = 'Shyriiwook',
}

export interface ProtocolDroid extends BaseDroid {
  droidType: DroidType.PROTOCOL;
  spokenLanguages: Languages[];
}

export interface MedicalDroid extends BaseDroid {
  droidType: DroidType.MEDICAL;
  canHealHumans: boolean;
  canFixRobots: boolean;
}

export enum AstromechDroidShape {
  REGULAR = 'Regular',
  SPHERE = 'Sphere',
}

export interface AstromechDroid extends BaseDroid {
  droidType: DroidType.ASTROMECH;
  numberOfToolsCarried: number;
  shape: AstromechDroidShape;
}

export enum AssassinDroidWeapon {
  SABER = 'Saber',
  FLAME_THROWER = 'FlameThrower',
  GUN = 'Gun',
  AXE = 'Axe',
}

export interface AssassinDroid extends BaseDroid {
  droidType: DroidType.ASSASSIN;
  weapons: AssassinDroidWeapon[];
}

export type OneDroid = ProtocolDroid | MedicalDroid | AstromechDroid | AssassinDroid;
