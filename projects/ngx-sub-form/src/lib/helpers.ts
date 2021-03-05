import { AbstractControlOptions, ControlValueAccessor, FormArray, FormGroup, ValidationErrors } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { Nilable } from 'tsdef';
import {
  ControlValueAccessorComponentInstance,
  FormBindings,
  NgxSubFormArrayOptions,
  NgxSubFormOptions,
} from './ngx-sub-form.types';
import {
  ArrayPropertyKey,
  ControlsNames,
  NewFormErrors,
  OneOfControlsTypes,
  TypedFormGroup,
} from './shared/ngx-sub-form-utils';

export const deepCopy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** @internal */
export const patchClassInstance = (componentInstance: any, obj: Object) => {
  Object.entries(obj).forEach(([key, newMethod]) => {
    componentInstance[key] = newMethod;
  });
};

/** @internal */
export const getControlValueAccessorBindings = <ControlInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
): FormBindings<ControlInterface> => {
  const writeValue$$: ReplaySubject<Nilable<ControlInterface>> = new ReplaySubject(1);
  const registerOnChange$$: ReplaySubject<(formValue: ControlInterface | null) => void> = new ReplaySubject(1);
  const registerOnTouched$$: ReplaySubject<(_: any) => void> = new ReplaySubject(1);
  const setDisabledState$$: ReplaySubject<boolean> = new ReplaySubject(1);

  const controlValueAccessorPatch: Required<ControlValueAccessor> = {
    writeValue: (obj: Nilable<any>): void => {
      writeValue$$.next(obj);
    },
    registerOnChange: (fn: (formValue: ControlInterface | null) => void): void => {
      registerOnChange$$.next(fn);
    },
    registerOnTouched: (fn: () => void): void => {
      registerOnTouched$$.next(fn);
    },
    setDisabledState: (shouldDisable: boolean | undefined): void => {
      setDisabledState$$.next(shouldDisable);
    },
  };

  patchClassInstance(componentInstance, controlValueAccessorPatch);

  return {
    writeValue$: writeValue$$.asObservable(),
    registerOnChange$: registerOnChange$$.asObservable(),
    registerOnTouched$: registerOnTouched$$.asObservable(),
    setDisabledState$: setDisabledState$$.asObservable(),
  };
};

export const getFormGroupErrors = <ControlInterface, FormInterface>(
  formGroup: TypedFormGroup<FormInterface>,
): NewFormErrors<FormInterface> => {
  const formErrors: NewFormErrors<ControlInterface> = Object.entries<OneOfControlsTypes>(formGroup.controls).reduce<
    Exclude<NewFormErrors<ControlInterface>, null>
  >((acc, [key, control]) => {
    if (control instanceof FormArray) {
      // errors within an array are represented as a map
      // with the index and the error
      // this way, we avoid holding a lot of potential `null`
      // values in the array for the valid form controls
      const errorsInArray: Record<number, ValidationErrors> = {};

      for (let i = 0; i < control.length; i++) {
        const controlErrors = control.at(i).errors;
        if (controlErrors) {
          errorsInArray[i] = controlErrors;
        }
      }

      if (Object.values(errorsInArray).length > 0) {
        const accHoldingArrays = acc as Record<keyof ControlInterface, Record<number, ValidationErrors>>;
        accHoldingArrays[key as keyof ControlInterface] = errorsInArray;
      }
    } else if (control.errors) {
      const accHoldingNonArrays = acc as Record<keyof ControlInterface, ValidationErrors>;
      accHoldingNonArrays[key as keyof ControlInterface] = control.errors;
    }

    return acc;
  }, {});

  if (!formGroup.errors && !Object.values(formErrors).length) {
    return null;
  }

  // todo remove any
  return Object.assign<any, any, any>({}, formGroup.errors ? { formGroup: formGroup.errors } : {}, formErrors);
};

interface FormArrayWrapper<FormInterface> {
  key: keyof FormInterface;
  control: FormArray;
}

export function createFormDataFromOptions<ControlInterface, FormInterface>(
  options: NgxSubFormOptions<ControlInterface, FormInterface>,
) {
  const formGroup: TypedFormGroup<FormInterface> = new FormGroup(
    options.formControls,
    options.formGroupOptions as AbstractControlOptions,
  ) as TypedFormGroup<FormInterface>;
  const defaultValues: FormInterface = deepCopy(formGroup.value);
  const formGroupKeys: (keyof FormInterface)[] = Object.keys(defaultValues) as (keyof FormInterface)[];
  const formControlNames: ControlsNames<FormInterface> = formGroupKeys.reduce<ControlsNames<FormInterface>>(
    (acc, curr) => {
      acc[curr] = curr;
      return acc;
    },
    {} as ControlsNames<FormInterface>,
  );

  const formArrays: FormArrayWrapper<FormInterface>[] = formGroupKeys.reduce<FormArrayWrapper<FormInterface>[]>(
    (acc, key) => {
      const control = formGroup.get(key as string);
      if (control instanceof FormArray) {
        acc.push({ key, control });
      }
      return acc;
    },
    [],
  );
  return { formGroup, defaultValues, formControlNames, formArrays };
}

export const handleFormArrays = <FormInterface>(
  formArrayWrappers: FormArrayWrapper<FormInterface>[],
  obj: FormInterface,
  createFormArrayControl: Required<NgxSubFormArrayOptions<FormInterface>>['createFormArrayControl'],
) => {
  if (!formArrayWrappers.length) {
    return;
  }

  formArrayWrappers.forEach(({ key, control }) => {
    const value = obj[key];

    if (!Array.isArray(value)) {
      return;
    }

    // instead of creating a new array every time and push a new FormControl
    // we just remove or add what is necessary so that:
    // - it is as efficient as possible and do not create unnecessary FormControl every time
    // - validators are not destroyed/created again and eventually fire again for no reason
    while (control.length > value.length) {
      control.removeAt(control.length - 1);
    }

    for (let i = control.length; i < value.length; i++) {
      control.insert(i, createFormArrayControl(key as ArrayPropertyKey<FormInterface>, value[i]));
    }
  });
};
