import { InjectionToken, Type } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, takeUntil } from 'rxjs/operators';
import { NgxSubFormComponent } from '../deprecated/ngx-sub-form.component';

export type Controls<T> = { [K in keyof T]-?: AbstractControl };

export type ControlsNames<T> = { [K in keyof T]-?: K };

export type ControlMap<T, V> = { [K in keyof T]-?: V };

export type ControlsType<T> = {
  [K in keyof T]-?: T[K] extends any[] ? TypedFormArray<T[K]> : TypedFormControl<T[K]> | TypedFormGroup<T[K]>;
};

export type OneOfControlsTypes<T = any> = ControlsType<T>[keyof ControlsType<T>];

/**
 * @deprecated
 */
export type FormErrorsType<T> = {
  [K in keyof T]-?: T[K] extends any[] ? (null | ValidationErrors)[] : ValidationErrors;
};

/**
 * @deprecated
 */
export type FormUpdate<FormInterface> = { [FormControlInterface in keyof FormInterface]?: true };

/**
 * @deprecated
 */
export type FormErrors<FormInterface> = null | Partial<
  FormErrorsType<FormInterface> & {
    formGroup?: ValidationErrors;
  }
>;

// @todo rename to `FormErrorsType` once the deprecated one is removed
export type NewFormErrorsType<T> = {
  [K in keyof T]-?: T[K] extends any[] ? Record<number, ValidationErrors> : ValidationErrors;
};

// @todo rename to `FormErrors` once the deprecated one is removed
export type NewFormErrors<FormInterface> = null | Partial<
  NewFormErrorsType<FormInterface> & {
    formGroup?: ValidationErrors;
  }
>;

// using set/patch value options signature from form controls to allow typing without additional casting
export interface TypedAbstractControl<TValue> extends AbstractControl {
  value: TValue;
  valueChanges: Observable<TValue>;
  setValue(value: TValue, options?: Parameters<AbstractControl['setValue']>[1]): void;
  patchValue(value: Partial<TValue>, options?: Parameters<AbstractControl['patchValue']>[1]): void;
}

export interface TypedFormGroup<TValue> extends FormGroup {
  value: TValue;
  valueChanges: Observable<TValue>;
  controls: ControlsType<TValue>;
  setValue(value: TValue, options?: Parameters<FormGroup['setValue']>[1]): void;
  patchValue(value: Partial<TValue>, options?: Parameters<FormGroup['patchValue']>[1]): void;
  getRawValue(): TValue;
}

export interface TypedFormArray<TValue extends any[]> extends FormArray {
  value: TValue;
  valueChanges: Observable<TValue>;
  controls: TypedAbstractControl<TValue[0]>[];
  setValue(value: TValue, options?: Parameters<FormArray['setValue']>[1]): void;
  patchValue(value: TValue, options?: Parameters<FormArray['patchValue']>[1]): void;
  getRawValue(): TValue;
}

export interface TypedFormControl<TValue> extends FormGroup {
  value: TValue;
  valueChanges: Observable<TValue>;
  setValue(value: TValue, options?: Parameters<FormControl['setValue']>[1]): void;
  patchValue(value: Partial<TValue>, options?: Parameters<FormControl['patchValue']>[1]): void;
}

export type KeysWithType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

export type ArrayPropertyKey<T> = KeysWithType<T, Array<any>>;

export type ArrayPropertyValue<T, K extends ArrayPropertyKey<T> = ArrayPropertyKey<T>> = T[K] extends Array<infer U>
  ? U
  : never;

export function subformComponentProviders(
  component: any,
): {
  provide: InjectionToken<ControlValueAccessor>;
  useExisting: Type<any>;
  multi?: boolean;
}[] {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: component,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: component,
      multi: true,
    },
  ];
}

const wrapAsQuote = (str: string): string => `"${str}"`;

export class MissingFormControlsError<T extends string> extends Error {
  constructor(missingFormControls: T[]) {
    super(
      `Attempt to update the form value with an object that doesn't contains some of the required form control keys.\nMissing: ${missingFormControls
        .map(wrapAsQuote)
        .join(`, `)}`,
    );
  }
}

export const NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES = {
  debounce: <T, U>(time: number): ReturnType<NgxSubFormComponent<T, U>['handleEmissionRate']> => obs =>
    obs.pipe(debounce(() => timer(time))),
};

/**
 * Easily unsubscribe from an observable stream by appending `takeUntilDestroyed(this)` to the observable pipe.
 * If the component already has a `ngOnDestroy` method defined, it will call this first.
 */
export function takeUntilDestroyed<T>(component: any): (source: Observable<T>) => Observable<T> {
  const { ngOnDestroy } = getObservableLifecycle(component);
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(ngOnDestroy));
}

/** @internal */
export function isNullOrUndefined(obj: any): obj is null | undefined {
  return obj === null || obj === undefined;
}
