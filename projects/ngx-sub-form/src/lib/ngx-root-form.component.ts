import { EventEmitter, OnInit, Input } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { NgxSubFormRemapComponent } from './ngx-sub-form.component';
import { takeUntilDestroyed, isNullOrUndefined } from './ngx-sub-form-utils';
import { format } from 'util';

/** @internal
 *
 *  This function is used in `ngx-root-form.component` in order to generate an object where every primitive type
 * (a value in json or entry in array) is changed to null.
 *
*/
function nullifyObject(obj: any): any {

  if ( Array.isArray(obj) ) {
    obj.forEach((entry, i) => {
      if ( entry !== Object(entry) ) {
        obj[i] = null;
      } else {
        obj[i] = nullifyObject(entry);
      }
    })
    return obj;

  } else {

    const _keys = Object.keys(obj);

    _keys.forEach(key => {

      if ( obj[key] !== Object(obj[key]) ) {
        obj[key] = null;
      } else {
        obj[key] = nullifyObject(obj[key])
      }
    })

    return obj;

  }
}

export abstract class NgxRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxSubFormRemapComponent<ControlInterface, FormInterface>
  implements OnInit {
  public abstract dataInput: Required<ControlInterface> | null | undefined;
  // `Input` values are set while the `ngOnChanges` hook is ran
  // and it does happen before the `ngOnInit` where we start
  // listening to `dataInput$`. Therefore, it cannot be a `Subject`
  // or we will miss the first value
  protected dataInput$: BehaviorSubject<Required<ControlInterface> | null | undefined> = new BehaviorSubject<
    Required<ControlInterface> | null | undefined
  >(null);

  public abstract dataOutput: EventEmitter<ControlInterface>;
  // using a private variable `_dataOutput$` to be able to control the
  // emission rate with a debounce or throttle for ex
  /** @internal */
  protected _dataOutput$: Subject<ControlInterface> = new Subject();

  @Input()
  public set disabled(shouldDisable: boolean | undefined) {
    this.setDisabledState(shouldDisable);
  }

  protected emitInitialValueOnInit = false;
  protected emitNullOnDestroy = false;

  protected dataValue: ControlInterface | null = null;

  public ngOnInit(): void {
    // we need to manually call registerOnChange because that function
    // handles most of the logic from NgxSubForm and when it's called
    // as a ControlValueAccessor that function is called by Angular itself
    this.registerOnChange(data => this.onRegisterOnChangeHook(data));

    this.dataInput$
      .pipe(
        filter(newValue => !isEqual(newValue, this.formGroup.value)),
        tap(newValue => {
          if (!isNullOrUndefined(newValue)) {
            this.writeValue(newValue);
          }
        }),
        takeUntilDestroyed(this),
      )
      .subscribe();

    this._dataOutput$
      .pipe(
        tap(value => this.dataOutput.emit(value)),
        takeUntilDestroyed(this),
      )
      .subscribe();
  }

  // This method will allow for a smart component to reset the dumb form.
  public reset() {
    const nullVal = JSON.parse(JSON.stringify(this.formGroup.value));
    nullifyObject(nullVal);
    this.formGroup.reset(nullVal);
  }

  /** @internal */
  protected onRegisterOnChangeHook(data: ControlInterface | null): boolean {
    if (this.formGroup.invalid || isEqual(data, this.dataInput$.value)) {
      return false;
    }

    this.dataValue = data;
    return true;
  }

  // called by the DataInput decorator
  /** @internal */
  public dataInputUpdated(data: Required<ControlInterface> | null | undefined): void {
    this.dataInput$.next(data);
  }

  public writeValue(obj: Required<ControlInterface> | null): void {
    this.dataValue = obj;
    super.writeValue(obj);
  }

  protected transformToFormGroup(obj: ControlInterface | null): FormInterface {
    return (obj as unknown) as FormInterface;
  }

  protected transformFromFormGroup(formValue: FormInterface): ControlInterface | null {
    return (formValue as unknown) as ControlInterface;
  }

  public manualSave(): void {
    if (!isNullOrUndefined(this.dataValue)) {
      this._dataOutput$.next(this.dataValue);
    }
  }
}
