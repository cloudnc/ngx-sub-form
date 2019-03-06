import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, MedicalDroid } from 'src/app/interfaces/droid.interface';

@Component({
  selector: 'app-medical-droid',
  templateUrl: './medical-droid.component.html',
  styleUrls: ['./medical-droid.component.scss'],
  providers: subformComponentProviders(MedicalDroidComponent),
})
export class MedicalDroidComponent extends NgxSubFormComponent<MedicalDroid> {
  protected formControls: Controls<MedicalDroid> = {
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.MEDICAL, { validators: [Validators.required] }),
    canHealHumans: new FormControl(false, { validators: [Validators.required] }),
    canFixRobots: new FormControl(false, { validators: [Validators.required] }),
  };
}
