import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { Spaceship, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-spaceship',
  templateUrl: './spaceship.component.html',
  styleUrls: ['./spaceship.component.scss'],
  providers: subformComponentProviders(forwardRef(() => SpaceshipComponent)),
})
export class SpaceshipComponent {
  public form = createForm<Spaceship>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new FormControl(null, { validators: [Validators.required] }),
      canFire: new FormControl(false, { validators: [Validators.required] }),
      crewMembers: new FormControl(null, { validators: [Validators.required] }),
      wingCount: new FormControl(null, { validators: [Validators.required] }),
      vehicleType: new FormControl(VehicleType.SPACESHIP, { validators: [Validators.required] }),
    },
  });
}
