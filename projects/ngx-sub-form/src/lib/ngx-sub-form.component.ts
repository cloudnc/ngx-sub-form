import { OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormGroup, ValidationErrors, Validator, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Controls, ControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
  public get formGroupControls(): Controls<FormInterface> {
    return this.mapControls();
  }

  public get formGroupValues(): FormInterface {
    return this.mapControls(ctrl => ctrl.value);
  }

  public get formGroupErrors(): ValidationErrors {
    return this.mapControls(ctrl => ctrl.errors, ctrl => ctrl.invalid);
  }

  public get formControlNames(): ControlsNames<FormInterface> {
    return this.mapControls((_, key) => key);
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

  private mapControls(
    mapControl?: (ctrl: AbstractControl, key: string) => any,
    filterControl: (ctrl: AbstractControl) => boolean = () => true,
  ): any {
    const controls: any = {};

    for (const key in this.formGroup.controls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = this.formGroup.get(key);
        if (control && filterControl(control)) {
          controls[key] = mapControl ? mapControl(control, key) : control;
        }
      }
    }

    return controls;
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
    setTimeout(() => {
      if (this.onChange) {
        this.onChange(this.transformFromFormGroup(this.formGroup.value));
      }
    }, 0);

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
