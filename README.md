# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library for breaking down a form into multiple components.  
Works well with polymorphic data structures.

`ngx-sub-form` is here to help you avoid passing your `formGroup` as inputs and tackle down the boilerplate of creating a custom [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor).

## Install

Install the [npm-package](https://www.npmjs.com/package/ngx-row-accordion):

`yarn add ngx-sub-form`

## Setup

```diff
+ import { NgxSubFormModule } from 'ngx-sub-form';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
+   NgxSubFormModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Usage

_Before we get started with how to use the library and give some examples, a complete demo is available on [this repo](https://github.com/cloudnc/ngx-sub-form), within the `src` folder.  
Demo is built around a concept of galatic sales. You can sell either Droids (Protocol, Medical, Astromech, Assassin) or Vehicules (Spaceship, Speeder). This will also be used for the following examples_.

### First component level

Within the component where the form will be handled, we have to define the top level structure of the form (as you'd normally do).

```ts
public sellForm: FormGroup = new FormGroup({
  sell: new FormControl(null, { validators: [Validators.required] }),
});
```

Then we need to create a separated `FormControl` to select the sell's type:

```ts
public selectSellType: FormControl = new FormControl();
```

and give access to our `enum` from the component:

```ts
public SellType = SellType;
```

Just as a sidenote here, here's the `SellType` enum:

```ts
export enum SellType {
  VEHICULE = 'Vehicule',
  DROID = 'Droid',
}
```

Then, within the `.html` we create a `select` tag to choose between the 2 types:

```html
<select [formControl]="selectSellType">
  <option *ngFor="let sellType of SellType | keyvalue" [value]="sellType.value">
    {{ sellType.value }}
  </option>
</select>
```

Now we need to create, based on the sell's type, either a `DroidSellComponent` or a `VehiculeSellComponent`:

```html
<form [formGroup]="sellForm">
  <div [ngSwitch]="selectSellType.value" ngxSubFormOptions>
    <app-droid-sell *ngSwitchCase="SellType.DROID" ngxSubFormOption formControlName="sell"></app-droid-sell>

    <app-vehicule-sell *ngSwitchCase="SellType.VEHICULE" ngxSubFormOption formControlName="sell"></app-vehicule-sell>
  </div>

  <button mat-raised-button (click)="upsertSell(sellForm.get('sell').value)" [disabled]="sellForm.invalid">
    Upsert
  </button>
</form>
```

3 things to notice above:

- `ngxSubFormOptions` _(will explain later)_
- `ngxSubFormOption` _(will explain later)_
- `formControlName="sell"` our sub form component **IS** a custom `ControlValueAccessor` and let us bind our component to a `formControlName` as we would with an input.

### Second component level

This is where `ngx-sub-form` is becoming useful. All you have to do is:

Add required providers using the utility function `subformComponentProviders`:

```diff
+import { subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicule-sell',
  templateUrl: './vehicule-sell.component.html',
  styleUrls: ['./vehicule-sell.component.scss'],
+ providers: subformComponentProviders(VehiculeSellComponent),
})
export class VehiculeSellComponent {}
```

Make your original class extends `NgxSubFormComponent`:

```diff
-import { subformComponentProviders } from 'ngx-sub-form';
+import { subformComponentProviders, NgxSubFormComponent } from 'ngx-sub-form';

-export class VehiculeSellComponent {}
+export class VehiculeSellComponent extends NgxSubFormComponent {}
```

Define the controls of your form:

```ts
private controls: Controls<VehiculeSell> = {
  id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
  price: new FormControl(null, { validators: [Validators.required] }),
};

public formGroup: FormGroup = new FormGroup(this.controls);

public controlsNames: ControlsNames<VehiculeSell> = getControlsNames(this.controls);
```

_Simplified from the original example into src folder to keep the example as minimal as possible._

As you know, [Angular reactive forms are not strongly typed](https://github.com/angular/angular/issues/13721). We're providing an interface (`Controls<T>`) to at least set the correct names within the form (but it will not help you when using `form.get('...').value`). It is still very useful and when making a refactor if your data structure changes and do not match the form structure Typescript compilation will fail.

We also provide a utility function called `getControlsNames` which you can pass your `controls` to. This will let you define your `formControlName`s in the view in a safe way thanks to AoT. If you update your main interface, your form control but you forget about the view, you'll get an error.

Then within the `.html`:

```html
<fieldset [formGroup]="formGroup" class="container">
  <input type="text" placeholder="ID" [formControlName]="controlsNames.id" />

  <input type="number" placeholder="Price" [formControlName]="controlsNames.price" />
</fieldset>
```
