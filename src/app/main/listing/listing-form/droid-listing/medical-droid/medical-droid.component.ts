import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, MedicalDroid } from 'src/app/interfaces/droid.interface';

@Component({
  selector: 'app-medical-droid',
  templateUrl: './medical-droid.component.html',
  styleUrls: ['./medical-droid.component.scss'],
  providers: subformComponentProviders(MedicalDroidComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MedicalDroidComponent {
  public form = createForm<MedicalDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      name: new UntypedFormControl(null, { validators: [Validators.required] }),
      droidType: new UntypedFormControl(DroidType.MEDICAL, { validators: [Validators.required] }),
      canHealHumans: new UntypedFormControl(false, { validators: [Validators.required] }),
      canFixRobots: new UntypedFormControl(false, { validators: [Validators.required] }),
    },
  });
}
