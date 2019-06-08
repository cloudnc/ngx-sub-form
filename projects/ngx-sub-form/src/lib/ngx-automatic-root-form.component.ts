import { OnInit } from '@angular/core';
import { NgxRootFormComponent } from './ngx-root-form.component';
import { isEqual } from 'lodash-es';

export abstract class NgxAutomaticRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxRootFormComponent<ControlInterface, FormInterface>
  implements OnInit {
  public ngOnInit(): void {
    // shouldn't call `super.ngOnInit()` because we want to call
    // `registerOnChange` with different params than the parent!

    this.registerOnChange(data => {
      if (this.formGroup.invalid || isEqual(data, this._dataInput)) {
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

    this.watchChanges();
  }
}
