import { Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-speeder',
  templateUrl: './speeder.component.html',
  styleUrls: ['./speeder.component.scss'],
  providers: subformComponentProviders(SpeederComponent),
})
export class SpeederComponent extends NgxSubFormComponent<Speeder> {
  protected getFormControls(): Controls<Speeder> {
    return {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      canFire: new UntypedFormControl(null, { validators: [Validators.required] }),
      crewMembers: new UntypedFormControl(null, { validators: [Validators.required] }),
      vehicleType: new UntypedFormControl(null, { validators: [Validators.required] }),
      maximumSpeed: new UntypedFormControl(null, { validators: [Validators.required] }),
    };
  }

  protected getDefaultValues(): Partial<Speeder> | null {
    return { vehicleType: VehicleType.SPEEDER, canFire: false };
  }
}
