import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-speeder',
  templateUrl: './speeder.component.html',
  styleUrls: ['./speeder.component.scss'],
  providers: subformComponentProviders(SpeederComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SpeederComponent {
  public form = createForm<Speeder>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      canFire: new UntypedFormControl(false, { validators: [Validators.required] }),
      crewMembers: new UntypedFormControl(null, { validators: [Validators.required] }),
      vehicleType: new UntypedFormControl(VehicleType.SPEEDER, { validators: [Validators.required] }),
      maximumSpeed: new UntypedFormControl(null, { validators: [Validators.required] }),
    },
  });
}
