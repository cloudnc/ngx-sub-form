import { Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Controls, ControlsNames, getControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
  public get formControlNames(): ControlsNames<FormInterface> {
    return getControlsNames(this.getFormControls());
  }

  public formGroup: FormGroup = new FormGroup(this.getFormControls());

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;

  private subscription: Subscription | undefined = undefined;

  @Input()
  public formControlName: string | undefined = undefined;

  // can't define them directly
  protected abstract getFormControls(): Controls<FormInterface>;

  public validate(): ValidationErrors | null {
    // @hack see below where defining this.formGroup to null
    if (
      !this.formGroup ||
      this.formGroup.valid ||
      this.formGroup.pristine ||
      // when using NgxSubForm on the top level component to get type checking and other utilities
      // but without binding it to a formControl, we might not have that value and thus, validate
      // should be null (should not happen at all)
      !this.formControlName
    ) {
      return null;
    }

    return { [this.formControlName]: true };
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
    this.onChange(this.transformFromFormGroup(this.formGroup.value));

    this.subscription = this.formGroup.valueChanges
      .pipe(
        // this is required otherwise an `ExpressionChangedAfterItHasBeenCheckedError` will happen
        // this is due to the fact that parent component will define a given state for the form that might
        // be changed once the children are being initialized
        delay(0),
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
