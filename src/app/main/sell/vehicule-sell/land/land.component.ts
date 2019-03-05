import { Component, OnInit } from '@angular/core';
import { Controls, NgxSubFormComponent, ControlsNames, getControlsNames, subformComponentProviders } from 'sub-form';
import { Land, VehiculeType } from 'src/app/interfaces/vehicule.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from '../../../../services/uuid.service';

@Component({
  selector: 'app-land',
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.scss'],
  providers: subformComponentProviders(LandComponent),
})
export class LandComponent extends NgxSubFormComponent implements OnInit {
  private controls: Controls<Land> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    canFire: new FormControl(false, { validators: [Validators.required] }),
    numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
    vehiculeType: new FormControl(VehiculeType.LAND, { validators: [Validators.required] }),
    numberOfWheels: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<Land> = getControlsNames(this.controls);

  constructor(private uuidService: UuidService) {
    super();
  }

  public ngOnInit(): void {
    this.controls.id.disable();
  }
}
