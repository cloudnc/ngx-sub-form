import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { AstromechDroid, AstromechDroidShape, DroidType } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-astromech-droid',
  templateUrl: './astromech-droid.component.html',
  styleUrls: ['./astromech-droid.component.scss'],
  providers: subformComponentProviders(AstromechDroidComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AstromechDroidComponent {
  public AstromechDroidShape = AstromechDroidShape;

  public form = createForm<AstromechDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      name: new UntypedFormControl(null, { validators: [Validators.required] }),
      droidType: new UntypedFormControl(DroidType.ASTROMECH, { validators: [Validators.required] }),
      toolCount: new UntypedFormControl(null, { validators: [Validators.required] }),
      shape: new UntypedFormControl(null, { validators: [Validators.required] }),
    },
  });
}
