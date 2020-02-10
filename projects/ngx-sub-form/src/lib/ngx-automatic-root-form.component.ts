import { OnInit } from '@angular/core';
import { NgxRootFormRemapComponent } from './ngx-root-form.component';

export abstract class NgxAutomaticRootFormRemapComponent<ControlInterface, FormInterface = ControlInterface>
  extends NgxRootFormRemapComponent<ControlInterface, FormInterface>
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

export abstract class NgxAutomaticRootFormComponent<ControlInterface>
  extends NgxAutomaticRootFormRemapComponent<ControlInterface>
  implements OnInit {
  protected transformToFormGroup(
    obj: ControlInterface | null,
    defaultValues: Partial<ControlInterface> | null,
  ): ControlInterface | null {
    return (obj as unknown) as ControlInterface;
  }

  protected transformFromFormGroup(formValue: ControlInterface): ControlInterface | null {
    return (formValue as unknown) as ControlInterface;
  }
}
