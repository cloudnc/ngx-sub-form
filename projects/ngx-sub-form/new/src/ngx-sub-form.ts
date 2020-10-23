import isEqual from 'fast-deep-equal';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import {
  delay,
  filter,
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
import { isNullOrUndefined } from '../../src/lib/shared/ngx-sub-form-utils';
import {
  createFormDataFromOptions,
  getControlValueAccessorBindings,
  getFormGroupErrors,
  handleFArray as handleFormArrays,
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

const optionsHaveInstructionsToCreateArrays = <ControlInterface, FormInterface>(
  options: NgxSubFormOptions<ControlInterface, FormInterface>,
): options is NgxSubFormOptions<ControlInterface, FormInterface> & NgxSubFormArrayOptions<FormInterface> => true;

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
): NgxRootForm<FormInterface>;
export function createForm<ControlInterface, FormInterface = ControlInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
  options: NgxSubFormOptions<ControlInterface, FormInterface>,
): NgxSubForm<FormInterface>;
export function createForm<ControlInterface, FormInterface>(
  componentInstance: ControlValueAccessorComponentInstance,
  options: NgxFormOptions<ControlInterface, FormInterface>,
): NgxSubForm<FormInterface> {
  const { formGroup, defaultValues, formControlNames, formArrays } = createFormDataFromOptions<
    ControlInterface,
    FormInterface
  >(options);

  let isRemoved = false;

  const lifecyleHooks: ComponentHooks = options.componentHooks ?? {
    onDestroy: getObservableLifecycle(componentInstance).ngOnDestroy,
  };

  lifecyleHooks.onDestroy.pipe(take(1)).subscribe(() => {
    isRemoved = true;
  });

  let first = true;

  // define the `validate` method to improve errors
  // and support nested errors
  patchClassInstance(componentInstance, {
    validate: () => {
      if (first) {
        first = false;
        setTimeout(() => {
          formGroup.updateValueAndValidity();
        }, 0);

        return null;
      }

      if (isRemoved) return null;

      if (formGroup.valid) {
        return null;
      }

      return getFormGroupErrors<ControlInterface, FormInterface>(formGroup);
    },
  });

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
    ? options.disabled$
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
        // @todo following could probably be refactored a bit to avoid code duplication
        if (options.manualSave$) {
          return options.manualSave$.pipe(
            withLatestFrom(formGroup.valueChanges),
            map(([_, formValue]) => formValue),
            delay(0),
            filter(formValue => formGroup.valid && !isEqual(transformedValue, formValue)),
          );
        } else {
          if (options.handleEmissionRate) {
            return formGroup.valueChanges.pipe(
              options.handleEmissionRate,
              delay(0),
              filter(formValue => formGroup.valid && !isEqual(transformedValue, formValue)),
            );
          } else {
            return formGroup.valueChanges.pipe(
              delay(0),
              filter(formValue => formGroup.valid && !isEqual(transformedValue, formValue)),
            );
          }
        }
      }
    }),
    map(value =>
      options.fromFormGroup
        ? options.fromFormGroup(value)
        : // if it's not a remap component, the ControlInterface === the FormInterface
          ((value as any) as ControlInterface),
    ),
  );

  const emitNullOnDestroy$: Observable<null> =
    // emit null when destroyed by default
    isNullOrUndefined(options.emitNullOnDestroy) || options.emitNullOnDestroy
      ? lifecyleHooks.onDestroy.pipe(mapTo(null))
      : EMPTY;

  const sideEffects = {
    broadcastValueToParent$: registerOnChange$.pipe(
      switchMap(onChange => broadcastValueToParent$.pipe(tap(value => onChange(value)))),
    ),
    applyUpstreamUpdateOnLocalForm$: transformedValue$.pipe(
      tap(value => {
        handleFormArrays<FormInterface>(
          formArrays,
          value,
          optionsHaveInstructionsToCreateArrays<ControlInterface, FormInterface>(options)
            ? options.createFormArrayControl
            : null,
        );

        formGroup.reset(value);

        // commenting out the following for now as it seems that calling
        // `markDirty` on a component when an input hasn't been set
        // (in this case on a root form) then it throws an error
        // Cannot read property 'nodeIndex' of null
        // so we'll see later on if this is really needed or if it can
        // be removed
        // support `changeDetection: ChangeDetectionStrategy.OnPush`
        // on the component hosting a form
        // markDirty(componentInstance);
      }),
    ),
    setDisabledState$: setDisabledState$.pipe(
      tap((shouldDisable: boolean) => {
        shouldDisable ? formGroup.disable() : formGroup.enable();
      }),
    ),
  };

  forkJoin(sideEffects)
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
    // todo
    createFormArrayControl: (options as any).createFormArrayControl,
  };
}
