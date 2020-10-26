import { ControlValueAccessor, FormControl, Validator } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Nilable } from 'tsdef';
import {
  ArrayPropertyKey,
  ArrayPropertyValue,
  Controls,
  ControlsNames,
  NewFormErrors,
  OneOfControlsTypes,
  TypedFormGroup,
} from './shared/ngx-sub-form-utils';
import { FormGroupOptions } from './shared/ngx-sub-form.types';

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

export interface NgxSubForm<ControlInterface, FormInterface> {
  readonly formGroup: TypedFormGroup<FormInterface>;
  readonly formControlNames: ControlsNames<FormInterface>;
  readonly formGroupErrors: NewFormErrors<FormInterface>;
  readonly createFormArrayControl: CreateFormArrayControlMethod<FormInterface>;
  readonly controlValue$: Observable<Nilable<ControlInterface>>;
}

export type CreateFormArrayControlMethod<FormInterface> = <K extends ArrayPropertyKey<FormInterface>>(
  key: K,
  initialValue: ArrayPropertyValue<FormInterface, K>,
) => FormControl;

export interface NgxRootForm<ControlInterface, FormInterface> extends NgxSubForm<ControlInterface, FormInterface> {
  // @todo: anything else needed here?
}

export interface NgxSubFormArrayOptions<FormInterface> {
  createFormArrayControl?: CreateFormArrayControlMethod<FormInterface>;
}

export interface NgxSubFormRemapOptions<ControlInterface, FormInterface> {
  toFormGroup: (obj: ControlInterface) => FormInterface;
  fromFormGroup: (formValue: FormInterface) => ControlInterface;
}

export type AreTypesSimilar<T, U> = T extends U ? (U extends T ? true : false) : false;

// if the 2 types are the same, instead of hiding the remap options
// we expose them as optional so that it's possible for example to
// override some defaults
type NgxSubFormRemap<ControlInterface, FormInterface> = AreTypesSimilar<ControlInterface, FormInterface> extends true // we expose them
  ? Partial<NgxSubFormRemapOptions<ControlInterface, FormInterface>>
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
  // by default, a root form is considered as an automatic root form
  // if you want to transform it into a manual root form, provide the
  // following observable which trigger a save every time a value is emitted
  manualSave$?: Observable<void>;
  // @todo it should either be `manualSave$` OR `handleEmissionRate` OR none of them
  // if you're creating an automatic root form, you can customise the emission rate
  handleEmissionRate?: (obs$: Observable<FormInterface>) => Observable<FormInterface>;
};

export enum FormType {
  SUB = 'Sub',
  ROOT = 'Root',
}

export type NgxFormOptions<ControlInterface, FormInterface> =
  | NgxSubFormOptions<ControlInterface, FormInterface>
  | NgxRootFormOptions<ControlInterface, FormInterface>;
