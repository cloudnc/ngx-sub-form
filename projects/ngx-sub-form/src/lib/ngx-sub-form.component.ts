import { OnDestroy, Directive, Component } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  ControlValueAccessor,
  FormGroup,
  ValidationErrors,
  Validator,
  FormArray,
  FormControl,
} from '@angular/forms';
import { merge, Observable, Subscription } from 'rxjs';
import { delay, filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import {
  ControlMap,
  Controls,
  ControlsNames,
  FormUpdate,
  MissingFormControlsError,
  FormErrors,
  isNullOrUndefined,
  ControlsType,
  ArrayPropertyKey,
} from './ngx-sub-form-utils';
import { FormGroupOptions, NgxFormWithArrayControls, TypedFormGroup } from './ngx-sub-form.types';

type MapControlFunction<FormInterface, MapValue> = (ctrl: AbstractControl, key: keyof FormInterface) => MapValue;
type FilterControlFunction<FormInterface> = (
  ctrl: AbstractControl,
  key: keyof FormInterface,
  isCtrlWithinFormArray: boolean,
) => boolean;

export interface MapFormData<ControlInterface, FormInterface> {
  transformToFormGroup(obj: ControlInterface | null, defaultValues: Partial<ControlInterface> | null): FormInterface | null
  transformFromFormGroup(formValue: FormInterface): ControlInterface | null
}

type DeriveFormInterface<T, C> = T extends MapFormData<C, infer F> ? F : C;
// type DeriveFormInterface<T> = T extends NgxSubFormComponent<infer C> ? T extends MapFormData<C, infer F> ? F : C : never;

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class NgxSubFormComponent<ControlInterface>
  implements ControlValueAccessor, Validator, OnDestroy {

  public get formGroupControls(): ControlsType<DeriveFormInterface<this, ControlInterface>> {
    // @note form-group-undefined we need the return null here because we do not want to expose the fact that
    // the form can be undefined, it's handled internally to contain an Angular bug
    if (!this.formGroup) {
      return null as any;
    }

    return this.formGroup.controls as ControlsType<DeriveFormInterface<this, ControlInterface>>;
  }

  public get formGroupValues(): Required<DeriveFormInterface<this, ControlInterface>> {
    // see @note form-group-undefined for non-null assertion reason
    // tslint:disable-next-line:no-non-null-assertion
    return this.mapControls(ctrl => ctrl.value)!;
  }

  public get formGroupErrors(): FormErrors<DeriveFormInterface<this, ControlInterface>> {
    const errors: FormErrors<DeriveFormInterface<this, ControlInterface>> = this.mapControls<ValidationErrors | ValidationErrors[] | null>(
      ctrl => ctrl.errors,
      (ctrl, _, isCtrlWithinFormArray) => (isCtrlWithinFormArray ? true : ctrl.invalid),
      true,
    ) as FormErrors<DeriveFormInterface<this, ControlInterface>>;

    if (!this.formGroup.errors && (!errors || !Object.keys(errors).length)) {
      return null;
    }

    return Object.assign({}, this.formGroup.errors ? { formGroup: this.formGroup.errors } : {}, errors);
  }

  public get formControlNames(): ControlsNames<DeriveFormInterface<this, ControlInterface>> {
    // see @note form-group-undefined for as syntax
    return this.mapControls(
      (_, key) => key,
      () => true,
      false,
    ) as ControlsNames<DeriveFormInterface<this, ControlInterface>>;
  }

  private controlKeys: (keyof DeriveFormInterface<this, ControlInterface>)[] = [];

  // when developing the lib it's a good idea to set the formGroup type
  // to current + `| undefined` to catch a bunch of possible issues
  // see @note form-group-undefined
  public formGroup: TypedFormGroup<DeriveFormInterface<this, ControlInterface>> = (new FormGroup(
    this._getFormControls(),
    this.getFormGroupControlOptions() as AbstractControlOptions,
  ) as unknown) as TypedFormGroup<DeriveFormInterface<this, ControlInterface>>;

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
    const defaultValues: Partial<DeriveFormInterface<this, ControlInterface>> | null = this.getDefaultValues();
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
  protected abstract getFormControls(): Controls<DeriveFormInterface<this, ControlInterface>>;
  private _getFormControls(): Controls<DeriveFormInterface<this, ControlInterface>> {
    const controls: Controls<DeriveFormInterface<this, ControlInterface>> = this.getFormControls();

    this.controlKeys = (Object.keys(controls) as unknown) as (keyof DeriveFormInterface<this, ControlInterface>)[];

    return controls;
  }

  private mapControls<MapValue>(
    mapControl: MapControlFunction<DeriveFormInterface<this, ControlInterface>, MapValue>,
    filterControl: FilterControlFunction<DeriveFormInterface<this, ControlInterface>>,
    recursiveIfArray: boolean,
  ): Partial<ControlMap<DeriveFormInterface<this, ControlInterface>, MapValue | MapValue[]>> | null;
  private mapControls<MapValue>(
    mapControl: MapControlFunction<DeriveFormInterface<this, ControlInterface>, MapValue>,
  ): ControlMap<DeriveFormInterface<this, ControlInterface>, MapValue | MapValue[]> | null;
  private mapControls<MapValue>(
    mapControl: MapControlFunction<DeriveFormInterface<this, ControlInterface>, MapValue>,
    filterControl: FilterControlFunction<DeriveFormInterface<this, ControlInterface>> = () => true,
    recursiveIfArray: boolean = true,
  ): Partial<ControlMap<DeriveFormInterface<this, ControlInterface>, MapValue | MapValue[]>> | null {
    if (!this.formGroup) {
      return null;
    }

    const formControls: Controls<DeriveFormInterface<this, ControlInterface>> = this.formGroup.controls;

    const controls: Partial<ControlMap<DeriveFormInterface<this, ControlInterface>, MapValue | MapValue[]>> = {};

    for (const key in formControls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = formControls[key];

        if (recursiveIfArray && control instanceof FormArray) {
          const values: MapValue[] = [];

          for (let i = 0; i < control.length; i++) {
            if (filterControl(control.at(i), key, true)) {
              values.push(mapControl(control.at(i), key));
            }
          }

          if (values.length > 0 && values.some(x => !isNullOrUndefined(x))) {
            controls[key] = values;
          }
        } else if (control && filterControl(control, key, false)) {
          controls[key] = mapControl(control, key);
        }
      }
    }

    return controls;
  }

  /**
   * Extend this method to provide custom local FormGroup level validation
   */
  protected getFormGroupControlOptions(): FormGroupOptions<DeriveFormInterface<this, ControlInterface>> {
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
  protected getDefaultValues(): Partial<DeriveFormInterface<this, ControlInterface>> | null {
    return null;
  }

  protected isMapped(): this is MapFormData<ControlInterface, DeriveFormInterface<this, ControlInterface>> {
    return 'transformToFormGroup' in this && 'transformFromFormGroup' in this;
  }

  public writeValue(obj: Required<ControlInterface> | null): void {
    // @hack see where defining this.formGroup to undefined
    if (!this.formGroup) {
      return;
    }

    const defaultValues: Partial<DeriveFormInterface<this, ControlInterface>> | null = this.getDefaultValues();

    const transformedValue: DeriveFormInterface<this, ControlInterface> | null = this.isMapped() ? this.transformToFormGroup(
      obj === undefined ? null : obj,
      defaultValues,
    ) : obj as unknown as DeriveFormInterface<this, ControlInterface>;

    if (isNullOrUndefined(transformedValue)) {
      this.formGroup.reset(
        // calling `reset` on a form with `null` throws an error but if nothing is passed
        // (undefined) it will reset all the form values to null (as expected)
        defaultValues === null ? undefined : defaultValues,
        { emitEvent: false },
      );
    } else {
      const missingKeys: (keyof DeriveFormInterface<this, ControlInterface>)[] = this.getMissingKeys(transformedValue);
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
      if (this.formGroup.get(key) instanceof FormArray && Array.isArray(value)) {
        const formArray: FormArray = this.formGroup.get(key) as FormArray;

        // instead of creating a new array every time and push a new FormControl
        // we just remove or add what is necessary so that:
        // - it is as efficient as possible and do not create unnecessary FormControl every time
        // - validators are not destroyed/created again and eventually fire again for no reason
        while (formArray.length > value.length) {
          formArray.removeAt(formArray.length - 1);
        }

        for (let i = formArray.length; i < value.length; i++) {
          if (this.formIsFormWithArrayControls()) {
            formArray.insert(i, this.createFormArrayControl(key as ArrayPropertyKey<DeriveFormInterface<this, ControlInterface>>, value[i]));
          } else {
            formArray.insert(i, new FormControl(value[i]));
          }
        }
      }
    });
  }

  private formIsFormWithArrayControls(): this is NgxFormWithArrayControls<DeriveFormInterface<this, ControlInterface>> {
    return typeof ((this as unknown) as NgxFormWithArrayControls<DeriveFormInterface<this, ControlInterface>>).createFormArrayControl === 'function';
  }

  private getMissingKeys(transformedValue: DeriveFormInterface<this, ControlInterface> | null) {
    // `controlKeys` can be an empty array, empty forms are allowed
    const missingKeys: (keyof DeriveFormInterface<this, ControlInterface>)[] = this.controlKeys.reduce((keys, key) => {
      if (isNullOrUndefined(transformedValue) || transformedValue[key] === undefined) {
        keys.push(key);
      }

      return keys;
    }, [] as (keyof DeriveFormInterface<this, ControlInterface>)[]);

    return missingKeys;
  }

  // when customizing the emission rate of your sub form component, remember not to **mutate** the stream
  // it is safe to throttle, debounce, delay, etc but using skip, first, last or mutating data inside
  // the stream will cause issues!
  protected handleEmissionRate(): (obs$: Observable<DeriveFormInterface<this, ControlInterface>>) => Observable<DeriveFormInterface<this, ControlInterface>> {
    return obs$ => obs$;
  }

  public registerOnChange(fn: (_: any) => void): void {
    if (!this.formGroup) {
      return;
    }

    this.onChange = fn;

    interface KeyValueForm {
      key: keyof DeriveFormInterface<this, ControlInterface>;
      value: unknown;
    }

    const formControlNames: (keyof DeriveFormInterface<this, ControlInterface>)[] = Object.keys(this.formControlNames) as (keyof DeriveFormInterface<this, ControlInterface>)[];

    const formValues: Observable<KeyValueForm>[] = formControlNames.map(key =>
      this.formGroup.controls[key].valueChanges.pipe(
        startWith(this.formGroup.controls[key].value),
        map(value => ({ key, value })),
      ),
    );


    const lastKeyEmitted$: Observable<KeyValueForm['key']> = merge(...formValues.map(obs => obs.pipe(map(x => x.key))));

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
                this.isMapped() ?
                this.transformFromFormGroup(
                  // do not use the changes passed by `this.formGroup.valueChanges` here
                  // as we've got a delay(0) above, on the next tick the form data might
                  // be outdated and might result into an inconsistent state where a form
                  // state is valid (base on latest value) but the previous value
                  // (the one passed by `this.formGroup.valueChanges` would be the previous one)
                  this.formGroup.value,
                ) : this.formGroup.value,
              );
            }
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

    if (shouldDisable) {
      this.formGroup.disable({ emitEvent: false });
    } else {
      this.formGroup.enable({ emitEvent: false });
    }
  }
}
