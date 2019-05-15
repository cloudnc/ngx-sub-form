import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { InjectionToken, Type, forwardRef } from '@angular/core';
import { SUB_FORM_COMPONENT_TOKEN } from './ngx-sub-form-tokens';
import { NgxSubFormComponent, NgxSubFormRemapComponent } from './ngx-sub-form.component';

export type Controls<T> = { [K in keyof T]-?: AbstractControl };

export type ControlsNames<T> = { [K in keyof T]-?: K };

export type ControlMap<T, V> = { [K in keyof T]-?: V };

export interface FormChange<T> {
  isInitialValue: boolean;
  formValue: T;
}

export interface FormRemapChange<T, V> extends FormChange<T> {
  formRemapValue: V | null;
}

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

export function isNgxSubFormRemapComponent(
  currInstance: NgxSubFormComponent<any>,
): currInstance is NgxSubFormRemapComponent<any, any> {
  if (currInstance instanceof NgxSubFormRemapComponent) {
    return true;
  }

  return false;
}
