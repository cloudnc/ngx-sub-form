# NgxSubForm

![ngx-sub-form logo](https://user-images.githubusercontent.com/4950209/53812385-45f48900-3f53-11e9-8687-b57cd335f26e.png)

Utility library to improve the robustness of your Angular forms.

Whether you have simple and tiny forms or huge and complex ones, `ngx-sub-form` will help you build a solid base for them.

- 🗜️ Tiny bundle  
  _(currently ~30kb as we support both the old api and the new one but soon to be ~15kb!)_
- ✅ Simple API: No angular module to setup, no inheritance, no boilerplate. Only one function to create all your forms!
- 🤖 Adds type safety to your forms
- ✂️ Lets you break down huge forms into smaller ones for simplicity and reusability

_Please note one thing: If your goal is to generate forms dynamically (based on some JSON configuration for example) `ngx-sub-form` is not here for that!_

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

Quick overlook at the API before explaining in details further on:

![basic-api-usage](https://user-images.githubusercontent.com/4950209/102610857-2f222500-412e-11eb-86b5-135a7e96b3f1.png)

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
On the other hand, if your project is using `ngx-sub-form` with the inheritance API please read the following.

TODO

# Principles

As simple as forms can look when they only have a few fields, their complexity can increase quite fast. In order to keep your code as simple as possible and isolate the different concepts, **we do recommend to write forms in complete isolation from the rest of your app**.

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
You can encapsulate them and never deal `patchValue` or `setValue` to update the form nor subscribe to `valueChanges` to listen to the updates.

Instead, you'll be able to create a dedicated form component and pass data using an input, receive updates using an output. Just like you would for a dumb component.

Let's have a look with a very simple workflow:

- Imagine an application with a list of people and when you click on one of them you can edit the person details
- A smart component is aware of the currently selected person
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
- A `disabled$` stream to know whether we should disable the whole form or not
- An `input$` stream which is the data we'll use to update the form
- An `output$` stream, which would usually be our `EventEmitter` so that a parent component can listen to the form update through an output
- The `formControls`, which is exactly what you'd pass when creating a `FormGroup`

One thing to note: The `createForm` function takes a generic which will let us type our form. In this case, if you forgot to pass a property of the form in the `formControls` for example it'd be caught at build time by Typescript.

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

This is simply a way of binding an input to an observable. We do this because the `createForm` function requires us to pass an `input$` stream and a `disabled$` one. Hopefully Angular lets us one day access inputs as observables natively.

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

Our `createForm` function will return an object of type `NgxSubForm`. It means we'll then have access to the following properties or functions:

- `formGroup`: The `FormGroup` instance
- `formControlNames`: A typed object containing our form control names. The advantage of using this instead of a simple string is in case you ever update the type passed as the generic of the form _(refactor, change in the API upstream, etc)_. If you remove or update an existing property and forget to update the template, Typescript will catch the error _(assuming you're using AoT which is the case by default)_
- `formGroupErrors`: An object holding all the errors in the form. Bonus point: It also includes the errors of the sub forms!
- `createFormArrayControl`: TODO
- `controlValue`: If you want to access the form value, just use `form.formGroup.value`. If you want to know what's the latest

## Sub forms

## Remap
