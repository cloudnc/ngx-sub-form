import { EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import { NgxSubFormRemapComponent, takeUntilDestroyed } from 'ngx-sub-form';
import { BehaviorSubject, of, Subject, timer, iif, Observable } from 'rxjs';
import { distinctUntilChanged, filter, mapTo, startWith, switchMap, tap, debounce, mergeMap } from 'rxjs/operators';
import { isNil } from 'lodash-es';

export abstract class NgxRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxSubFormRemapComponent<ControlInterface, FormInterface>
  implements OnInit, OnChanges {
  public abstract dataInput: Required<ControlInterface> | null;
  public abstract dataOutput: EventEmitter<ControlInterface | null>;
  // using a private variable `_dataOutput$` to be able to control the
  // emission rate with a debounce for ex
  private _dataOutput$: Subject<ControlInterface | null> = new Subject();

  protected dataInput$: Subject<ControlInterface | null> = new Subject();
  protected updateTimeoutMs = 500;

  protected emitInitialValueOnInit = false;
  protected emitNullOnDestroy = false;

  // automaticSubmit will send the form through the `dataOutput`
  // every time it changes if set to true
  // if set to false (default), use the method `manualSave`
  protected _automaticSubmit = false;
  protected set automaticSubmit(autoSubmit: boolean) {
    this._automaticSubmit = autoSubmit;
    this.a(this.transformFromFormGroup(this.formGroupValues));
  }
  protected get automaticSubmit(): boolean {
    return this._automaticSubmit;
  }
  protected automaticSubmitDebounceTiming: number = 0;
  protected dataValue: ControlInterface | null = null;

  private applyingChangeSignal = new BehaviorSubject(false);

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

  public a(data: any) {
    // console.log(data);

    if (this.formGroup.invalid || isEqual(data, this.dataInput)) {
      return;
    }

    this.dataValue = data;

    if (!this._automaticSubmit) {
      return;
    }

    this.applyingChangeSignal.next(true);

    if (this.formGroup) {
      this.formGroup.markAsPristine();

      if (this.formGroup.valid) {
        this._dataOutput$.next(data);
      }
    }
  }

  public ngOnInit(): void {
    // we need to manually call registerOnChange because that function
    // handles most of the logic from NgxSubForm and when it's called
    // as a ControlValueAccessor that function is called by Angular itself
    this.registerOnChange(data => {
      this.a(data);
    });

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

    const debounceIfAutoSubmit = () => {
      console.log('this._automaticSubmit', this._automaticSubmit);

      return <T>(obs$: Observable<T>): Observable<T> => {
        console.log('emitted');

        return this._automaticSubmit ? obs$.pipe(debounce(() => timer(this.automaticSubmitDebounceTiming))) : obs$;
      };
    };

    this._dataOutput$
      .pipe(
        // tap(x => console.log('data output', x)),
        debounceIfAutoSubmit(),
        tap(value => this.dataOutput.emit(value)),
        takeUntilDestroyed(this),
      )
      .subscribe();
  }

  public ngOnChanges(): void {
    this.dataInput$.next(this.dataInput);
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
