import { FormGroup, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { Controls, FormUpdate } from './ngx-sub-form-utils';

export interface OnFormUpdate<FormInterface> {
  onFormUpdate?: (formUpdate: FormUpdate<FormInterface>) => void;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

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
