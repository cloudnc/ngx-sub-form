import { Input, OnDestroy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Controls, ControlsNames, getControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface> implements ControlValueAccessor, Validator, OnDestroy {
  protected formControls: Controls<FormInterface>;

  public get formControlNames(): ControlsNames<FormInterface> {
    return getControlsNames(this.formControls);
  }

  private fg: FormGroup;
  public get formGroup(): FormGroup {
    if (!this.fg) {
      this.fg = new FormGroup(this.formControls);
    }
    return this.fg;
  }

  // this should not be handled directly by the developer
  // instead, please use the provided directives
  public resetValueOnDestroy = true;

  protected onChange: Function;
  protected onTouched: Function;

  private subscription: Subscription;

  @Input()
  public formControlName: string;

  public validate(ctrl: AbstractControl): ValidationErrors | null {
    // @hack see bellow where defining this.formGroup to null
    if (!this.formGroup || this.formGroup.valid) {
      return null;
    }

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

  public ngOnDestroy(): void {
    // @hack there's a memory leak within Angular and those components
    // are not correctly cleaned up which leads to error if a form is defined
    // with validators and then it's been removed, the validator would still fail
    this.fg = null;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // if we're in the case of a form where we need to choose between different types
    // for ex with a switch case, we do not want to reset the value for the following reason
    // form is patched at the root level (result of an API call for example)
    // sub component handle what to display based on the type
    // type1 was displayed before but type2 has just been patched instead
    // component of type1 is being destroyed, and removing the new data we just patched into the form
    // to avoid that we provide directives which are setting `resetValueOnDestroy` to false when needed
    if (this.onChange && this.resetValueOnDestroy) {
      this.onChange(null);
    }
  }

  public writeValue(obj: any): void {
    if (obj) {
      if (!!this.formGroup) {
        this.formGroup.patchValue(this.transformToFormGroup(obj), {
          // required to be true otherwise it's not possible
          // to be warned when the form is updated
          emitEvent: true,
        });
      }
    } else {
      // @todo clear form?
    }
  }

  // ----------------------------------------------------
  // ----------------------------------------------------
  // ----------------------------------------------------
  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformToFormGroup(obj: ControlInterface): FormInterface {
    return obj as any as FormInterface;
  }

  // that method can be overriden if the
  // shape of the form needs to be modified
  protected transformFromFormGroup(formValue: FormInterface): ControlInterface {
    return formValue as any as ControlInterface;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;

    // this is required to correctly initialize the form value
    this.onChange(this.formGroup.value);

    this.subscription = this.formGroup.valueChanges
      .pipe(
        // this is required otherwise an `ExpressionChangedAfterItHasBeenCheckedError` will happen
        // this is due to the fact that parent component will define a given state for the form that might
        // be changed once the children are being initialized
        delay(0),
        tap(changes => {
          this.onTouched();
          this.onChange(this.transformFromFormGroup(changes));
        }),
      )
      .subscribe();
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

export abstract class NgxSubFormRemapComponent<ControlInterface, FormInterface> extends NgxSubFormComponent<ControlInterface, FormInterface> {
  protected abstract transformToFormGroup(obj: ControlInterface): FormInterface;
  protected abstract transformFromFormGroup(formValue: FormInterface): ControlInterface;
}


