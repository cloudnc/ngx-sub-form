import { Input, OnDestroy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Controls, ControlsNames, getControlsNames } from './ngx-sub-form-utils';

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
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

  protected onChange: Function;
  protected onTouched: Function;

  private subscription: Subscription;

  @Input()
  public formControlName: string;

  public validate(ctrl: AbstractControl): ValidationErrors | null {
    // @hack see below where defining this.formGroup to null
    if (!this.formGroup || this.formGroup.valid || this.formGroup.pristine) {
      return null;
    }

    return { [this.formControlName]: true };
  }

  public ngOnDestroy(): void {
    // @hack there's a memory leak within Angular and those components
    // are not correctly cleaned up which leads to error if a form is defined
    // with validators and then it's been removed, the validator would still fail
    this.fg = null;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.onChange) {
      this.onChange(null);
    }
  }

  public writeValue(obj: any): void {
    if (obj) {
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
  protected transformToFormGroup(obj: ControlInterface): FormInterface {
    return (obj as any) as FormInterface;
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformFromFormGroup(formValue: FormInterface): ControlInterface {
    return (formValue as any) as ControlInterface;
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

export abstract class NgxSubFormRemapComponent<ControlInterface, FormInterface> extends NgxSubFormComponent<
  ControlInterface,
  FormInterface
> {
  protected abstract transformToFormGroup(obj: ControlInterface): FormInterface;
  protected abstract transformFromFormGroup(formValue: FormInterface): ControlInterface;
}
