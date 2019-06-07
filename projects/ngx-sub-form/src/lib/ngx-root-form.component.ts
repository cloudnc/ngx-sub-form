import { EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, of, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, mapTo, startWith, switchMap, tap } from 'rxjs/operators';
import { isNil } from 'lodash-es';
import { NgxSubFormRemapComponent } from './ngx-sub-form.component';
import { takeUntilDestroyed } from './ngx-sub-form-utils';

export abstract class NgxRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxSubFormRemapComponent<ControlInterface, FormInterface>
  implements OnInit, OnChanges {
  public abstract dataInput: Required<ControlInterface> | null;
  public abstract dataOutput: EventEmitter<ControlInterface | null>;
  // using a private variable `_dataOutput$` to be able to control the
  // emission rate with a debounce or throttle for ex
  /** @internal */
  protected _dataOutput$: Subject<ControlInterface | null> = new Subject();

  protected dataInput$: Subject<ControlInterface | null> = new Subject();
  protected updateTimeoutMs = 500;

  protected emitInitialValueOnInit = false;
  protected emitNullOnDestroy = false;

  protected dataValue: ControlInterface | null = null;

  /** @internal */
  protected applyingChangeSignal = new BehaviorSubject(false);

  protected applyingChange$ = this.applyingChangeSignal.pipe(
    switchMap(isApplying => {
      if (!isApplying) {
        return of(false);
      }

      return timer(this.updateTimeoutMs).pipe(
        mapTo(false),
        startWith(true),
      );
    }),
    distinctUntilChanged(),
  );

  public ngOnInit(): void {
    // we need to manually call registerOnChange because that function
    // handles most of the logic from NgxSubForm and when it's called
    // as a ControlValueAccessor that function is called by Angular itself
    this.registerOnChange(data => {
      if (this.formGroup.invalid || isEqual(data, this.dataInput)) {
        return;
      }

      this.dataValue = data;
    });

    this.watchChanges();
  }

  /** @internal */
  protected watchChanges() {
    this.dataInput$
      .pipe(
        tap(() => this.applyingChangeSignal.next(false)),
        filter(newValue => !isNil(newValue) && !isEqual(newValue, this.formGroup.value)),
        tap(newValue => this.writeValue(newValue as Required<ControlInterface>)),
        takeUntilDestroyed(this),
      )
      .subscribe();

    this.applyingChange$
      .pipe(
        tap(isApplying => this.handleApplyingChangeTimeout(isApplying)),
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

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataInput$']) {
      this.dataInput$.next(this.dataInput);
    }
  }

  protected handleApplyingChangeTimeout(changeApplying: boolean): void {
    if (!changeApplying && !isEqual(this.dataInput, this.formGroup.value)) {
      this.writeValue(this.dataInput);
    }
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
    this._dataOutput$.next(this.dataValue);
  }
}
