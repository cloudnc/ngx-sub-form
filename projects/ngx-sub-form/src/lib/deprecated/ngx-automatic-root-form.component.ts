import { Directive, OnInit } from '@angular/core';
import { NgxRootFormComponent } from './ngx-root-form.component';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
/**
 * @deprecated
 */
export abstract class NgxAutomaticRootFormComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxRootFormComponent<ControlInterface, FormInterface>
  implements OnInit {
  /** @internal */
  protected onRegisterOnChangeHook(data: ControlInterface | null) {
    if (!super.onRegisterOnChangeHook(data)) {
      return false;
    }

    if (this.formGroup) {
      this.formGroup.markAsPristine();

      if (this.formGroup.valid) {
        this.manualSave();
      }
    }

    return true;
  }
}
