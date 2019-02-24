import { Component, OnInit } from '@angular/core';
import { Controls, subformComponentProviders, SubFormComponent, ControlsNames, getControlsNames } from 'sub-form';
import { Spaceship, VehiculeType } from 'src/app/interfaces/vehicule.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from 'src/app/services/uuid.service';

@Component({
  selector: 'app-spaceship',
  templateUrl: './spaceship.component.html',
  styleUrls: ['./spaceship.component.scss'],
  providers: subformComponentProviders(SpaceshipComponent),
})
export class SpaceshipComponent extends SubFormComponent {
  private controls: Controls<Spaceship> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    canFire: new FormControl(false, { validators: [Validators.required] }),
    numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
    numberOfWings: new FormControl(null, { validators: [Validators.required] }),
    vehiculeType: new FormControl(VehiculeType.SPACESHIP, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<Spaceship> = getControlsNames(this.controls);

  constructor(private uuidService: UuidService) {
    super();

    this.controls.id.disable();
  }
}
