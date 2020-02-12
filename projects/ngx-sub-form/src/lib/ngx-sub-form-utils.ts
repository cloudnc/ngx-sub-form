import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ValidationErrors,
  FormControl,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { InjectionToken, Type, forwardRef, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, debounce } from 'rxjs/operators';
import { SUB_FORM_COMPONENT_TOKEN } from './ngx-sub-form-tokens';
import { NgxSubFormComponent } from './ngx-sub-form.component';

export type Controls<T> = { [K in keyof T]-?: AbstractControl };

export type ControlsNames<T> = { [K in keyof T]-?: K };

export type ControlMap<T, V> = { [K in keyof T]-?: V };

export type ControlsType<T> = {
  [K in keyof T]-?: T[K] extends any[] ? TypedFormArray<T[K]> : TypedAbstractControl<T[K]>;
};
export type FormErrorsType<T> = {
  [K in keyof T]-?: T[K] extends any[] ? (null | ValidationErrors)[] : ValidationErrors;
};

export type FormUpdate<FormInterface> = { [FormControlInterface in keyof FormInterface]?: true };

export type FormErrors<FormInterface> = null | Partial<
  FormErrorsType<FormInterface> & {
    formGroup?: ValidationErrors;
  }
>;

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>; // can be removed when upgrading ts version
type UntypedControlBase<TControl extends AbstractControl | FormArray> = Omit<
  TControl,
  'value' | 'valueChanges' | 'setValue' | 'patchValue'
>;

export type TypedAbstractControl<TValue extends any> = {
  value: TValue;
  valueChanges: Observable<TValue>;
  setValue(
    value: TValue,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;
  patchValue(
    value: Partial<TValue>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;
} & UntypedControlBase<AbstractControl>;

export type TypedFormArray<TValue extends any> = TypedAbstractControl<TValue> & UntypedControlBase<FormArray>;

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
      useExisting: forwardRef(() => component),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => component),
      multi: true,
    },
    {
      provide: SUB_FORM_COMPONENT_TOKEN,
      useExisting: forwardRef(() => component),
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
 * Note that the component *must* implement OnDestroy for this to work (the typings will enforce this anyway)
 */
export function takeUntilDestroyed<T>(component: OnDestroy): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> => {
    const onDestroy = new Subject();
    const previousOnDestroy = component.ngOnDestroy;

    component.ngOnDestroy = () => {
      if (previousOnDestroy) {
        previousOnDestroy.apply(component);
      }

      onDestroy.next();
      onDestroy.complete();
    };

    return source.pipe(takeUntil(onDestroy));
  };
}

/** @internal */
export function isNullOrUndefined(obj: any): obj is null | undefined {
  return obj === null || obj === undefined;
}
