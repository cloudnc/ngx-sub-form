import { Component } from '@angular/core';
import {
  Controls,
  NgxSubFormComponent,
  ControlsNames,
  getControlsNames,
  subformComponentProviders,
} from 'ngx-sub-form';
import { Land, VehicleType } from 'src/app/interfaces/vehicle.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from '../../../../services/uuid.service';

@Component({
  selector: 'app-speeder',
  templateUrl: './speeder.component.html',
  styleUrls: ['./speeder.component.scss'],
  providers: subformComponentProviders(SpeederComponent),
})
export class SpeederComponent extends NgxSubFormComponent {
  private controls: Controls<Land> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    canFire: new FormControl(false, { validators: [Validators.required] }),
    numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
    vehicleType: new FormControl(VehicleType.SPEEDER, { validators: [Validators.required] }),
    maximumSpeed: new FormControl(null, { validators: [Validators.required] }),
  };

  public formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<Land> = getControlsNames(this.controls);

  constructor(private uuidService: UuidService) {
    super();
  }
}
