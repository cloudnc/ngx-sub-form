import { OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Controls, ControlsNames, getControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
  public get formControlNames(): ControlsNames<FormInterface> {
    return getControlsNames(this.getFormControls());
  }

  public get formGroupErrors(): ValidationErrors {
    const errors: ValidationErrors = {};

    for (const key in this.formGroup.controls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = this.formGroup.controls[key];

        if (!control.valid) {
          errors[key] = control.errors;
        }
      }
    }

    return errors;
  }

  public formGroup: FormGroup = new FormGroup(this.getFormControls());

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;

  private subscription: Subscription | undefined = undefined;

  // can't define them directly
  protected abstract getFormControls(): Controls<FormInterface>;

  constructor() {
    // `setTimeout` and `updateValueAndValidity` are both required here
    // indeed, if you check the demo you'll notice that without it, if
    // you select `Droid` and `Assassin` for example the displayed errors
    // are not yet defined for the field `assassinDroid`
    // (until you change one of the value in that form)
    setTimeout(() => {
      this.formGroup.updateValueAndValidity({ emitEvent: false });
    }, 0);
  }

  public validate(): ValidationErrors | null {
    if (
      // @hack see below where defining this.formGroup to null
      !this.formGroup ||
      this.formGroup.valid
    ) {
      return null;
    }

    return this.formGroupErrors;
  }

  public ngOnDestroy(): void {
    // @hack there's a memory leak within Angular and those components
    // are not correctly cleaned up which leads to error if a form is defined
    // with validators and then it's been removed, the validator would still fail
    // `as any` if because we do not want to define the formGroup as FormGroup | undefined
    // everything related to undefined is handled internally and shouldn't be exposed to end user
    (this.formGroup as any) = undefined;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.onChange) {
      this.onChange(null);
    }

    this.onChange = undefined;
  }

  public writeValue(obj: Required<ControlInterface> | null): void {
    // should accept falsy values like `false` or empty string
    if (obj !== null && obj !== undefined) {
      if (!!this.formGroup) {
        this.formGroup.setValue(this.transformToFormGroup(obj), {
          emitEvent: false,
        });
        this.formGroup.markAsPristine();
        this.formGroup.markAsUntouched();
      }
    } else {
      // @todo clear form?
    }
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformToFormGroup(obj: ControlInterface | null): FormInterface {
    return (obj as any) as FormInterface;
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformFromFormGroup(formValue: FormInterface): ControlInterface | null {
    return (formValue as any) as ControlInterface;
  }

  public registerOnChange(fn: (_: any) => void): void {
    if (!this.formGroup) {
      return;
    }

    this.onChange = fn;

    // this is required to correctly initialize the form value
    // see note on-change-after-one-tick within the test file for more info
    // it makes sense to have it on the next tick and  without delay when the formGroup
    // changes because otherwise it's breaking the one way data flow (and we've got an error expression has changed...):
    // parent creates a sub form, it does call `registerOnChange`, we trigger a change because the ouput might not match
    // the input (if implementing `transformToFormGroup`/`transformFromFormGroup`), value on the parent will be updated
    setTimeout(() => {
      if (this.onChange) {
        this.onChange(this.transformFromFormGroup(this.formGroup.value));
      }
    }, 0);

    this.subscription = this.formGroup.valueChanges
      .pipe(
        // note: we do not want to use startWith here
        // because we've got to handle the first onChange alone
        // into an async way (CF huge comment above) and without
        // calling `onTouched` nor `onChange`
        tap(changes => {
          if (this.onTouched) {
            this.onTouched();
          }

          if (this.onChange) {
            this.onChange(this.transformFromFormGroup(changes));
          }
        }),
      )
      .subscribe();
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

export abstract class NgxSubFormRemapComponent<ControlInterface, FormInterface> extends NgxSubFormComponent<
  ControlInterface,
  FormInterface
> {
  protected abstract transformToFormGroup(obj: ControlInterface | null): FormInterface;
  protected abstract transformFromFormGroup(formValue: FormInterface): ControlInterface | null;
}
