import { Component } from '@angular/core';
import { FormControl, Validators, FormArray } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Spaceship, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-spaceship',
  templateUrl: './spaceship.component.html',
  styleUrls: ['./spaceship.component.scss'],
  providers: subformComponentProviders(SpaceshipComponent),
})
export class SpaceshipComponent extends NgxSubFormComponent<Spaceship> {
  protected formControls: Controls<Spaceship> = {
    colors: new FormArray([], { validators: [Validators.required] }),
    canFire: new FormControl(false, { validators: [Validators.required] }),
    numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
    numberOfWings: new FormControl(null, { validators: [Validators.required] }),
    vehicleType: new FormControl(VehicleType.SPACESHIP, { validators: [Validators.required] }),
  };

  public get colors(): FormArray {
    return this.formGroup.get(this.formControlNames.colors) as FormArray;
  }

  public addColor(): void {
    this.colors.push(new FormControl());
  }

  public deleteColor(index: number): void {
    this.colors.removeAt(index);
  }
}
