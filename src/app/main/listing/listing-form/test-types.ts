// export type Controls<T> = { [K in keyof T]-?: AbstractControl };

type Hello = { a: number | null; b: number };

type AAAA = number | null;
type BBBB = Extract<AAAA, null | undefined>;
type CCCC = BBBB extends never ? never : BBBB;

type H<T> = { [key in keyof T]: Extract<T[key], null | undefined> extends never ? key : never };
type DDDD = H<Hello>;
interface Person {
  id: string;
  name?: string;
  age: number | null;
}

type AAA = Exclude<Person['age'], Exclude<Person['age'], null | undefined>>;
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

type D = NoUndefinedField<Person>;

type zzz = H<Person>;
type AAAAAA = Pick<Person, H<Pick<Person, 'age'>>>;
type KKKKKK = {} extends AAAAAA ? true : false;

type B = Person['age'] extends null ? never : Person['age'];
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends H<Pick<T, K>> ? never : K;
}[keyof T];
type A = RequiredKeys<Person>;

new FormGroup({});
