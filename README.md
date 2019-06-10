# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library for breaking down a form into multiple components.  
Works well with polymorphic data structures.

`ngx-sub-form` is here to help you **avoid** passing your `formGroup` as inputs and tackle down the boilerplate of creating a custom [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor).

[![npm version](https://badge.fury.io/js/ngx-sub-form.svg)](https://www.npmjs.com/package/ngx-sub-form)
[![Build Status](https://travis-ci.org/cloudnc/ngx-sub-form.svg?branch=master)](https://travis-ci.org/cloudnc/ngx-sub-form)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)

## Install

Install the [npm package](https://www.npmjs.com/package/ngx-sub-form): `ngx-sub-form`

## Demo

_Before we get started with how to use the library and give some examples, a complete demo is available on [this repo](https://github.com/cloudnc/ngx-sub-form), within the [`src`](https://github.com/cloudnc/ngx-sub-form/tree/master/src) folder.  
Demo is built around a concept of galactic sales. You can sell either Droids (Protocol, Medical, Astromech, Assassin) or Vehicles (Spaceship, Speeder).  
**This will also be used for the following examples**.  
If you want to see the demo in action, please visit [https://cloudnc.github.io/ngx-sub-form](https://cloudnc.github.io/ngx-sub-form)._

## Setup

`ngx-sub-form` only provides

- 2 classes: `NgxSubFormComponent`, `NgxSubFormRemapComponent`
- 2 interfaces: `Controls<T>`, `ControlsNames<T>`
- 1 function: `subformComponentProviders`

So there's nothing to setup (like a module), you can just use them directly.

## Usage

### When can I use `ngx-sub-form`?

- When you create a simple form, it'll give you better typings
- When you want to create a bigger form that you need to split up into sub components
- When dealing with polymorphic data that you want to display in a form

### Type safety you said?

When extending `NgxSubFormComponent` or `NgxSubFormRemapComponent` you'll have access to the following properties (within `.ts` **and** `.html`):

- `formGroup`: The actual form group, useful to define the binding `[formGroup]="formGroup"` into the view
- `formControlNames`: All the control names available in your form. Use it when defining a `formControlName` like that `<input [formControlName]="formControlNames.yourControl">`
- `formGroupControls`: All the controls of your form, helpful to avoid doing `formGroup.get(formControlNames.yourControl)`, instead just do `formGroupControls.yourControl`
- `formGroupValues`: Access all the values of your form directly without doing `formGroup.get(formControlNames.yourControl).value`, instead just do `formGroupValues.yourControl` (and it'll be correctly typed!)
- `formGroupErrors`: All the errors of the current form **including** the sub errors (if any), just use `formGroupErrors` or `formGroupErrors?.yourControl`. Notice the question mark in `formGroupErrors?.yourControl`, it **will return `null` if there's no error**

With AOT turned on you'll get proper type checking within your TS **and** HTML files. When refactoring your interfaces your form will error if a property should no longer be here or if one is missing.

### First component level

Within the component where the (top) form will be handled, you have to define the top level structure. You can do it manually as you'd usually do, but it's better to extend from `NgxSubFormComponent` as you'll get some type safety. If dealing with polymorphic data, **each type must have it's own form control**:  
(_even if it doesn't match your model, we'll talk about that later_)

```ts
enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

interface OneListingForm {
  title: string;
  price: number;

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
export class ListingComponent extends NgxSubFormComponent<OneListingForm> {
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

Then, within the `.component.html` we create a `select` tag to choose between the 2 types:

```html
<select [formControlName]="formControlNames.listingType">
  <option *ngFor="let listingType of ListingType | keyvalue" [value]="listingType.value">
    {{ listingType.value }}
  </option>
</select>
```

Now we need to create, based on the listing type, either a `DroidListingComponent` or a `VehicleListingComponent`:

```html
<form [formGroup]="formGroup">
  <div [ngSwitch]="formGroupValues.listingType">
    <app-droid-listing
      *ngSwitchCase="ListingType.DROID"
      [formControlName]="formControlNames.droidProduct"
    ></app-droid-listing>

    <app-vehicle-listing
      *ngSwitchCase="ListingType.VEHICLE"
      [formControlName]="formControlNames.vehicleProduct"
    ></app-vehicle-listing>
  </div>
</form>
```

One thing to notice above:

- `<app-droid-listing>` and `<app-vehicle-listing>` **are** custom `ControlValueAccessor`s and let us bind them to `formControlName` as we would with an input.

### Second component level

This is where `ngx-sub-form` is becoming (more) useful.  
All you have to do is:

1. Add required providers using the utility function `subformComponentProviders`:

```diff
+import { subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicle-listing',
  templateUrl: './vehicle-listing.component.html',
  styleUrls: ['./vehicle-listing.component.scss'],
+ providers: subformComponentProviders(VehicleListingComponent),
})
export class VehicleListingComponent {}
```

2. Make your original class extend `NgxSubFormComponent` **or** `NgxSubFormRemapComponent` if you need to remap the data (will be explained later):

```diff
+import { subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicle-listing',
  templateUrl: './vehicle-listing.component.html',
  styleUrls: ['./vehicle-listing.component.scss'],
+ providers: subformComponentProviders(VehicleListingComponent),
})
+export class VehicleListingComponent extends NgxSubFormComponent {}
```

Define the controls of your form (as we previously did in the top form component):

```ts
export class VehicleProductComponent extends NgxSubFormComponent<OneVehicleForm> {
  protected getFormControls(): Controls<VehicleListing> {
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

Example, take a look into [`VehicleProductComponent`](https://github.com/cloudnc/ngx-sub-form/blob/master/src/app/main/listing/vehicle-listing/vehicle-product.component.ts):

```ts
// merged few files together to make it easier to follow
export interface BaseVehicle {
  color: string;
  canFire: boolean;
  numberOfPeopleOnBoard: number;
}

export interface Spaceship extends BaseVehicle {
  vehicleType: VehicleType.SPACESHIP;
  numberOfWings: number;
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

For a complete example of this see `https://github.com/cloudnc/ngx-sub-form/blob/master/src/app/main/listing/vehicle-listing/vehicle-product.component.ts` (repeated below):

```ts
interface OneVehicleForm {
  speeder: Speeder;
  spaceship: Spaceship;
  vehicleType: VehicleType;
}

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent),
})
export class VehicleProductComponent extends NgxSubFormRemapComponent<OneVehicle, OneVehicleForm> {
  protected formControls: Controls<OneVehicleForm> = {
    speeder: new FormControl(null),
    spaceship: new FormControl(null),
    vehicleType: new FormControl(null, { validators: [Validators.required] }),
  };

  public VehicleType = VehicleType;

  protected transformToFormGroup(obj: OneVehicle): OneVehicleForm {
    return {
      speeder: obj.vehicleType === VehicleType.SPEEDER ? obj : null,
      spaceship: obj.vehicleType === VehicleType.SPACESHIP ? obj : null,
      vehicleType: obj.vehicleType,
    };
  }

  protected transformFromFormGroup(formValue: OneVehicleForm): OneVehicle {
    switch (formValue.vehicleType) {
      case VehicleType.SPEEDER:
        return formValue.speeder;
      case VehicleType.SPACESHIP:
        return formValue.spaceship;
    }
  }
}
```

Our "incoming" object is of type `OneVehicle` but into that component we treat it as a `OneVehicleForm` to split the vehicle (either a `speeder` or `spaceship`) in 2 **separated** properties.

### Helpers

- `onFormUpdate` hook: Allows you to react whenever the form is being modified. Instead of subscribing to `this.formGroup.valueChanges` or `this.formControls.someProp.valueChanges` you will not have to deal with anything asynchronous nor have to worry about subscriptions and memory leaks. Just implement the method `onFormUpdate(formUpdate: FormUpdate<FormInterface>): void` and if you need to know which property changed do a check like the following: `if (formUpdate.yourProperty) {}`. Be aware that this method will be called only when there are either local changes to the form or changes coming from subforms. If the parent `setValue` or `patchValue` this method won't be triggered
- `getFormGroupControlOptions` hook: Defines control options for construction of the internal FormGroup. Use this to define form-level validators

e.g.

```ts
interface PasswordForm {
  password: string;
  passwordRepeat: string;
}

class PasswordSubComponent extends NgxSubFormComponent<PasswordForm> {
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
