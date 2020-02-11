import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { ArrayPropertyKey, ArrayPropertyValue, Controls, FormUpdate } from './ngx-sub-form-utils';

// @deprecated
export interface OnFormUpdate<FormInterface> {
  // @deprecated
  onFormUpdate?: (formUpdate: FormUpdate<FormInterface>) => void;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Nullable<T> = T | null;

export type NullableObject<T> = { [P in keyof T]: Nullable<T[P]> };

export type TypedFormGroup<FormInterface> = Omit<FormGroup, 'controls' | 'value'> & {
  controls: Controls<FormInterface>;
  value: FormInterface;
};

export type TypedValidatorFn<T> = (formGroup: TypedFormGroup<T>) => ValidationErrors | null;

export type TypedAsyncValidatorFn<T> = (
  formGroup: TypedFormGroup<T>,
) => Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;

export interface FormGroupOptions<T> {
  /**
   * @description
   * The list of validators applied to a control.
   */
  validators?: TypedValidatorFn<T> | TypedValidatorFn<T>[] | null;
  /**
   * @description
   * The list of async validators applied to control.
   */
  asyncValidators?: TypedAsyncValidatorFn<T> | TypedAsyncValidatorFn<T>[] | null;
  /**
   * @description
   * The event name for control to update upon.
   */
  updateOn?: 'change' | 'blur' | 'submit';
}

// Unfortunately due to https://github.com/microsoft/TypeScript/issues/13995#issuecomment-504664533 the initial value
// cannot be fully type narrowed to the exact type that will be passed.
export interface NgxFormWithArrayControls<T> {
  createFormArrayControl(key: ArrayPropertyKey<T>, value: ArrayPropertyValue<T>): FormControl;
}
