import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getObservableLifecycle, ObservableLifecycle } from 'ngx-observable-lifecycle';
import { subformComponentProviders } from 'ngx-sub-form';
import { createForm } from '../../../../../../../projects/ngx-sub-form/src/lib/new/ngx-sub-form';
import { FormType } from '../../../../../../../projects/ngx-sub-form/src/lib/new/ngx-sub-form.types';
import { AstromechDroid, AstromechDroidShape, DroidType } from '../../../../../interfaces/droid.interface';

@ObservableLifecycle()
@Component({
  selector: 'app-astromech-droid',
  templateUrl: './astromech-droid.component.html',
  styleUrls: ['./astromech-droid.component.scss'],
  providers: subformComponentProviders(AstromechDroidComponent),
})
export class AstromechDroidComponent {
  public AstromechDroidShape = AstromechDroidShape;

  public form = createForm<AstromechDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      droidType: new FormControl(DroidType.ASTROMECH, { validators: [Validators.required] }),
      toolCount: new FormControl(null, { validators: [Validators.required] }),
      shape: new FormControl(null, { validators: [Validators.required] }),
    },
    componentHooks: {
      onDestroy: getObservableLifecycle(this).onDestroy,
    },
  });
}
