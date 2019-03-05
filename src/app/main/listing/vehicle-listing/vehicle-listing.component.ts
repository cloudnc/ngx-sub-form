import { Component } from '@angular/core';
import { VehicleListing, ListingType } from '../../../interfaces/listing.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import {
  Controls,
  NgxSubFormComponent,
  getControlsNames,
  subformComponentProviders,
  ControlsNames,
} from 'ngx-sub-form';
import { VehicleType } from 'src/app/interfaces/vehicle.interface';
import { UuidService } from 'src/app/services/uuid.service';

@Component({
  selector: 'app-vehicle-listing',
  templateUrl: './vehicle-listing.component.html',
  styleUrls: ['./vehicle-listing.component.scss'],
  providers: subformComponentProviders(VehicleListingComponent),
})
export class VehicleListingComponent extends NgxSubFormComponent {
  private controls: Controls<VehicleListing> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    title: new FormControl(null, { validators: [Validators.required] }),
    imageUrl: new FormControl(null, { validators: [Validators.required] }),
    price: new FormControl(null, { validators: [Validators.required] }),
    listingType: new FormControl(ListingType.VEHICLE, { validators: [Validators.required] }),
    product: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<VehicleListing> = getControlsNames(this.controls);

  public selectVehicleType: FormControl = new FormControl();

  public VehicleType = VehicleType;

  constructor(private uuidService: UuidService) {
    super();
  }

  public writeValue(vehicleListing: VehicleListing) {
    super.writeValue(vehicleListing);

    if (!!vehicleListing) {
      this.selectVehicleType.setValue(vehicleListing.product.vehicleType);
    }
  }
}
