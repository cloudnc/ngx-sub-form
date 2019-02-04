import { forwardRef, InjectionToken, Input, OnDestroy, Type } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, startWith, tap } from 'rxjs/operators';

export function subformComponentProviders(
  component: any,
): {
  provide: InjectionToken<ControlValueAccessor>;
  useExisting: Type<any>;
  multi: boolean;
}[] {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => component),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => component),
      multi: true,
    },
  ];
}

export abstract class SubFormComponent implements ControlValueAccessor, Validator, OnDestroy {
  protected abstract formGroup: FormGroup;

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
    this.formGroup = null;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.onChange) {
      this.onChange(null);
    }
  }

  public writeValue(obj: any): void {
    if (obj) {
      this.formGroup.patchValue(this.transformBeforeWrite(obj), {
        // required to be true otherwise it's not possible
        // to be warned when the form is updated
        emitEvent: true,
      });
    } else {
      // @todo clear form?
    }
  }

  // ----------------------------------------------------
  // ----------------------------------------------------
  // ----------------------------------------------------
  // that method can be overriden if the
  // shape of the form needs to be modified
  protected transformBeforeWrite(obj: any): any {
    return obj;
  }

  // that method can be overriden if the
  // shape of the form needs to be modified
  protected transformBeforeOnChange(formValue: any): any {
    return formValue;
  }

  // ***********************************************************************
  // EX of use when an array is needed
  // protected formGroup = this.fb.group({ array: this.fb.array([]) });

  // protected transformBeforeWrite(obj: any): any {
  //   return { array: obj };
  // }

  // protected transformBeforeOnChange(formValue: any): any {
  //   return formValue.array;
  // }
  // ***********************************************************************
  // ----------------------------------------------------
  // ----------------------------------------------------
  // ----------------------------------------------------

  public registerOnChange(fn: any): void {
    this.onChange = fn;

    // this is required to correctly initialize the form value
    this.onChange(this.formGroup.value);

    this.subscription = this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        // without that delay 0 we might get an error
        // really annoying but couldn't come up with a better solution
        delay(0),
        tap(changes => {
          this.onTouched();
          this.onChange(this.transformBeforeOnChange(changes));
        }),
      )
      .subscribe();
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // setDisabledState(isDisabled: boolean): void {}
}
