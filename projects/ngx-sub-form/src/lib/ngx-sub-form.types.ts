import { ControlValueAccessor, UntypedFormControl, Validator } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Nilable } from 'tsdef';
import {
  ArrayPropertyKey,
  ArrayPropertyValue,
  Controls,
  ControlsNames,
  NewFormErrors,
  TypedFormGroup,
} from './shared/ngx-sub-form-utils';
import { FormGroupOptions } from './shared/ngx-sub-form.types';

export interface ComponentHooks {
  onDestroy: Observable<void>;
  afterViewInit: Observable<void>;
}

export interface FormBindings<ControlInterface> {
  readonly writeValue$: Observable<Nilable<ControlInterface>>;
  readonly registerOnChange$: Observable<(formValue: ControlInterface | null) => void>;
  readonly registerOnTouched$: Observable<() => void>;
  readonly setDisabledState$: Observable<boolean>;
}

export type ControlValueAccessorComponentInstance = Object &
  // ControlValueAccessor methods are called
  // directly by Angular and expects a value
  // so we have to define it within ngx-sub-form
  // and this should *never* be overridden by the component
  Partial<Record<keyof ControlValueAccessor, never> & Record<keyof Validator, never>>;

export interface NgxSubForm<ControlInterface, FormInterface extends {}> {
  readonly formGroup: TypedFormGroup<FormInterface>;
  readonly formControlNames: ControlsNames<FormInterface>;
  readonly formGroupErrors: NewFormErrors<FormInterface>;
  readonly createFormArrayControl: CreateFormArrayControlMethod<FormInterface>;
  readonly controlValue$: Observable<Nilable<ControlInterface>>;
}

export type CreateFormArrayControlMethod<FormInterface> = <K extends ArrayPropertyKey<FormInterface>>(
  key: K,
  initialValue: ArrayPropertyValue<FormInterface, K>,
) => UntypedFormControl;

export interface NgxRootForm<ControlInterface, FormInterface extends {}>
  extends NgxSubForm<ControlInterface, FormInterface> {
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

export type NgxSubFormOptions<
  ControlInterface,
  FormInterface extends {} = ControlInterface extends {} ? ControlInterface : never,
> = {
  formType: FormType;
  formControls: Controls<FormInterface>;
  formGroupOptions?: FormGroupOptions<FormInterface>;
  emitNullOnDestroy?: boolean;
  componentHooks?: ComponentHooks;
  // emit on this observable to mark the control as touched
  touched$?: Observable<void>;
} & NgxSubFormRemap<ControlInterface, FormInterface> &
  NgxSubFormArray<FormInterface>;

export type NgxRootFormOptions<
  ControlInterface,
  FormInterface extends {} = ControlInterface extends {} ? ControlInterface : never,
> = NgxSubFormOptions<ControlInterface, FormInterface> & {
  input$: Observable<ControlInterface | undefined>;
  output$: Subject<ControlInterface>;
  disabled$?: Observable<boolean>;
  // by default, a root form is considered as an automatic root form
  // if you want to transform it into a manual root form, provide the
  // following observable which trigger a save every time a value is emitted
  manualSave$?: Observable<void>;
  // The default behavior is to compare the current transformed value of input$ with the current value of the form, and
  // if these are equal emission on output$ is suppressed to prevent the from broadcasting the current value.
  // Configure this option to provide your own custom predicate whether or not the form should emit.
  outputFilterPredicate?: (currentInputValue: FormInterface, outputValue: FormInterface) => boolean;
  // if you want to control how frequently the form emits on the output$, you can customise the emission rate with this
  // option. e.g. `handleEmissionRate: formValue$ => formValue$.pipe(debounceTime(300)),`
  handleEmissionRate?: (obs$: Observable<FormInterface>) => Observable<FormInterface>;
  // Returns true if the transformed value of input$ equals the current value of the form
  isEqual$?: Subject<boolean>;
};

export enum FormType {
  SUB = 'Sub',
  ROOT = 'Root',
}

export type NgxFormOptions<ControlInterface, FormInterface extends {}> =
  | NgxSubFormOptions<ControlInterface, FormInterface>
  | NgxRootFormOptions<ControlInterface, FormInterface>;
