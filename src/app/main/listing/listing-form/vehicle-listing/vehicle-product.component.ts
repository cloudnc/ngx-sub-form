import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
import { OneVehicle, Spaceship, Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';
import { UnreachableCase } from 'src/app/shared/utils';

export interface OneVehicleForm {
  speeder: Speeder | null;
  spaceship: Spaceship | null;
  vehicleType: VehicleType | null;
}

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent),
})
export class VehicleProductComponent extends NgxSubFormRemapComponent<OneVehicle, OneVehicleForm> {
  public VehicleType = VehicleType;

  protected getFormControls(): Controls<OneVehicleForm> {
    return {
      speeder: new FormControl(null),
      spaceship: new FormControl(null),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  protected transformToFormGroup(obj: OneVehicle | null): OneVehicleForm | null {
    if (!obj) {
      return null;
    }

    return {
      speeder: obj.vehicleType === VehicleType.SPEEDER ? obj : null,
      spaceship: obj.vehicleType === VehicleType.SPACESHIP ? obj : null,
      vehicleType: obj.vehicleType,
    };
  }

  protected transformFromFormGroup(formValue: OneVehicleForm): OneVehicle | null {
    switch (formValue.vehicleType) {
      case VehicleType.SPEEDER:
        return formValue.speeder;
      case VehicleType.SPACESHIP:
        return formValue.spaceship;
      case null:
        return null;
      default:
        throw new UnreachableCase(formValue.vehicleType);
    }
  }
}
