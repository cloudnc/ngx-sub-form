import { ControlValueAccessor, FormControl, Validator } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Nilable } from 'tsdef';
import {
  ArrayPropertyKey,
  ArrayPropertyValue,
  Controls,
  ControlsNames,
  NewFormErrors,
  TypedFormGroup,
} from '../ngx-sub-form-utils';
import { FormGroupOptions } from '../ngx-sub-form.types';
import { AreTypesSimilar } from './helpers.types';

export interface ComponentHooks {
  onDestroy: Observable<void>;
}

export interface FormBindings<ControlInterface> {
  readonly writeValue$: Observable<Nilable<ControlInterface>>;
  readonly registerOnChange$: Observable<(formValue: ControlInterface | null) => void>;
  readonly registerOnTouched$: Observable<(_: any) => void>;
  readonly setDisabledState$: Observable<boolean>;
}

export type ControlValueAccessorComponentInstance = Object &
  // ControlValueAccessor methods are called
  // directly by Angular and expects a value
  // so we have to define it within ngx-sub-form
  // and this should *never* be overridden by the component
  Partial<Record<keyof ControlValueAccessor, never> & Record<keyof Validator, never>>;

export interface NgxSubForm<FormInterface> {
  readonly formGroup: TypedFormGroup<FormInterface>;
  readonly formControlNames: ControlsNames<FormInterface>;
  readonly formGroupErrors: NewFormErrors<FormInterface>;
  readonly createFormArrayControl: any;
}

export interface NgxRootForm<ControlInterface> extends NgxSubForm<ControlInterface> {
  // @todo: anything else needed here?
}

export interface NgxSubFormArrayOptions<FormInterface> {
  createFormArrayControl?: (
    key: ArrayPropertyKey<FormInterface>,
    value: ArrayPropertyValue<FormInterface>,
  ) => FormControl;
}

export interface NgxSubFormRemapOptions<ControlInterface, FormInterface> {
  toFormGroup: (obj: ControlInterface) => FormInterface;
  fromFormGroup: (formValue: FormInterface) => ControlInterface;
}

type NgxSubFormRemap<ControlInterface, FormInterface> = AreTypesSimilar<ControlInterface, FormInterface> extends true
  ? {}
  : NgxSubFormRemapOptions<ControlInterface, FormInterface>;

type NgxSubFormArray<FormInterface> = ArrayPropertyKey<FormInterface> extends never
  ? {} // no point defining `createFormArrayControl` if there's not a single array in the `FormInterface`
  : NgxSubFormArrayOptions<FormInterface>;

export type NgxSubFormOptions<ControlInterface, FormInterface = ControlInterface> = {
  formType: FormType;
  formControls: Controls<FormInterface>;
  formGroupOptions?: FormGroupOptions<FormInterface>;
  emitNullOnDestroy?: boolean;
  componentHooks?: ComponentHooks;
} & NgxSubFormRemap<ControlInterface, FormInterface> &
  NgxSubFormArray<FormInterface>;

export type NgxRootFormOptions<ControlInterface, FormInterface = ControlInterface> = NgxSubFormOptions<
  ControlInterface,
  FormInterface
> & {
  disabled$: Observable<boolean>;
  input$: Observable<ControlInterface | undefined>;
  output$: Subject<ControlInterface>;
};

export enum FormType {
  SUB,
  ROOT,
}

export type NgxFormOptions<ControlInterface, FormInterface> =
  | NgxSubFormOptions<ControlInterface, FormInterface>
  | NgxRootFormOptions<ControlInterface, FormInterface>;
