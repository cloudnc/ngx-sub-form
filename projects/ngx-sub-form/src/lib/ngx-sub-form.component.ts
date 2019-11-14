import { OnDestroy, OnInit } from '@angular/core';
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
import { merge, Observable, Subscription, Subject, pipe, BehaviorSubject } from 'rxjs';
import { delay, filter, map, startWith, withLatestFrom, shareReplay, tap, switchMap } from 'rxjs/operators';
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
import { FormGroupOptions, NgxFormWithArrayControls, OnFormUpdate, TypedFormGroup } from './ngx-sub-form.types';

type MapControlFunction<FormInterface, MapValue> = (ctrl: AbstractControl, key: keyof FormInterface) => MapValue;
type FilterControlFunction<FormInterface> = (ctrl: AbstractControl, key: keyof FormInterface) => boolean;

export abstract class NgxSubFormComponent<ControlInterface, FormInterface = ControlInterface>
  implements OnInit, ControlValueAccessor, Validator, OnDestroy, OnFormUpdate<FormInterface> {
  private ngOnInit$$: Subject<void> = new Subject();

  // if we try to call setDisabledState before `ngOnInit`
  // (and before the form is initialised, which might be the case for top RootForm*)
  // it won't be taken into account, therefore we use a Subject to only apply that once
  // the form is ready (after `ngOnInit`)
  private disabledState$$: BehaviorSubject<boolean | null> = new BehaviorSubject(null) as BehaviorSubject<
    boolean | null
  >;

  public get formGroupControls(): ControlsType<FormInterface> {
    // @note form-group-undefined we need the return null here because we do not want to expose the fact that
    // the form can be undefined, it's handled internally to contain an Angular bug
    if (!this.formGroup) {
      return null as any;
    }

    return this.formGroup.controls as ControlsType<FormInterface>;
  }

  public get formGroupValues(): Required<FormInterface> {
    // see @note form-group-undefined for non-null assertion reason
    // tslint:disable-next-line:no-non-null-assertion
    return this.mapControls(ctrl => ctrl.value)!;
  }

  public get formGroupErrors(): FormErrors<FormInterface> {
    const errors: FormErrors<FormInterface> = this.mapControls<ValidationErrors | ValidationErrors[] | null>(
      ctrl => ctrl.errors,
      ctrl => ctrl.invalid,
      true,
    ) as FormErrors<FormInterface>;

    if (!this.formGroup.errors && (!errors || !Object.keys(errors).length)) {
      return null;
    }

    return Object.assign({}, this.formGroup.errors ? { formGroup: this.formGroup.errors } : {}, errors);
  }

  public get formControlNames(): ControlsNames<FormInterface> {
    // see @note form-group-undefined for as syntax
    return this.mapControls((_, key) => key, () => true, false) as ControlsNames<FormInterface>;
  }

  private controlKeys: (keyof FormInterface)[] = [];

  // when developing the lib it's a good idea to set the formGroup type
  // to current + `| undefined` to catch a bunch of possible issues
  // see @note form-group-undefined
  // formGroup will only be defined after ngOnInit
  // otherwise it's impossible to access class properties
  // from the `getFormControls` method which is an issue with validators
  // see https://github.com/cloudnc/ngx-sub-form/issues/82
  public formGroup!: TypedFormGroup<FormInterface>;

  protected onChange: Function | undefined = undefined;
  protected onTouched: Function | undefined = undefined;
  protected emitNullOnDestroy = true;
  protected emitInitialValueOnInit = true;

  private readonly subscription: Subscription = new Subscription();

  constructor() {
    this.subscription.add(
      this.ngOnInit$$
        .pipe(
          switchMap(() =>
            this.disabledState$$.pipe(
              filter(x => !isNullOrUndefined(x)),
              delay(0),
              tap(shouldDisable => {
                if (shouldDisable) {
                  this.formGroup.disable({ emitEvent: false });
                } else {
                  this.formGroup.enable({ emitEvent: false });
                }
              }),
            ),
          ),
        )
        .subscribe(),
    );
  }

  public ngOnInit(): void {
    this.formGroup = (new FormGroup(
      this._getFormControls(),
      this.getFormGroupControlOptions() as AbstractControlOptions,
    ) as unknown) as TypedFormGroup<FormInterface>;

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
      }
    }, 0);

    this.ngOnInit$$.next();
  }

  // can't define them directly
  protected abstract getFormControls(): Controls<FormInterface>;
  private _getFormControls(): Controls<FormInterface> {
    const controls: Controls<FormInterface> = this.getFormControls();

    this.controlKeys = (Object.keys(controls) as unknown) as (keyof FormInterface)[];

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

    const formControls: Controls<FormInterface> = this.formGroup.controls;

    const controls: Partial<ControlMap<FormInterface, MapValue | MapValue[]>> = {};

    for (const key in formControls) {
      if (this.formGroup.controls.hasOwnProperty(key)) {
        const control = formControls[key];

        if (recursiveIfArray && control instanceof FormArray) {
          const values: MapValue[] = [];

          for (let i = 0; i < control.length; i++) {
            if (filterControl(control.at(i), key)) {
              values.push(mapControl(control.at(i), key));
            }
          }

          controls[key] = values;
        } else if (control && filterControl(control, key)) {
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

      this.formGroup.setValue(transformedValue, {
        emitEvent: false,
      });
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
            formArray.insert(i, this.createFormArrayControl(key as ArrayPropertyKey<FormInterface>, value[i]));
          } else {
            formArray.insert(i, new FormControl(value[i]));
          }
        }
      }
    });
  }

  private formIsFormWithArrayControls(): this is NgxFormWithArrayControls<FormInterface> {
    return typeof ((this as unknown) as NgxFormWithArrayControls<FormInterface>).createFormArrayControl === 'function';
  }

  private getMissingKeys(transformedValue: FormInterface | null) {
    // `controlKeys` can be an empty array, empty forms are allowed
    const missingKeys: (keyof FormInterface)[] = this.controlKeys.reduce(
      (keys, key) => {
        if (isNullOrUndefined(transformedValue) || transformedValue[key] === undefined) {
          keys.push(key);
        }

        return keys;
      },
      [] as (keyof FormInterface)[],
    );

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

    interface KeyValueForm {
      key: keyof FormInterface;
      value: unknown;
    }

    const formControlNames: (keyof FormInterface)[] = Object.keys(this.formControlNames) as (keyof FormInterface)[];

    const formValues: Observable<KeyValueForm>[] = formControlNames.map(key =>
      this.formGroup.controls[key].valueChanges.pipe(
        startWith(this.formGroup.controls[key].value),
        map(value => ({ key, value })),
      ),
    );

    const lastKeyEmitted$: Observable<keyof FormInterface> = merge(...formValues.map(obs => obs.pipe(map(x => x.key))));

    this.subscription.add(
      this.formGroup.valueChanges
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
        .subscribe(),
    );
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(shouldDisable: boolean | undefined): void {
    this.disabledState$$.next(shouldDisable as boolean);
  }
}

export abstract class NgxSubFormRemapComponent<ControlInterface, FormInterface> extends NgxSubFormComponent<
  ControlInterface,
  FormInterface
> {
  protected abstract transformToFormGroup(obj: ControlInterface | null): FormInterface | null;
  protected abstract transformFromFormGroup(formValue: FormInterface): ControlInterface | null;
}
