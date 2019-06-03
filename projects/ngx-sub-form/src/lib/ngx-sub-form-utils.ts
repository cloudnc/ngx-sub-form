import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { InjectionToken, Type, forwardRef } from '@angular/core';
import { SUB_FORM_COMPONENT_TOKEN } from './ngx-sub-form-tokens';

export type Controls<T> = { [K in keyof T]-?: AbstractControl };

export type ControlsNames<T> = { [K in keyof T]-?: K };

export type ControlMap<T, V> = { [K in keyof T]-?: V };

export type FormUpdate<FormInterface> = { [FormControlInterface in keyof FormInterface]?: true };

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

export class ArrayNotTransformedBeforeWriteValueError<T extends string> extends Error {
  constructor() {
    super(
      `If you need to pass an array, please wrap it (for now) using "NgxSubFormRemapComponent" into an "array" property for example. Track direct array support here https://github.com/cloudnc/ngx-sub-form/issues/9`,
    );
  }
}

export class MissingFormControlsError<T extends string> extends Error {
  constructor(missingFormControls: T[]) {
    super(
      `Attempt to update the form value with an object that doesn't contains some of the required form control keys.\nMissing: ${missingFormControls
        .map(wrapAsQuote)
        .join(`, `)}`,
    );
  }
}
