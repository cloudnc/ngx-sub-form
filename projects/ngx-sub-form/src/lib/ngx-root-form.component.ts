import { EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import { NgxSubFormRemapComponent, takeUntilDestroyed } from 'ngx-sub-form';
import { BehaviorSubject, of, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, mapTo, startWith, switchMap, tap } from 'rxjs/operators';

export abstract class NgxRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxSubFormRemapComponent<ControlInterface, FormInterface>
  implements OnInit, OnChanges {
  public abstract dataInput: Required<ControlInterface> | null;
  public abstract dataOutput: EventEmitter<ControlInterface | null>;

  protected dataInput$: Subject<ControlInterface | null> = new Subject();
  protected updateTimeoutMs = 500;

  protected emitInitialValueOnInit = false;
  protected emitNullOnDestroy = false;

  protected automaticSubmit = false;
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

  public ngOnInit(): void {
    this.registerOnChange(data => {
      if (!data || this.formGroup.invalid || isEqual(data, this.dataInput)) {
        return;
      }

      this.dataValue = data;
      if (!this.automaticSubmit) {
        return;
      }
      this.applyingChangeSignal.next(true);
      if (this.formGroup) {
        this.formGroup.markAsPristine();

        if (this.formGroup.valid) {
          this.dataOutput.emit(data);
        }
      }
    });

    this.dataInput$
      .pipe(
        tap(input => {
          this.applyingChangeSignal.next(false);
        }),
        filter(value => value != null),
        filter(newValue => !isEqual(newValue, this.formGroup.value)),
        takeUntilDestroyed(this),
      )
      .subscribe((newValue: ControlInterface | null) => {
        this.writeValue(newValue as Required<ControlInterface>);
      });

    this.applyingChange$
      .pipe(
        tap(isApplying => this.handleApplyingChangeTimeout(isApplying)),
        takeUntilDestroyed(this),
      )
      .subscribe();
  }

  public ngOnChanges(changes: SimpleChanges): void {
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
    this.dataOutput.next(this.dataValue);
  }
}
