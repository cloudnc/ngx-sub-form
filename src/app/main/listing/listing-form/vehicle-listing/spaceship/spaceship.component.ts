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
      canFire: new FormControl(false, { validators: [Validators.required] }),
      numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
      numberOfWings: new FormControl(null, { validators: [Validators.required] }),
      vehicleType: new FormControl(VehicleType.SPACESHIP, { validators: [Validators.required] }),
    };
  }
}
