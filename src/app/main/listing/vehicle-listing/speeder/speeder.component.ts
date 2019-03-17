import { Component } from '@angular/core';
import { FormControl, Validators, FormArray } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-speeder',
  templateUrl: './speeder.component.html',
  styleUrls: ['./speeder.component.scss'],
  providers: subformComponentProviders(SpeederComponent),
})
export class SpeederComponent extends NgxSubFormComponent<Speeder> {
  protected formControls: Controls<Speeder> = {
    colors: new FormArray([], { validators: [Validators.required] }),
    canFire: new FormControl(false, { validators: [Validators.required] }),
    numberOfPeopleOnBoard: new FormControl(null, { validators: [Validators.required] }),
    vehicleType: new FormControl(VehicleType.SPEEDER, { validators: [Validators.required] }),
    maximumSpeed: new FormControl(null, { validators: [Validators.required] }),
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
