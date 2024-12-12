import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { Spaceship, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-spaceship',
  templateUrl: './spaceship.component.html',
  styleUrls: ['./spaceship.component.scss'],
  providers: subformComponentProviders(SpaceshipComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SpaceshipComponent {
  public form = createForm<Spaceship>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      canFire: new UntypedFormControl(false, { validators: [Validators.required] }),
      crewMembers: new UntypedFormControl(null, { validators: [Validators.required] }),
      wingCount: new UntypedFormControl(null, { validators: [Validators.required] }),
      vehicleType: new UntypedFormControl(VehicleType.SPACESHIP, { validators: [Validators.required] }),
    },
  });
}
