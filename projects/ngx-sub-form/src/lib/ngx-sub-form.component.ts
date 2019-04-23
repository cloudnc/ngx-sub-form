import { OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormGroup, ValidationErrors, Validator, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ControlMap, Controls, ControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
  public get formGroupControls(): ControlMap<FormInterface, AbstractControl> {
    // @note form-group-undefined we need the as syntax here because we do not want to expose the fact that
    // the form can be undefined, it's hanlded internally to contain an Angular bug
    return this.mapControls() as ControlMap<FormInterface, AbstractControl>;
  }

  public get formGroupValues(): Required<FormInterface> {
    // see @note form-group-undefined for as syntax
    return this.mapControls(ctrl => ctrl.value) as Required<FormInterface>;
  }

  public get formGroupErrors(): null | Partial<ControlMap<FormInterface, ValidationErrors | null>> {
    const errors = this.mapControls<ValidationErrors | null, ControlMap<FormInterface, ValidationErrors | null>>(
      ctrl => ctrl.errors,
      ctrl => ctrl.invalid,
    );

    if (!errors || !Object.keys(errors).length) {
      return null;
    }

    return errors;
  }

  public get formControlNames(): ControlsNames<FormInterface> {
    // see @note form-group-undefined for as syntax
    return this.mapControls((_, key) => key) as ControlsNames<FormInterface>;
  }

  // when developing the lib it's a good idea to set the formGroup type
  // to current + `| undefined` to catch a bunch of possible issues
  // see @note form-group-undefined
  public formGroup: FormGroup & { controls: Controls<FormInterface> } = new FormGroup(this.getFormControls()) as any;

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;
  protected emitNullOnDestroy = true;
  protected emitInitialValueOnInit = true;

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
      if (this.formGroup) {
        this.formGroup.updateValueAndValidity({ emitEvent: false });
      }
    }, 0);
  }

  private mapControls<MapValue, T extends ControlMap<FormInterface, MapValue>>(
    mapControl?: (ctrl: Controls<FormInterface>[keyof FormInterface], key: keyof FormInterface) => MapValue,
    filterControl: (ctrl: Controls<FormInterface>[keyof FormInterface]) => boolean = () => true,
  ): T | null {
    if (!this.formGroup) {
      return null;
    }

    const formControls: Controls<FormInterface> = this.formGroup.controls;

    if (!mapControl) {
      return formControls as any;
    }

    const controls: Partial<T> = {};

    for (const key in formControls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = formControls[key];
        if (control && filterControl(control)) {
          controls[key] = mapControl(control, key);
        }
      }
    }

    return controls as Required<T>;
  }

  public validate(): ValidationErrors | null {
    if (
      // @hack see where defining this.formGroup to undefined
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

    if (this.emitNullOnDestroy && this.onChange) {
      this.onChange(null);
    }

    this.onChange = undefined;
  }

  public writeValue(obj: Required<ControlInterface> | null): void {
    if (
      // @hack see where defining this.formGroup to undefined
      !this.formGroup ||
      // should accept falsy values like `false` or empty string
      obj === null ||
      obj === undefined
    ) {
      return;
    }

    this.formGroup.setValue(this.transformToFormGroup(obj), {
      emitEvent: false,
    });
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformToFormGroup(obj: ControlInterface): FormInterface {
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
    if (this.emitInitialValueOnInit) {
      setTimeout(() => {
        if (this.onChange && this.formGroup) {
          this.onChange(this.transformFromFormGroup(this.formGroup.value));
        }
      }, 0);
    }

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
