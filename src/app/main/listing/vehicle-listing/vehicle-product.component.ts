import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
import { OneVehicle, Spaceship, Speeder, VehicleType } from 'src/app/interfaces/vehicle.interface';
import { UnreachableCase } from 'src/app/shared/utils';

interface OneVehicleForm {
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
  protected formControls: Controls<OneVehicleForm> = {
    speeder: new FormControl(null),
    spaceship: new FormControl(null),
    vehicleType: new FormControl(null, { validators: [Validators.required] }),
  };

  public VehicleType = VehicleType;

  protected transformToFormGroup(obj: OneVehicle | null): OneVehicleForm {
    return {
      speeder: obj && obj.vehicleType === VehicleType.SPEEDER ? obj : null,
      spaceship: obj && obj.vehicleType === VehicleType.SPACESHIP ? obj : null,
      vehicleType: obj ? obj.vehicleType : null,
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
