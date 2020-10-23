import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-speeder',
  templateUrl: './speeder.component.html',
  styleUrls: ['./speeder.component.scss'],
  providers: subformComponentProviders(forwardRef(() => SpeederComponent)),
})
export class SpeederComponent {
  public form = createForm<Speeder>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new FormControl(null, { validators: [Validators.required] }),
      canFire: new FormControl(false, { validators: [Validators.required] }),
      crewMembers: new FormControl(null, { validators: [Validators.required] }),
      vehicleType: new FormControl(VehicleType.SPEEDER, { validators: [Validators.required] }),
      maximumSpeed: new FormControl(null, { validators: [Validators.required] }),
    },
  });
}
