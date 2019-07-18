# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library to manage forms with Angular.

Really small bundle (< 15kb) and no module to setup. Pick the class you need and extend it.

Built for **all your different forms** (tiny to extra large!), this library will deal with all the boilerplate required to use a [`ControlValueAccessor`](https://blog.angularindepth.com/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms-93b9eee9ee83) internally and let you manage your most complex forms in a fast and easy way.

From creating a small custom input, to breaking down a form into multiple sub components, `ngx-sub-form` will give you a lot of functionalities like better type safety to survive futur refactors (from both `TS` and `HTML`), remapping external data to the shape you need within your form, access nested errors and many more. It'll also save you from passing a `FormGroup` to an `@Input` :pray:.

It also works particularly well with polymorphic data structures.

[![npm version](https://badge.fury.io/js/ngx-sub-form.svg)](https://www.npmjs.com/package/ngx-sub-form)
[![Build Status](https://travis-ci.org/cloudnc/ngx-sub-form.svg?branch=master)](https://travis-ci.org/cloudnc/ngx-sub-form)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)

## Blog post

This README focuses on explaining how to use `ngx-sub-form`.

If you first want to know more about the context, what we tried before creating that library and discover it through detailed examples, you can read a blog post about it here: https://dev.to/maxime1992/building-scalable-robust-and-type-safe-forms-with-angular-3nf9

## Install

Install the [npm package](https://www.npmjs.com/package/ngx-sub-form): `ngx-sub-form`

## Demo

_Before we get started with how to use the library and give some examples, a complete demo is available on [this repo](https://github.com/cloudnc/ngx-sub-form), within the [`src`](https://github.com/cloudnc/ngx-sub-form/tree/master/src) folder.  
Demo is built around a concept of galactic sales. You can sell either Droids (Protocol, Medical, Astromech, Assassin) or Vehicles (Spaceship, Speeder).  
**This will also be used for the following examples**.  
If you want to see the demo in action, please visit [https://cloudnc.github.io/ngx-sub-form](https://cloudnc.github.io/ngx-sub-form)._

## Setup

`ngx-sub-form` provides

- 2 classes for top level form components: `NgxRootFormComponent`, `NgxAutomaticRootFormComponent`
- 2 classes for sub level form components: `NgxSubFormComponent`, `NgxSubFormRemapComponent`
- 3 interfaces: `Controls<T>`, `ControlsNames<T>`, `FormGroupOptions<T>`
- 1 function: `subformComponentProviders`

So there's actually nothing to setup (like a module), you can just use them directly.

## Usage

### When should I use `ngx-sub-form`?

**Short answer:** As soon as you've got a form!

**Detailed answer:**

- When you want to create a `ControlValueAccessor`
- When you want to create a simple form, it'll give you better typings
- When you want to create a bigger form that you need to split up into sub components
- When dealing with polymorphic data that you want to display in a form

### Type safety you said?

When extending one of the 4 core classes:

- `NgxRootFormComponent`
- `NgxAutomaticRootFormComponent`
- `NgxSubFormComponent`
- `NgxSubFormRemapComponent`

You'll have access to the following properties (within your `.ts` **and** `.html` files):

- `formGroup`: The actual form group, useful to define the binding `[formGroup]="formGroup"` into the view
- `formControlNames`: All the control names available in your form. Use it when defining a `formControlName` like that `<input [formControlName]="formControlNames.yourControl">`
- `formGroupControls`: All the controls of your form, helpful to avoid doing `formGroup.get(formControlNames.yourControl)`, instead just do `formGroupControls.yourControl`
- `formGroupValues`: Access all the values of your form directly without doing `formGroup.get(formControlNames.yourControl).value`, instead just do `formGroupValues.yourControl` (and it'll be correctly typed!)
- `formGroupErrors`: All the errors of the current form **including** the sub errors (if any), just use `formGroupErrors` or `formGroupErrors?.yourControl`. Notice the question mark in `formGroupErrors?.yourControl`, it **will return `null` if there's no error**

With AOT turned on you'll get proper type checking within your TS **and** HTML files.  
When refactoring your interfaces/classes, your form will error at build time if a property should no longer be here or if one is missing.

### First component level

Within the component where the (top) form will be handled, you have to define the top level structure. You can do it manually as you'd usually do (by defining your own `FormGroup`), but it's better to extend from either `NgxRootFormComponent` or `NgxAutomaticRootFormComponent` as you'll get some type safety and other useful helpers. If dealing with polymorphic data, **each type must have it's own form control**:  
(_even if it doesn't match your model, we'll talk about that later_)

Before explaining the difference between `NgxRootFormComponent` or `NgxAutomaticRootFormComponent`, let's look at an example with a polymorphic type:

```ts
// src/readme/listing.component.ts#L8-L58

enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

export interface OneListingForm {
  id: string;
  title: string;
  price: number;
  imageUrl: string;

  // polymorphic form where product can either be a vehicle or a droid
  listingType: ListingType | null;
  vehicleProduct: OneVehicle | null;
  droidProduct: OneDroid | null;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent extends NgxAutomaticRootFormComponent<OneListing, OneListingForm> {
  // as we're renaming the input, it'd be impossible for ngx-sub-form to guess
  // the name of your input to then check within the `ngOnChanges` hook wheter
  // it has been updated or not
  // another solution would be to ask you to use a setter and call a hook but
  // this is too verbose, that's why we created a decorator `@DataInput`
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('listing')
  public dataInput: OneListing | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('listingUpdated') public dataOutput: EventEmitter<OneListing> = new EventEmitter();

  // to access it from the view
  public ListingType = ListingType;

  protected getFormControls(): Controls<OneListingForm> {
    return {
      vehicleProduct: new FormControl(null),
      droidProduct: new FormControl(null),
      listingType: new FormControl(null, Validators.required),
      id: new FormControl(null, Validators.required),
      title: new FormControl(null, Validators.required),
      imageUrl: new FormControl(null, Validators.required),
      price: new FormControl(null, Validators.required),
    };
  }
}
```

Then, within the `.component.html` we:

- Define the `formGroup`
- Create a `select` tag to choose between the 2 types
- Use `ngSwitch` directive to create either a `DroidProductComponent` or a `VehicleProductComponent`

```html
<!-- src/readme/listing.component.html -->

<form [formGroup]="formGroup">
  <select [formControlName]="formControlNames.listingType">
    <option *ngFor="let listingType of (ListingType | keyvalue)" [value]="listingType.value">
      {{ listingType.value }}
    </option>
  </select>

  <div [ngSwitch]="formGroupValues.listingType">
    <app-droid-product
      *ngSwitchCase="ListingType.DROID"
      [formControlName]="formControlNames.droidProduct"
    ></app-droid-product>

    <app-vehicle-product
      *ngSwitchCase="ListingType.VEHICLE"
      [formControlName]="formControlNames.vehicleProduct"
    ></app-vehicle-product>
  </div>
</form>
```

One thing to notice above: `<app-droid-product>` and `<app-vehicle-product>` **are** custom `ControlValueAccessor`s and let us bind them to `formControlName`, as we would with a regular `input` tag.

Every time the form changes, that component will `emit` a value from the `dataOutput` output (that you can rename). On the other hand, if there's an update, simply pass the new object as input and the form will be updated.

From the parent component you can do like the following:

```html
<!-- src/readme/listing-form-usage.html -->

<app-listing-form
  [disabled]="false"
  [listing]="listing$ | async"
  (listingUpdated)="upsertListing($event)"
></app-listing-form>
```

_Note the presence of disabled, this is an optional input provided by both `NgxRootFormComponent` and `NgxAutomaticRootFormComponent` that let you disable (or enable when true) the whole form._

Differences between:

- `NgxRootFormComponent`: Will never emit the form value automatically when it changes, to emit the value you'll have to call the method `manualSave` when needed
- `NgxAutomaticRootFormComponent`: Will emit the form value as soon as there's a change. It's possible to customize the emission rate by overidding the `handleEmissionRate` method

The method `handleEmissionRate` is available accross **all** the classes that `ngx-sub-form` offers. It takes an observable as input and expect another observable as output. One common case is to simply [`debounce`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-debounce) the emission. If that's what you want to do, instead of manipulating the observable chain yourself you can just do:

```ts
// src/readme/handle-emission-rate.ts#L6-L9

protected handleEmissionRate(): (obs$: Observable<OneListingForm>) => Observable<OneListingForm> {
  // debounce by 500ms
  return NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES.debounce(500);
}
```

### Second component level (optional)

_Only useful if you're breaking up a form into sub components._

All you have to do is:

1. Add required providers using the utility function `subformComponentProviders`:

```ts
// src/readme/steps/add-providers.ts#L2-L10

import { subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent), // <-- Add this
})
export class VehicleProductComponent {}
```

2. Make your original class extend `NgxSubFormComponent` **or** `NgxSubFormRemapComponent` if you need to remap the data (will be explained later):
3. Implement the required interface by defining the controls of your form (as we previously did in the top form component):

```ts
// src/readme/steps/add-controls.ts#L12-L20

export class VehicleProductComponent extends NgxSubFormComponent<OneVehicleForm> {
  protected getFormControls(): Controls<OneVehicleForm> {
    return {
      speeder: new FormControl(null),
      spaceship: new FormControl(null),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
```

_Simplified from the original example into src folder to keep the example as minimal and relevant as possible._

### Remapping Data

It is a frequent pattern to have the data that you're trying to modify in a format that is incovenient to the angular forms structural constraints. For this reason, `ngx-form-component` offers a separate class `NgxSubFormRemapComponent`
which will require you to define two interfaces:

- One to model the data going into the form
- The other to describe the data that will be set as the value

Example, take a look at [`VehicleProductComponent`](https://github.com/cloudnc/ngx-sub-form/blob/master/src/app/main/listing/listing-form/vehicle-listing/vehicle-product.component.ts):

```ts
// src/readme/vehicle-product.component.simplified.ts#L7-L69

// merged few files together to make it easier to follow
export interface BaseVehicle {
  color: string;
  canFire: boolean;
  crewMemberCount: number;
}

export interface Spaceship extends BaseVehicle {
  vehicleType: VehicleType.SPACESHIP;
  wingCount: number;
}

export interface Speeder extends BaseVehicle {
  vehicleType: VehicleType.SPEEDER;
  maximumSpeed: number;
}

export type OneVehicle = Spaceship | Speeder;

interface OneVehicleForm {
  speeder: Speeder | null;
  spaceship: Spaceship | null;
  vehicleType: VehicleType | null;
}

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent),
})
export class VehicleProductComponent extends NgxSubFormRemapComponent<OneVehicle, OneVehicleForm> {
  public VehicleType = VehicleType;

  protected getFormControls(): Controls<OneVehicleForm> {
    return {
      speeder: new FormControl(null),
      spaceship: new FormControl(null),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  protected transformToFormGroup(obj: OneVehicle): OneVehicleForm {
    return {
      speeder: obj.vehicleType === VehicleType.SPEEDER ? obj : null,
      spaceship: obj.vehicleType === VehicleType.SPACESHIP ? obj : null,
      vehicleType: obj.vehicleType,
    };
  }

  protected transformFromFormGroup(formValue: OneVehicleForm): OneVehicle | null {
    switch (formValue.vehicleType) {
      case VehicleType.SPEEDER:
        return formValue.speeder;
      case VehicleType.SPACESHIP:
        return formValue.spaceship;
      case null:
        return null;
      default:
        throw new UnreachableCase(formValue.vehicleType);
    }
  }
}
```

**You're always better off making your data structure better suit Angular forms, than abusing forms to fit your data pattern**

For a complete example of this see `https://github.com/cloudnc/ngx-sub-form/blob/master/src/app/main/listing/listing-form/vehicle-listing/vehicle-product.component.ts` (repeated below):

```ts
// src/app/main/listing/listing-form/vehicle-listing/vehicle-product.component.ts#L7-L50

export interface OneVehicleForm {
  speeder: Speeder | null;
  spaceship: Spaceship | null;
  vehicleType: VehicleType | null;
}

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent),
})
export class VehicleProductComponent extends NgxSubFormRemapComponent<OneVehicle, OneVehicleForm> {
  public VehicleType = VehicleType;

  protected getFormControls(): Controls<OneVehicleForm> {
    return {
      speeder: new FormControl(null),
      spaceship: new FormControl(null),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  protected transformToFormGroup(obj: OneVehicle): OneVehicleForm {
    return {
      speeder: obj.vehicleType === VehicleType.SPEEDER ? obj : null,
      spaceship: obj.vehicleType === VehicleType.SPACESHIP ? obj : null,
      vehicleType: obj.vehicleType,
    };
  }

  protected transformFromFormGroup(formValue: OneVehicleForm): OneVehicle | null {
    switch (formValue.vehicleType) {
      case VehicleType.SPEEDER:
        return formValue.speeder;
      case VehicleType.SPACESHIP:
        return formValue.spaceship;
      case null:
        return null;
      default:
        throw new UnreachableCase(formValue.vehicleType);
    }
  }
}
```

Our "incoming" object is of type `OneVehicle` but into that component we treat it as a `OneVehicleForm` to split the vehicle (either a `speeder` or `spaceship`) in 2 **separate** properties.

### Dealing with arrays

When your data structure contains one or more arrays, you may want to simply display the values in the view but chances are you want to bind them to the form.

In that case, working with a `FormArray` is the right way to go and for that, we will take advantage of the remap principles explained in the previous section.

If you have custom validations on the form controls, implement the `NgxFormWithArrayControls<FormType>` interface, which gives the library a hook with which to construct new form controls for the form array with the correct validators applied.

Example:

```ts
// src/app/main/listing/listing-form/vehicle-listing/crew-members/crew-members.component.ts#L13-L69

interface CrewMembersForm {
  crewMembers: CrewMember[];
}

@Component({
  selector: 'app-crew-members',
  templateUrl: './crew-members.component.html',
  styleUrls: ['./crew-members.component.scss'],
  providers: subformComponentProviders(CrewMembersComponent),
})
export class CrewMembersComponent extends NgxSubFormRemapComponent<CrewMember[], CrewMembersForm>
  implements NgxFormWithArrayControls<CrewMembersForm> {
  protected getFormControls(): Controls<CrewMembersForm> {
    return {
      crewMembers: new FormArray([]),
    };
  }

  protected transformToFormGroup(obj: CrewMember[] | null): CrewMembersForm {
    return {
      crewMembers: obj ? obj : [],
    };
  }

  protected transformFromFormGroup(formValue: CrewMembersForm): CrewMember[] | null {
    return formValue.crewMembers;
  }

  public removeCrewMember(index: number): void {
    this.formGroupControls.crewMembers.removeAt(index);
  }

  public addCrewMember(): void {
    this.formGroupControls.crewMembers.push(
      this.createFormArrayControl('crewMembers', {
        firstName: '',
        lastName: '',
      }),
    );
  }

  // following method is not required and return by default a simple FormControl
  // if needed, you can use the `createFormArrayControl` hook to customize the creation
  // of your `FormControl`s that will be added to the `FormArray`
  public createFormArrayControl(
    key: ArrayPropertyKey<CrewMembersForm> | undefined,
    value: ArrayPropertyValue<CrewMembersForm>,
  ): FormControl {
    switch (key) {
      // note: the following string is type safe based on your form properties!
      case 'crewMembers':
        return new FormControl(value, [Validators.required]);
      default:
        return new FormControl(value);
    }
  }
}
```

Then our view will look like the following:

```html
<!-- src/app/main/listing/listing-form/vehicle-listing/crew-members/crew-members.component.html#L1-L26 -->

<fieldset [formGroup]="formGroup" class="container">
  <legend>Crew members form</legend>

  <div
    class="crew-member"
    [formArrayName]="formControlNames.crewMembers"
    *ngFor="let crewMember of formGroupControls.crewMembers.controls; let i = index"
  >
    <app-crew-member [formControl]="crewMember"></app-crew-member>

    <button mat-mini-fab color="primary" (click)="removeCrewMember(i)" [disabled]="formGroup.disabled">
      <mat-icon>delete</mat-icon>
    </button>
  </div>

  <button
    mat-raised-button
    data-btn-add-crew-member
    color="primary"
    class="add-crew-member"
    (click)="addCrewMember()"
    [disabled]="formGroup.disabled"
  >
    Add a crew member
  </button>
</fieldset>
```

The `app-crew-member` component is a simple `NgxSubFormComponent` as you can imagine:

```ts
// src/app/main/listing/listing-form/vehicle-listing/crew-members/crew-member/crew-member.component.ts#L6-L19

@Component({
  selector: 'app-crew-member',
  templateUrl: './crew-member.component.html',
  styleUrls: ['./crew-member.component.scss'],
  providers: subformComponentProviders(CrewMemberComponent),
})
export class CrewMemberComponent extends NgxSubFormComponent<CrewMember> {
  protected getFormControls(): Controls<CrewMember> {
    return {
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
    };
  }
}
```

### Helpers

- `onFormUpdate` hook: Allows you to react whenever the form is being modified. Instead of subscribing to `this.formGroup.valueChanges` or `this.formControls.someProp.valueChanges` you will not have to deal with anything asynchronous nor have to worry about subscriptions and memory leaks. Just implement the method `onFormUpdate(formUpdate: FormUpdate<FormInterface>): void` and if you need to know which property changed do a check like the following: `if (formUpdate.yourProperty) {}`. Be aware that this method will be called only when there are either local changes to the form or changes coming from subforms. If the parent `setValue` or `patchValue` this method won't be triggered
- `getFormGroupControlOptions` hook: Allows you to define control options for construction of the internal FormGroup. Use this to define form-level validators
- `createFormArrayControl` hook: Allows you to create the `FormControl` of a given property of your form (to define validators for example). When you want to use this hook, implement the following interface `NgxFormWithArrayControls`
- `handleEmissionRate` hook: Allows you to define a custom emission rate (top level or any sub level)

e.g.

```ts
// src/readme/password-sub-form.component.ts#L5-L39

interface PasswordForm {
  password: string;
  passwordRepeat: string;
}

@Component({
  selector: 'app-password-sub-form',
  templateUrl: './password-sub-form.component.html',
  styleUrls: ['./password-sub-form.component.scss'],
  providers: subformComponentProviders(PasswordSubFormComponent),
})
class PasswordSubFormComponent extends NgxSubFormComponent<PasswordForm> {
  protected getFormControls() {
    return {
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      passwordRepeat: new FormControl(null, Validators.required),
    };
  }

  public getFormGroupControlOptions(): FormGroupOptions<PasswordForm> {
    return {
      validators: [
        formGroup => {
          if (formGroup.value.password !== formGroup.value.passwordRepeat) {
            return {
              passwordsMustMatch: true,
            };
          }

          return null;
        },
      ],
    };
  }
}
```

Errors are exposed under the key `errors.formGroup` e.g.

```html
<!-- src/readme/password-sub-form.component.html -->

<input type="text" placeholder="Password" [formControlName]="formControlNames.password" />
<mat-error *ngIf="formControlErrors?.password?.minlength">Password too short</mat-error>

<input type="text" placeholder="Repeat Password" [formControlName]="formControlNames.passwordRepeat" />
<mat-error *ngIf="formControlErrors?.formGroup?.passwordsMustMatch">Passwords do not match</mat-error>
```

## Be aware of

There's currently a weird behavior ~~[issue (?)](https://github.com/angular/angular/issues/18004)~~ when checking for form validity.  
CF that [issue](https://github.com/angular/angular/issues/18004) and that [comment](https://github.com/angular/angular/issues/18004#issuecomment-328806479).  
It is also detailed into [`listing.component.html`](https://github.com/cloudnc/ngx-sub-form/blob/master/src/app/main/listing/listing.component.html).

## Contribution

Please, feel free to contribute to `ngx-sub-form`.  
We've done our best to come up with a solution that helped us and our **own** needs when dealing with forms. But we might have forgotten some use cases that might be worth implementing in the core or the lib rather than on every project.  
Remember that contributing doesn't necessarily mean to make a pull request, you can raise an issue, edit the documentation (readme), etc.
