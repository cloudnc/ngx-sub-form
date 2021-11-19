import { ɵmarkDirty as markDirty } from '@angular/core';
import { FormControl } from '@angular/forms';
import isEqual from 'fast-deep-equal';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { combineLatest, concat, defer, EMPTY, forkJoin, identity, merge, Observable, of, timer } from 'rxjs';
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  finalize,
  ignoreElements,
  map,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  createFormDataFromOptions,
  getControlValueAccessorBindings,
  getFormGroupErrors,
  handleFormArrays,
  patchClassInstance,
} from './helpers';
import {
  ComponentHooks,
  ControlValueAccessorComponentInstance,
  FormBindings,
  FormType,
  NgxFormOptions,
  NgxRootForm,
  NgxRootFormOptions,
  NgxSubForm,
  NgxSubFormArrayOptions,
  NgxSubFormOptions,
} from './ngx-sub-form.types';
import { isNullOrUndefined } from './shared/ngx-sub-form-utils';

const optionsHaveInstructionsToCreateArrays = <ControlInterface, FormInterface>(
  options: NgxFormOptions<ControlInterface, FormInterface> & Partial<NgxSubFormArrayOptions<FormInterface>>,
): options is NgxSubFormOptions<ControlInterface, FormInterface> & NgxSubFormArrayOptions<FormInterface> =>
  !!options.createFormArrayControl;

// @todo find a better name
const isRoot = <ControlInterface, FormInterface>(
  options: any,
): options is NgxRootFormOptions<ControlInterface, FormInterface> => {
  const opt = options as NgxRootFormOptions<ControlInterface, FormInterface>;
  return opt.formType === FormType.ROOT;
};

