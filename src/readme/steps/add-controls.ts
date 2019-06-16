import { Component } from '@angular/core';
import { OneVehicleForm } from '../../app/main/listing/listing-form/vehicle-listing/vehicle-product.component';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent), // <-- Add this
})
export class VehicleProductComponent extends NgxSubFormComponent<OneVehicleForm> {
  protected getFormControls(): Controls<OneVehicleForm> {
    return {
      speeder: new FormControl(null),
      spaceship: new FormControl(null),
      vehicleType: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
