import { NgxRootFormComponent } from './ngx-root-form.component';
import { Observable, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

export const NGX_SUB_FORM_HANDLE_DATA_OUTPUT_STRATEGIES = {
  debounce: (time: number): ReturnType<NgxAutomaticRootFormComponent<any, any>['handleDataOutput']> => obs =>
    obs.pipe(debounce(() => timer(time))),
};

export abstract class NgxAutomaticRootFormComponent<
  ControlInterface,
  FormInterface = ControlInterface
> extends NgxRootFormComponent<ControlInterface, FormInterface> {
  public ngOnInit(): void {
    super.ngOnInit();

    this.registerOnChange(data => {
      if (this.formGroup.invalid || isEqual(data, this.dataInput)) {
        return;
      }

      this.dataValue = data;

      this.applyingChangeSignal.next(true);

      if (this.formGroup) {
        this.formGroup.markAsPristine();

        if (this.formGroup.valid) {
          this._dataOutput$.next(data);
        }
      }
    });
  }

  protected abstract handleDataOutput(): (
    obs$: Observable<ControlInterface | null>,
  ) => Observable<ControlInterface | null>;
}

// @todo to remove
// class A extends NgxAutomaticRootFormComponent<any, any> {
//   protected handleDataOutput(): (obs$: Observable<any>) => Observable<any> {
//     return NGX_SUB_FORM_HANDLE_DATA_OUTPUT_STRATEGIES.debounce(300);
//   }

//   public dataInput: Required<any> | null;

//   public dataOutput: import('/home/maxime/Documents/code/ngx-sub-form/node_modules/@angular/core/src/event_emitter').EventEmitter<
//     any
//   >;

//   protected getFormControls(): import('/home/maxime/Documents/code/ngx-sub-form/projects/ngx-sub-form/src/lib/ngx-sub-form-utils').Controls<
//     any
//   > {
//     throw new Error('Method not implemented.');
//   }
// }
