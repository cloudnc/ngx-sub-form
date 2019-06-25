export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  Other = 'Other',
}

export interface Name {
  firstname: string;
  lastname: string;
}

export interface Address {
  streetaddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Phone {
  phone: string;
  countrycode: string;
}

export interface PersonalDetails {
  name: Name;
  gender: Gender;
  address: Address;
  phone: Phone;
}

export interface MainForm {
  // this is one example out of what you posted
  personalDetails: PersonalDetails;
  
  // you'll probably want to add `parent` and `responsibilities` here too
  // which I'm not going to do because `personalDetails` covers it all :)
}