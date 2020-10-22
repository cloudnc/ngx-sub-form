import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { createForm, FormType, NgxSubForm, subformComponentProviders } from 'ngx-sub-form/new';
import { AstromechDroid, AstromechDroidShape, DroidType } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-astromech-droid',
  templateUrl: './astromech-droid.component.html',
  styleUrls: ['./astromech-droid.component.scss'],
  providers: subformComponentProviders(forwardRef(() => AstromechDroidComponent)),
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
  });
}
