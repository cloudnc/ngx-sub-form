import { Component } from '@angular/core';
import {
  subformComponentProviders,
  Controls,
  NgxSubFormComponent,
  ControlsNames,
  getControlsNames,
} from 'ngx-sub-form';
import { DroidListing, ListingType } from 'src/app/interfaces/listing.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from 'src/app/services/uuid.service';
import { DroidType } from 'src/app/interfaces/droid.interface';

@Component({
  selector: 'app-droid-listing',
  templateUrl: './droid-listing.component.html',
  styleUrls: ['./droid-listing.component.scss'],
  providers: subformComponentProviders(DroidListingComponent),
})
export class DroidListingComponent extends NgxSubFormComponent {
  private controls: Controls<DroidListing> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    title: new FormControl(null, { validators: [Validators.required] }),
    imageUrl: new FormControl(null, { validators: [Validators.required] }),
    price: new FormControl(null, { validators: [Validators.required] }),
    listingType: new FormControl(ListingType.DROID, { validators: [Validators.required] }),
    product: new FormControl(null, { validators: [Validators.required] }),
  };

  public formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<DroidListing> = getControlsNames(this.controls);

  public selectDroidType: FormControl = new FormControl();

  public DroidType = DroidType;

  constructor(private uuidService: UuidService) {
    super();
  }

  public writeValue(droidListing: DroidListing) {
    super.writeValue(droidListing);

    if (!!droidListing) {
      this.selectDroidType.setValue(droidListing.product.droidType);
    }
  }
}
