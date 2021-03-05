# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library to improve the robustness of your Angular forms.

Whether you have simple and tiny forms or huge and complex ones, `ngx-sub-form` will help you build a solid base for them.

- 🗜️ Tiny bundle  
  _(currently ~30kb as we support both the old api and the new one but soon to be ~15kb!)_
- ✅ Simple API: No angular module to setup, no inheritance, no boilerplate. Only one function to create all your forms!
- 🤖 Adds type safety to your forms
- ✂️ Lets you break down huge forms into smaller ones for simplicity and reusability

_Please note one thing: If your goal is to generate forms dynamically (based on some JSON configuration for example) `ngx-sub-form` is **not** here for that!_

# Table of content

- [Basic API usage](#basic-api-usage)
- [Setup](#setup)
- [Migration guide to the new API](#migration-guide-to-the-new-api)
- [Principles](#principles)
  - [Root forms](#root-forms)
  - [Sub forms](#sub-forms)
  - [Remap](#remap)
- [How does `ngx-sub-form` works under the hood?](#how-does-ngx-sub-form-works-under-the-hood)

# Basic API usage

As a picture is often worth a 1000 words, let's take a quick overlook at the API before explaining in details further on:

![basic-api-usage](https://user-images.githubusercontent.com/4950209/110140660-9cac2c00-7dd4-11eb-8dc1-421089c5c016.png)

# Setup

`ngx-sub-form` is available on [NPM](https://www.npmjs.com/package/ngx-sub-form):

```
npm i ngx-sub-form
```

**Note about the versions:**

| `@angular` version | `ngx-sub-form` version |
| ------------------ | ---------------------- |
| <= `7`             | <= `2.7.1`             |
| `8.x`              | `4.x`                  |
| `9.x` or `10.x`    | `5.1.2`                |
| >= `11.x`          | `6.0.0`                |

The major bump from version `5.1.2` to `6.0.0` doesn't bring any changes to the public API of `ngx-sub-form`.  
It's only a major bump for Angular 11 support and you should be able to upgrade without having to update any of your forms.

That said, the version `6.0.0` also brings some exiting news!  
We sneaked into that release a [complete rewrite of ngx-sub-form to get rid of inheritance](https://github.com/cloudnc/ngx-sub-form/issues/171) 🎉. The best part being: **It's been done in a non breaking way to guarantee a smooth upgrade, which can be done incrementally, one form at a time, from the old API to the new one**.

The old API has been marked as deprecated and will be removed in a few months as part of a major version bump, to give you time to upgrade.

# Migration guide to the new API

If your project is not using `ngx-sub-form` yet, feel free to skip this migration guide.  
On the other hand, **if your project is using `ngx-sub-form` with the inheritance API please expand and read the following**.

High level explanation:

- On the public API, the required changes are mostly moving things around as none of the core concepts have changed
- Depending on how much forms you have, this may be a long and boring task as we don't have any schematics to make those changes automatically for you
- On the bright side, it should be a fairly easy task in terms of complexity
- You should be able to make the upgrade **incrementally** as well _(form after form if you want to instead of a big bang rewrite!)_. This is because behind the scenes the root and sub forms communicate through the `ControlValueAccessor` interface and as this one is from Angular and didn't change, it should be fine updating one form at a time

The simplest thing to understand the new syntax is probably to have a look on the [basic API usage](#basic-api-usage) example which covers most of the cases. But let's describe a step by step approach how to update your forms:

- `createForm` is the new function to create both your root and sub forms. It's very similar in terms of configuration to all the attributes and methods that you needed to implement after extending from `NgxRootFormComponent` or `NgxSubFormComponent`
- The first parameter that you should be providing in the configuration object of `createForm` is `formType` which can be either `FormType.ROOT` or `FormType.SUB`
- Then, you can provide the following ones for a sub form:

  - `formControls`
  - `emitNullOnDestroy` (optional)
  - `formGroupOptions` (optional)
  - `toFormGroup` (optional: If you have only 1 interface, required if you passed a second type to define a remap)
  - `fromFormGroup` (optional: If you have only 1 interface, required if you passed a second type to define a remap)

- And for a root form you can **additionally** provide the following ones:

  - `input$`
  - `output$`
  - `disabled$`
  - `manualSave$` (optional)
  - `handleEmissionRate` (optional)

Most of the attributes and methods have the same name as they had before so it shouldn't be too much of a trouble to move from a class approach with attributes and methods to a configuration object.

On the template side, assuming that you've saved the return of the `createForm` in a `form` variable:

- `formGroupControls` will now be `form.formGroup.controls`
- `formGroupValues` will now be `form.formGroup.value`

We're exposing the original `formGroup` object but it has been augmented on the type level by making it a `TypedFormGroup<FormInterface>` which provides type safety on a bunch of attributes and methods (`value`, `valueChanges`, `controls`, `setValue`, `patchValue`, `getRawValue`). See the `TypedFormGroup` interface in `projects/ngx-sub-form/src/lib/shared/ngx-sub-form-utils.ts` if you want to know more. As a result of this, we now don't need to provide `formGroupControls` nor `formGroupValues` for type safety.

Previously, `transformToFormGroup` _(which is now as you guessed it `toFormGroup`)_ was taking as the first parameter `obj: ControlInterface | null` and as a second one `defaultValues: Partial<FormInterface> | null`. This was pretty annoying as you needed to define a `getDefaultValues` method to provide your default values. Now you simply define your default values within the `formControls` function on each of the form controls as you'd expect. Behind the scenes, when the component is created for the first time we make a deep copy of those default values and apply them automatically if the root form or the sub form is being updated upstream with `null` or `undefined`.

If you were previously using inheritance to set some defaults globally, for example on your root forms for the `handleEmissionRate` method, you cannot do that anymore and you'll need to define those on a per component basis! So if you were extending your own class, itself inheriting from a root form or a sub form, don't forget about that. We're considering passing a token through DI to be able to set some of those settings globally. But it's not done yet and give us feedback if you think it should.

For root forms, the helper `DataInput` has been removed. It is now by default slightly more verbose to get the input data as you have to declare a `Subject` and push values into it yourself (by using either a setter on your input or the `ngOnChanges` hook). `DataInput` was originally created to reduce this boilerplate but as there are plenty of libraries available to transform an input into an observable, we let the choice to either do it manually or install a library on your side to transform the input into an observable for you.

You can also have a look into our demo app located here: `src/app`. You'll find `main` and `main-rewrite` which are exactly the same applications but `main` is using the deprecated API (the one with inheritance) while `main-rewrite` is using the new one. As those 2 applications showcase all the features of ngx-sub-form you can easily find what you're looking for and compare both if we forgot to cover anything. Just as an FYI, we've kept both apps for now which are tested by the same E2E test suite to make sure that nothing got broken on the old API during the rewrite. When we decide to remove the old API we'll of course remove the demo implementation which is using the old API.

# Principles

As simple as forms can look when they only have a few fields, their complexity can increase quite quickly. In order to keep your code as simple as possible and isolate the different concepts, **we do recommend to write forms in complete isolation from the rest of your app**.

In order to do so, you can create some top level forms that we call "**root forms**". As one form can become bigger and bigger over time, we also help by letting you create "**sub forms**" _(without the pain of dealing manually with a [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor)!)_. Lets dig into their specificities, how they differ and how to use them.

<!-- ## For every form

Before we explain any further, here's how any form would look:

```ts
@Component({
  selector: 'person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
})
export class PersonFormComponent {
  public form = createForm<Person>(this, {
    // ...
    formControls: {
      name: new FormControl(null, Validators.required),
      age: new FormControl(null, Validators.required),
    },
  });
}
``` -->

## Root forms

Root forms let you isolate a form from the rest of your app.  
You can encapsulate them and never deal with `patchValue` or `setValue` to update the form nor subscribe to `valueChanges` to listen to the updates.

Instead, you'll be able to create a dedicated **form component and pass data using an input, receive updates using an output**. Just like you would for a dumb component.

Let's have a look with a very simple workflow:

- Imagine an application with a list of people and when you click on one of them you can edit the person details
- A smart component is aware of the currently selected person (our _"container component"_)
- A root form component lets us display the data we retrieved in a form and also edit them

In this scenario, the smart component could look like the following:

```ts
@Component({
  selector: 'person-container',
  template: `
    <person-form [person]="person$ | async" (personUpdate)="personUpdate($event)"></person-form>
  `,
})
export class PersonContainer {
  public person$: Observable<Person> = this.personService.person$;

  constructor(private personService: PersonService) {}

  public personUpdate(person: Person): void {
    this.personService.update(person);
  }
}
```

This component is only responsible to get the correct data and manage updates _(if any)_. It completely delegates to the root form:

- How the data will be displayed to the user
- How the user will interact with them

Now let's talk about the actual **root form**:

```ts
@Component({
  selector: 'person-form',
  template: `
    <form [formGroup]="form.formGroup">
      <input type="text" [formControlName]="form.formControlNames.firstName" />
      <input type="text" [formControlName]="form.formControlNames.lastName" />
      <address-control [formControlName]="form.formControlNames.address"></address-control>
    </form>
  `,
})
export class PersonForm {
  private input$: Subject<Person | undefined> = new Subject();
  @Input() set person(person: Person | undefined) {
    this.input$.next(person);
  }

  private disabled$: Subject<boolean> = new Subject();
  @Input() set disabled(value: boolean | undefined) {
    this.disabled$.next(!!value);
  }

  @Output() personUpdate: Subject<Person> = new Subject();

  public form = createForm<Person>(this, {
    formType: FormType.ROOT,
    disabled$: this.disabled$,
    input$: this.input$,
    output$: this.personUpdate,
    formControls: {
      id: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
    },
  });
}
```

We'll go through the example above bit by bit.

```ts
public form = createForm<Person>(this, {
  formType: FormType.ROOT,
  disabled$: this.disabled$,
  input$: this.input$,
  output$: this.personUpdate,
  formControls: {
    id: new FormControl(null, Validators.required),
    firstName: new FormControl(null, Validators.required),
    lastName: new FormControl(null, Validators.required),
    address: new FormControl(null, Validators.required),
  },
});
```

This is what we provide to create a form with `ngx-sub-form`:

- A type _(either `FormType.ROOT` or `FormType.SUB`)_
- A `disabled$` stream to know whether we should disable the whole form or not _(including all the sub forms as well)_
- An `input$` stream which is the data we'll use to update the form
- An `output$` stream, which would usually be our `EventEmitter` so that a parent component can listen to the form update through an output
- The `formControls`, which is exactly what you'd pass when creating a `FormGroup`

One thing to note: The `createForm` function takes a generic which will let you **type our form**. In this case, if you forgot to pass a property of the form in the `formControls` it'd be caught at build time by Typescript.

```ts
private input$: Subject<Person | undefined> = new Subject();
@Input() set person(person: Person | undefined) {
  this.input$.next(person);
}

private disabled$: Subject<boolean> = new Subject();
@Input() set disabled(value: boolean | undefined) {
  this.disabled$.next(!!value);
}
```

This is simply a way of binding an input to an observable. We do this because the `createForm` function requires us to pass an `input$` stream and a `disabled$` one. Hopefully Angular lets us one day access [inputs as observables natively](https://github.com/angular/angular/issues/5689). In the meantime if you want to reduce this boilerplate even further, you can search on NPM for libraries which are doing this already. It's not as good as what Angular could do if it was built in, but it's still useful.

```ts
@Output() personUpdate: Subject<Person> = new Subject();
```

This is an `Output`. It could be an `EventEmitter` if you prefer a "classic" way of creating an output but really all we need is a `Subject` so that internally, the `createForm` function is able to push the form value whenever it's been updated.

Finally, our template:

```html
<form [formGroup]="form.formGroup">
  <input type="text" [formControlName]="form.formControlNames.firstName" />
  <input type="text" [formControlName]="form.formControlNames.lastName" />
  <address-control [formControlName]="form.formControlNames.address"></address-control>
</form>
```

Our `createForm` function will return an object of type `NgxRootForm`. It means we'll then have access to the following properties:

- **`formGroup`**: The `FormGroup` instance with augmented capacity for type safety. While at runtime this object is really the form group itself, it is now defined as a `TypedFormGroup<FormInterface>` which provides type safety on a bunch of attributes and methods (`value`, `valueChanges`, `controls`, `setValue`, `patchValue`, `getRawValue`). If you want to know more about the `TypedFormGroup` interface, have a look in `projects/ngx-sub-form/src/lib/shared/ngx-sub-form-utils.ts`
- **`formControlNames`**: A typed object containing our form control names. The advantage of using this instead of a simple string is in case you ever update the type passed as the generic of the form _(through a refactor or a change in the API upstream, etc)_. If you remove or update an existing property and forget to update the template, Typescript will catch the error _(assuming you're using AoT which is the case by default)_
- **`formGroupErrors`**: An object holding all the errors in the form. Bonus point: It also includes all the nested errors from the sub forms!
- **`controlValue$`**: If you want to listen to the form value, just use `form.formGroup.valueChanges`. But keep in mind that it will not be triggered when the form is being updated by the parent ⚠️. It'll only be triggered when the form is changed locally. If you want to know what's the latest form value from either the parent OR the local changes, you should use `form.controlValue$` instead
- **`createFormArrayControl`**: We'll cover this one in the [remap](#remap) section, after the sub forms

## Sub forms

When you've got a form represented by an object containing not one level of info but multiple ones _(like a person which has an address, the address contains itself multiple fields)_, you should create a sub form to manage the address in isolation.

This is great for multiple reasons:

- You can break down the complexity of your forms into smaller components
- You can reuse sub forms into other sub forms and root forms. It becomes easy to compose different bits of sub forms to create a bigger one
- You can

## Remap
