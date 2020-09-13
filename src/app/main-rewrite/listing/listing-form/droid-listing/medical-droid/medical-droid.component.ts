import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { subformComponentProviders } from 'ngx-sub-form';
import { createForm, FormType, NgxSubForm } from 'ngx-sub-form/new';
import { DroidType, MedicalDroid } from 'src/app/interfaces/droid.interface';

@NgxSubForm()
@Component({
  selector: 'app-medical-droid',
  templateUrl: './medical-droid.component.html',
  styleUrls: ['./medical-droid.component.scss'],
  providers: subformComponentProviders(forwardRef(() => MedicalDroidComponent)),
})
export class MedicalDroidComponent {
  public form = createForm<MedicalDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      droidType: new FormControl(DroidType.MEDICAL, { validators: [Validators.required] }),
      canHealHumans: new FormControl(false, { validators: [Validators.required] }),
      canFixRobots: new FormControl(false, { validators: [Validators.required] }),
    },
  });
}
