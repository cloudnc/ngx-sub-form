import { Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Controls, ControlsNames, getControlsNames } from './ngx-sub-form-utils';

export class FormControlsRequiredError extends Error {
  message = `Passing the "formControls" is required to have NgxSubForm working`;
}

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {
  protected abstract formControls: Controls<FormInterface>;

  public get formControlNames(): ControlsNames<FormInterface> {
    return getControlsNames(this.formControls);
  }

  // flag to know whether the component has been destroyed or not because there's
  // currently a memory leak when using custom ControlValueAccessor
  private destroyed = false;

  private fg: FormGroup | undefined;

  public get formGroup(): FormGroup {
    if (this.destroyed) {
      // we do not want to type the formGroup as `FormGroup | undefined`
      // because it will require to handle that use case from every component (ts and html)
      // just to get the typings right, whereas we know formGroup will be defined when needed
      // and we're just trying to avoid the memory leak issue. This shouldn't affect the public API
      return undefined as any;
    }

    if (!this.formControls) {
      throw new FormControlsRequiredError();
    }

    if (!this.fg) {
      this.fg = new FormGroup(this.formControls);
    }

    return this.fg;
  }

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;

  private subscription: Subscription | undefined = undefined;

  @Input()
  public formControlName: string | undefined = undefined;

  public validate(): ValidationErrors | null {
    // @hack see below where defining this.formGroup to null
    if (
      !this.fg ||
      this.fg.valid ||
      this.fg.pristine ||
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
    this.destroyed = true;

    // @hack there's a memory leak within Angular and those components
    // are not correctly cleaned up which leads to error if a form is defined
    // with validators and then it's been removed, the validator would still fail
    this.fg = undefined;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.onChange) {
      this.onChange(null);
    }

    this.onChange = undefined;
  }

  public writeValue(obj: Required<ControlInterface>): void {
    // @note writeValue-and-form-group
    // using a getter for `formGroup` is slightly inneficient but really convenient for the consumer
    // so we should at least internally try to never call it directly and instead use `fg`
    // BUT, `writeValue` is one of the first hooks to be called (before registerOnChange and registerOnTouched for e.g.)
    // as the getter has a side effect of assigning `fg`, if we don't call it once at least the following condition `if (!!this.fg)`
    // will be false in certain case and sub-forms might not be initialized properly
    this.formGroup;

    // should accept falsy values like `false` or empty string
    if (obj !== null && obj !== undefined) {
      if (!!this.fg) {
        this.fg.setValue(this.transformToFormGroup(obj), {
          emitEvent: false,
        });

        this.fg.markAsPristine();
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
    // checking only fg would be enough but we need to initialize the getter
    // otherwise tests would require to manually make a call to `formGroup` and that
    // shouldn't be the case as it might be called manually and not reflect the reality of a component
    // see @note writeValue-and-form-group
    if (!this.formGroup || !this.fg) {
      return;
    }

    this.onChange = fn;

    // this is required to correctly initialize the form value
    this.onChange(this.transformFromFormGroup(this.fg.value));

    this.subscription = this.fg.valueChanges
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
