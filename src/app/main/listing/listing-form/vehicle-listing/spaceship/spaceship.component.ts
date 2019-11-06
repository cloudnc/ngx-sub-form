import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Spaceship, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-spaceship',
  templateUrl: './spaceship.component.html',
  styleUrls: ['./spaceship.component.scss'],
  providers: subformComponentProviders(SpaceshipComponent),
})
export class SpaceshipComponent extends NgxSubFormComponent<Spaceship> {
  protected getFormControls(): Controls<Spaceship> {
    return {
      color: new FormControl(null, { validators: [Validators.required] }),
      canFire: new FormControl(null, { validators: [Validators.required] }),
      crewMembers: new FormControl(null, { validators: [Validators.required] }),
      wingCount: new FormControl(null, { validators: [Validators.required] }),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  public getDefaultValues(): Partial<Spaceship> | null {
    return { canFire: false, vehicleType: VehicleType.SPACESHIP };
  }
}