export function createForm<ControlInterface, FormInterface = ControlInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
  options: NgxRootFormOptions<ControlInterface, FormInterface>,
): NgxRootForm<ControlInterface, FormInterface>;
export function createForm<ControlInterface, FormInterface = ControlInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
  options: NgxSubFormOptions<ControlInterface, FormInterface>,
): NgxSubForm<ControlInterface, FormInterface>;
export function createForm<ControlInterface, FormInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
  options: NgxFormOptions<ControlInterface, FormInterface>,
): NgxSubForm<ControlInterface, FormInterface> {
  const { formGroup, defaultValues, formControlNames, formArrays } = createFormDataFromOptions<
    ControlInterface,
    FormInterface
  >(options);

  let isRemoved = false;

  const lifecyleHooks: ComponentHooks = options.componentHooks ?? {
    onDestroy: getObservableLifecycle(componentInstance).ngOnDestroy,
    afterViewInit: getObservableLifecycle(componentInstance).ngAfterViewInit,
  };

  lifecyleHooks.onDestroy.pipe(take(1)).subscribe(() => {
    isRemoved = true;
  });

  // define the `validate` method to improve errors
  // and support nested errors
  patchClassInstance(componentInstance, {
    validate: () => {
      if (isRemoved) return null;

      if (formGroup.valid) {
        return null;
      }

      return getFormGroupErrors<ControlInterface, FormInterface>(formGroup);
    },
  });

  // in order to ensure the form has the correct state (and validation errors) we update the value and validity
  // immediately after the first tick
  const updateValueAndValidity$ = timer(0);

  const componentHooks = getControlValueAccessorBindings<ControlInterface>(componentInstance);

  const writeValue$: FormBindings<ControlInterface>['writeValue$'] = isRoot<ControlInterface, FormInterface>(options)
    ? options.input$.pipe(
        // we need to start with a value here otherwise if a root form does not bind
        // its input (and only uses an output, for example a filter) then
        // `broadcastValueToParent$` would never start and we would never get updates
        startWith(null),
      )
    : componentHooks.writeValue$;

  const registerOnChange$: FormBindings<ControlInterface>['registerOnChange$'] = isRoot<
    ControlInterface,
    FormInterface
  >(options)
    ? of(data => {
        if (!data) {
          return;
        }
        options.output$.next(data);
      })
    : componentHooks.registerOnChange$;

  const setDisabledState$: FormBindings<ControlInterface>['setDisabledState$'] = isRoot<
    ControlInterface,
    FormInterface
  >(options)
    ? options.disabled$ ?? of(false)
    : componentHooks.setDisabledState$;

  const transformedValue$: Observable<FormInterface> = writeValue$.pipe(
    map(value => {
      if (isNullOrUndefined(value)) {
        return defaultValues;
      }

      if (options.toFormGroup) {
        return options.toFormGroup(value);
      }

      // if it's not a remap component, the ControlInterface === the FormInterface
      return (value as any) as FormInterface;
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  const broadcastValueToParent$: Observable<ControlInterface> = transformedValue$.pipe(
    switchMap(transformedValue => {
      if (!isRoot<ControlInterface, FormInterface>(options)) {
        return formGroup.valueChanges.pipe(delay(0));
      } else {
        const formValues$ = options.manualSave$
          ? options.manualSave$.pipe(
              withLatestFrom(formGroup.valueChanges),
              map(([_, formValue]) => formValue),
            )
          : formGroup.valueChanges;

        // it might be surprising to see formGroup validity being checked twice
        // here, however this is intentional. The delay(0) allows any sub form
        // components to populate values into the form, and it is possible for
        // the form to be invalid after this process. In which case we suppress
        // outputting an invalid value, and wait for the user to make the value
        // become valid.
        return formValues$.pipe(
          filter(() => formGroup.valid),
          delay(0),
          filter(formValue => {
            if (formGroup.invalid) {
              return false;
            }

            if (options.outputFilterPredicate) {
              return options.outputFilterPredicate(transformedValue, formValue);
            }

            return !isEqual(transformedValue, formValue);
          }),
          options.handleEmissionRate ?? identity,
        );
      }
    }),
    map(value =>
      options.fromFormGroup
        ? options.fromFormGroup(value)
        : // if it's not a remap component, the ControlInterface === the FormInterface
          ((value as any) as ControlInterface),
    ),
  );

  // components often need to know what the current value of the FormControl that it is representing is, usually for
  // display purposes in the template. This value is the composition of the value written from the parent, and the
  // transformed current value that was most recently written to the parent
  const controlValue$: NgxSubForm<ControlInterface, FormInterface>['controlValue$'] = merge(
    writeValue$,
    broadcastValueToParent$,
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  const emitNullOnDestroy$: Observable<null> =
    // emit null when destroyed by default
    isNullOrUndefined(options.emitNullOnDestroy) || options.emitNullOnDestroy
      ? lifecyleHooks.onDestroy.pipe(mapTo(null))
      : EMPTY;

  const createFormArrayControl: Required<NgxSubFormArrayOptions<FormInterface>>['createFormArrayControl'] =
    optionsHaveInstructionsToCreateArrays<ControlInterface, FormInterface>(options) && options.createFormArrayControl
      ? options.createFormArrayControl
      : (key, initialValue) => new FormControl(initialValue);

  const sideEffects = {
    broadcastValueToParent$: registerOnChange$.pipe(
      switchMap(onChange => broadcastValueToParent$.pipe(tap(value => onChange(value)))),
    ),
    applyUpstreamUpdateOnLocalForm$: transformedValue$.pipe(
      tap(value => {
        handleFormArrays<FormInterface>(formArrays, value, createFormArrayControl);

        formGroup.reset(value, { emitEvent: false });
      }),
    ),
    supportChangeDetectionStrategyOnPush: concat(
      lifecyleHooks.afterViewInit.pipe(take(1)),
      merge(controlValue$, setDisabledState$).pipe(
        delay(0),
        tap(() => {
          // support `changeDetection: ChangeDetectionStrategy.OnPush`
          // on the component hosting a form
          // fixes https://github.com/cloudnc/ngx-sub-form/issues/93
          markDirty(componentInstance);
        }),
      ),
    ),
    setDisabledState$: setDisabledState$.pipe(
      tap((shouldDisable: boolean) => {
        shouldDisable ? formGroup.disable({ emitEvent: false }) : formGroup.enable({ emitEvent: false });
      }),
    ),
    updateValue$: updateValueAndValidity$.pipe(
      tap(() => {
        formGroup.updateValueAndValidity({ emitEvent: false });
      }),
    ),
    bindTouched$: combineLatest([componentHooks.registerOnTouched$, options.touched$ ?? EMPTY]).pipe(
      delay(0),
      tap(([onTouched]) => onTouched()),
    ),
  };

  merge(...Object.values(sideEffects))
    .pipe(takeUntil(lifecyleHooks.onDestroy))
    .subscribe();

  // following cannot be part of `forkJoin(sideEffects)`
  // because it uses `takeUntilDestroyed` which destroys
  // the subscription when the component is being destroyed
  // and therefore prevents the emit of the null value if needed
  registerOnChange$
    .pipe(
      switchMap(onChange => emitNullOnDestroy$.pipe(tap(value => onChange(value)))),
      takeUntil(lifecyleHooks.onDestroy.pipe(delay(0))),
    )
    .subscribe();

  return {
    formGroup,
    formControlNames,
    get formGroupErrors() {
      return getFormGroupErrors<ControlInterface, FormInterface>(formGroup);
    },
    createFormArrayControl,
    controlValue$,
  };
}
