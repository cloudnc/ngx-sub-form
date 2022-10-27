import { Directive, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  ControlValueAccessor,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { merge, Observable, Subscription } from 'rxjs';
import { delay, filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import {
  ArrayPropertyKey,
  ControlMap,
  Controls,
  ControlsNames,
  ControlsType,
  FormErrors,
  FormUpdate,
  isNullOrUndefined,
  MissingFormControlsError,
  TypedAbstractControl,
  TypedFormGroup,
} from '../shared/ngx-sub-form-utils';
import { FormGroupOptions, NgxFormWithArrayControls, OnFormUpdate } from '../shared/ngx-sub-form.types';

type MapControlFunction<FormInterface, MapValue> = (
  ctrl: TypedAbstractControl<any>,
  key: keyof FormInterface,
) => MapValue;
type FilterControlFunction<FormInterface> = (
  ctrl: TypedAbstractControl<any>,
  key: keyof FormInterface,
  isCtrlWithinFormArray: boolean,
) => boolean;

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
/**
 * @deprecated
 */
export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy, OnFormUpdate<FormInterface>
{
  public get formGroupControls(): ControlsType<FormInterface> {
    // @note form-group-undefined we need the return null here because we do not want to expose the fact that
    // the form can be undefined, it's handled internally to contain an Angular bug
    if (!this.formGroup) {
      return null as any;
    }

    return this.formGroup.controls as unknown as ControlsType<FormInterface>;
  }

  public get formGroupValues(): Required<FormInterface> {
    // see @note form-group-undefined for non-null assertion reason
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.mapControls(ctrl => ctrl.value)!;
  }

  public get formGroupErrors(): FormErrors<FormInterface> {
    const errors: FormErrors<FormInterface> = this.mapControls<ValidationErrors | ValidationErrors[] | null>(
      ctrl => ctrl.errors,
      (ctrl, _, isCtrlWithinFormArray) => (isCtrlWithinFormArray ? true : ctrl.invalid),
      true,
    ) as FormErrors<FormInterface>;

    if (!this.formGroup.errors && (!errors || !Object.keys(errors).length)) {
      return null;
    }

    return Object.assign({}, this.formGroup.errors ? { formGroup: this.formGroup.errors } : {}, errors);
  }

  public get formControlNames(): ControlsNames<FormInterface> {
    // see @note form-group-undefined for as syntax
    return this.mapControls(
      (_, key) => key,
      () => true,
      false,
    ) as ControlsNames<FormInterface>;
  }

  private controlKeys: (keyof FormInterface)[] = [];

  // when developing the lib it's a good idea to set the formGroup type
  // to current + `| undefined` to catch a bunch of possible issues
  // see @note form-group-undefined
  public formGroup: TypedFormGroup<FormInterface> = new UntypedFormGroup(
    this._getFormControls(),
    this.getFormGroupControlOptions() as AbstractControlOptions,
  ) as unknown as TypedFormGroup<FormInterface>;

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;
  protected emitNullOnDestroy = true;
  protected emitInitialValueOnInit = true;

  private subscription: Subscription | undefined = undefined;

  // a RootFormComponent with the disabled property set initially to `false`
  // will call `setDisabledState` *before* the form is actually available
  // and it wouldn't be disabled once available, therefore we use this flag
  // to check when the FormGroup is created if we should disable it
  private controlDisabled = false;

  constructor() {
    // if the form has default values, they should be applied straight away
    const defaultValues: Partial<FormInterface> | null = this.getDefaultValues();
    if (!!defaultValues) {
      this.formGroup.reset(defaultValues, { emitEvent: false });
    }

    // `setTimeout` and `updateValueAndValidity` are both required here
    // indeed, if you check the demo you'll notice that without it, if
    // you select `Droid` and `Assassin` for example the displayed errors
    // are not yet defined for the field `assassinDroid`
    // (until you change one of the value in that form)
    setTimeout(() => {
      if (this.formGroup) {
        this.formGroup.updateValueAndValidity({ emitEvent: false });

        if (this.controlDisabled) {
          this.formGroup.disable();
        }
      }
    }, 0);
  }

  // can't define them directly
  protected abstract getFormControls(): Controls<FormInterface>;
  private _getFormControls(): Controls<FormInterface> {
    const controls: Controls<FormInterface> = this.getFormControls();

    this.controlKeys = Object.keys(controls) as unknown as (keyof FormInterface)[];

    return controls;
  }

  private mapControls<MapValue>(
    mapControl: MapControlFunction<FormInterface, MapValue>,
    filterControl: FilterControlFunction<FormInterface>,
    recursiveIfArray: boolean,
  ): Partial<ControlMap<FormInterface, MapValue | MapValue[]>> | null;
  private mapControls<MapValue>(
    mapControl: MapControlFunction<FormInterface, MapValue>,
  ): ControlMap<FormInterface, MapValue | MapValue[]> | null;
  private mapControls<MapValue>(
    mapControl: MapControlFunction<FormInterface, MapValue>,
    filterControl: FilterControlFunction<FormInterface> = () => true,
    recursiveIfArray: boolean = true,
  ): Partial<ControlMap<FormInterface, MapValue | MapValue[]>> | null {
    if (!this.formGroup) {
      return null;
    }

    const formControls: ControlsType<FormInterface> = this.formGroup.controls;

    const controls: Partial<ControlMap<FormInterface, MapValue | MapValue[]>> = {};

    for (const key in formControls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = formControls[key];

        if (recursiveIfArray && control instanceof UntypedFormArray) {
          const values: MapValue[] = [];

          for (let i = 0; i < control.length; i++) {
            if (filterControl(control.at(i), key, true)) {
              values.push(mapControl(control.at(i), key));
            }
          }

          let value = undefined;
          if (control && filterControl(control, key, false)) {
            value = {
              ...mapControl(control, key)
            };
          }

          if (values.length > 0 && values.some(x => !isNullOrUndefined(x))) {
            value = {
              ...value,
              ...values
            }
          }
          controls[key] = value;
        } else if (control && filterControl(control, key, false)) {
          controls[key] = mapControl(control, key);
        }
      }
    }

    return controls;
  }

  public onFormUpdate(formUpdate: FormUpdate<FormInterface>): void {}

  /**
   * Extend this method to provide custom local FormGroup level validation
   */
  protected getFormGroupControlOptions(): FormGroupOptions<FormInterface> {
    return {};
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

  // @todo could this be removed to avoid an override and just use `takeUntilDestroyed`?
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

  // when getDefaultValues is defined, you do not need to specify the default values
  // in your form (the ones defined within the `getFormControls` method)
  protected getDefaultValues(): Partial<FormInterface> | null {
    return null;
  }

  public writeValue(obj: Required<ControlInterface> | null): void {
    // @hack see where defining this.formGroup to undefined
    if (!this.formGroup) {
      return;
    }

    const defaultValues: Partial<FormInterface> | null = this.getDefaultValues();

    const transformedValue: FormInterface | null = this.transformToFormGroup(
      obj === undefined ? null : obj,
      defaultValues,
    );

    if (isNullOrUndefined(transformedValue)) {
      this.formGroup.reset(
        // calling `reset` on a form with `null` throws an error but if nothing is passed
        // (undefined) it will reset all the form values to null (as expected)
        defaultValues === null ? undefined : defaultValues,
        { emitEvent: false },
      );
    } else {
      const missingKeys: (keyof FormInterface)[] = this.getMissingKeys(transformedValue);
      if (missingKeys.length > 0) {
        throw new MissingFormControlsError(missingKeys as string[]);
      }

      this.handleFormArrayControls(transformedValue);

      // The next few lines are weird but it's as workaround.
      // There are some shady behavior with the disabled state
      // of a form. Apparently, using `setValue` on a disabled
      // form does re-enable it *sometimes*, not always.
      // related issues:
      // https://github.com/angular/angular/issues/31506
      // https://github.com/angular/angular/issues/22556
      // but if you display `this.formGroup.disabled`
      // before and after the `setValue` is called, it's the same
      // result which is even weirder
      const fgDisabled: boolean = this.formGroup.disabled;

      this.formGroup.setValue(transformedValue, {
        emitEvent: false,
      });

      if (fgDisabled) {
        this.formGroup.disable();
      }
    }

    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  private handleFormArrayControls(obj: any) {
    Object.entries(obj).forEach(([key, value]) => {
      if (
        this.formGroup.get(key) instanceof UntypedFormArray &&
        Array.isArray(value)
      ) {
        const formArray: UntypedFormArray = this.formGroup.get(key) as UntypedFormArray;
        formArray.clear();
        this.addAdditionalObjects(formArray, value, key);
      }
    });
  }

  private addAdditionalObjects(
    formArray: UntypedFormArray,
    value: Array<any>,
    key: string
  ) {
    for (let i = formArray.length; i < value.length; i++) {
      const control = this.formIsFormWithArrayControls()
        ? this.createFormArrayControl(
          key as ArrayPropertyKey<FormInterface>,
          value[i]
        )
        : new UntypedFormControl(value[i]);
      formArray.insert(i, control);
    }
  }

  private formIsFormWithArrayControls(): this is NgxFormWithArrayControls<FormInterface> {
    return typeof (this as unknown as NgxFormWithArrayControls<FormInterface>).createFormArrayControl === 'function';
  }

  private getMissingKeys(transformedValue: FormInterface | null) {
    // `controlKeys` can be an empty array, empty forms are allowed
    const missingKeys: (keyof FormInterface)[] = this.controlKeys.reduce((keys, key) => {
      if (isNullOrUndefined(transformedValue) || transformedValue[key] === undefined) {
        keys.push(key);
      }

      return keys;
    }, [] as (keyof FormInterface)[]);

    return missingKeys;
  }

  // when customizing the emission rate of your sub form component, remember not to **mutate** the stream
  // it is safe to throttle, debounce, delay, etc but using skip, first, last or mutating data inside
  // the stream will cause issues!
  protected handleEmissionRate(): (obs$: Observable<FormInterface>) => Observable<FormInterface> {
    return obs$ => obs$;
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformToFormGroup(
    obj: ControlInterface | null,
    defaultValues: Partial<FormInterface> | null,
  ): FormInterface | null {
    return obj as any as FormInterface;
  }

  // that method can be overridden if the
  // shape of the form needs to be modified
  protected transformFromFormGroup(formValue: FormInterface): ControlInterface | null {
    return formValue as any as ControlInterface;
  }

  public registerOnChange(fn: (_: any) => void): void {
    if (!this.formGroup) {
      return;
    }

    this.onChange = fn;

    interface KeyValueForm {
      key: keyof FormInterface;
      value: unknown;
    }

    const formControlNames: (keyof FormInterface)[] = Object.keys(this.formControlNames) as (keyof FormInterface)[];

    const formValues: Observable<KeyValueForm>[] = formControlNames.map(key =>
      (this.formGroup.controls[key] as unknown as AbstractControl).valueChanges.pipe(
        startWith(this.formGroup.controls[key].value),
        map(value => ({ key, value })),
      ),
    );

    const lastKeyEmitted$: Observable<keyof FormInterface> = merge(...formValues.map(obs => obs.pipe(map(x => x.key))));

    this.subscription = this.formGroup.valueChanges
      .pipe(
        // hook to give access to the observable for sub-classes
        // this allow sub-classes (for example) to debounce, throttle, etc
        this.handleEmissionRate(),
        startWith(this.formGroup.value),
        // this is required otherwise an `ExpressionChangedAfterItHasBeenCheckedError` will happen
        // this is due to the fact that parent component will define a given state for the form that might
        // be changed once the children are being initialized
        delay(0),
        filter(() => !!this.formGroup),
        // detect which stream emitted last
        withLatestFrom(lastKeyEmitted$),
        map(([_, keyLastEmit], index) => {
          if (index > 0 && this.onTouched) {
            this.onTouched();
          }

          if (index > 0 || (index === 0 && this.emitInitialValueOnInit)) {
            if (this.onChange) {
              this.onChange(
                this.transformFromFormGroup(
                  // do not use the changes passed by `this.formGroup.valueChanges` here
                  // as we've got a delay(0) above, on the next tick the form data might
                  // be outdated and might result into an inconsistent state where a form
                  // state is valid (base on latest value) but the previous value
                  // (the one passed by `this.formGroup.valueChanges` would be the previous one)
                  this.formGroup.value,
                ),
              );
            }

            const formUpdate: FormUpdate<FormInterface> = {};
            formUpdate[keyLastEmit] = true;
            this.onFormUpdate(formUpdate);
          }
        }),
      )
      .subscribe();
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(shouldDisable: boolean | undefined): void {
    this.controlDisabled = !!shouldDisable;

    if (!this.formGroup) {
      return;
    }

    // We have to emit to update and validate the value and propagate it to the parent
    if (shouldDisable) {
      this.formGroup.disable({ emitEvent: true });
    } else {
      this.formGroup.enable({ emitEvent: true });
    }
  }
}

@Directive()
/**
 * @deprecated
 */
export abstract class NgxSubFormRemapComponent<ControlInterface, FormInterface> extends NgxSubFormComponent<
  ControlInterface,
  FormInterface
> {
  protected abstract transformToFormGroup(
    obj: ControlInterface | null,
    defaultValues: Partial<FormInterface> | null,
  ): FormInterface | null;
  protected abstract transformFromFormGroup(formValue: FormInterface): ControlInterface | null;
}
