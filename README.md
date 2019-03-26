# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library for breaking down a form into multiple components.  
Works well with polymorphic data structures.

`ngx-sub-form` is here to help you avoid passing your `formGroup` as inputs and tackle down the boilerplate of creating a custom [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor).

## Install

Install the [npm-package](https://www.npmjs.com/package/ngx-sub-form):

## Usage

_Before we get started with how to use the library and give some examples, a complete demo is available on [this repo](https://github.com/cloudnc/ngx-sub-form), within the `src` folder.  
Demo is built around a concept of galactic sales. You can sell either Droids (Protocol, Medical, Astromech, Assassin) or Vehicles (Spaceship, Speeder). This will also be used for the following examples_.

### First component level

Within the component where the form will be handled, we have to define the top level structure of the form, with _each
polymorphic type having it's own form control_

```ts
public listingForm: FormGroup = new FormGroup({
  droidListing: new FormControl(null, Validators.required),
  vehicleListing: new FormControl(null, Validators.required),
  listingType: new FormControl(null, Validators.required)
});
```

and give access to our `enum` from the component:

```ts
public ListingType = ListingType;
```

Just as a sidenote here, here's the `ListingType` enum:

```ts
export enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}
```

Then, within the `.component.html` we create a `select` tag to choose between the 2 types:

```html
<select formControlName="listingType">
  <option *ngFor="let listingType of ListingType | keyvalue" [value]="listingType.value">
    {{ listingType.value }}
  </option>
</select>
```

Now we need to create, based on the listing type, either a `DroidListingComponent` or a `VehicleListingComponent`:

```html
<form [formGroup]="listingForm">
  <div [ngSwitch]="listingForm.get(formControlNames.listingType).value">
    <app-droid-listing *ngSwitchCase="ListingType.DROID" formControlName="droidListing"></app-droid-listing>
    <app-vehicle-listing *ngSwitchCase="ListingType.VEHICLE" formControlName="vehicleListing"></app-vehicle-listing>
  </div>

  <button mat-raised-button (click)="upsertListing(listingForm.value)" [disabled]="listingForm.invalid">
    Upsert
  </button>
</form>
```

One thing to notice above:

- `formControlName="droidListing"` our sub form component **IS** a custom `ControlValueAccessor` and let us bind our component to a `formControlName` as we would with an input.

### Second component level

This is where `ngx-sub-form` is becoming useful. All you have to do is:

Add required providers using the utility function `subformComponentProviders`:

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

Make your original class extend `NgxSubFormComponent` _or_ `NgxSubFormRemapComponent` if you need to remap the data (see below):

```diff
-import { subformComponentProviders } from 'ngx-sub-form';
+import { subformComponentProviders, NgxSubFormComponent } from 'ngx-sub-form';

-export class VehicleListingComponent {}
+export class VehicleListingComponent extends NgxSubFormComponent {}
```

Define the controls of your form:

```ts
protected getFormControls(): Controls<VehicleListing> {
  return {
    id: new FormControl(this.uuidService.generate(), Validators.required),
    price: new FormControl(null, Validators.required),
  }
};
```

_Simplified from the original example into src folder to keep the example as minimal as possible._

As you know, [Angular reactive forms are not strongly typed](https://github.com/angular/angular/issues/13721). We're providing an interface (`Controls<T>`) to at least set the correct names within the form (but it will not help you when using `form.get('...').value`). It is still very useful and when making a refactor if your data structure changes and do not match the form structure Typescript compilation will fail.

The NgxFormComponent base class automatically extracts your form control names and exposes them as a public member on `formControlNames`

Then within the `.html`, you can reference them like so:

```html
<fieldset [formGroup]="formGroup" class="container">
  <input type="text" placeholder="ID" [formControlName]="formControlNames.id" />

  <input type="number" placeholder="Price" [formControlName]="formControlNames.price" />
</fieldset>
```

### Remapping Data

It is a frequent pattern to have the data that you're trying to modify in a format that is incovenient to the angular
forms structural constraints. For this reason, ngx-form-component offers a separate extended class `NgxSubFormRemapComponent`
which will require you to define two interfaces - one to model the data going in to the form (which will be applied
internally as `form.setValue()`), and the other to describe the interface of the value that will be set on the form.

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
