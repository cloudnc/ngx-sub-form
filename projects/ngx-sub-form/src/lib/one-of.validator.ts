import { AbstractControl } from '@angular/forms';
import { TypedFormGroup, TypedValidatorFn } from './ngx-sub-form.types';
import {
  isNullOrUndefined,
  OneOfValidatorRequiresMoreThanOneFieldError,
  OneOfValidatorUnknownFieldError,
} from './ngx-sub-form-utils';

export namespace NgxSubFormValidators {

  export function oneOf<FormInterface>(keysArray: Array<keyof FormInterface>, errorKey = 'oneOf'): TypedValidatorFn<FormInterface> {
    if (!keysArray || keysArray.length < 2) {
      throw new OneOfValidatorRequiresMoreThanOneFieldError();
    }

    return (formGroup: TypedFormGroup<FormInterface>) => {

      const notNullKeys: Array<keyof FormInterface> = keysArray.filter((key) => {
        const control: AbstractControl | null = formGroup.get(key as string);

        if (!control) {
          throw new OneOfValidatorUnknownFieldError(key as string);
        }

        return !isNullOrUndefined(control.value);
      });

      if (notNullKeys.length === 1) {
        return null;
      }

      return { [errorKey]: notNullKeys };
    }
  }

}
