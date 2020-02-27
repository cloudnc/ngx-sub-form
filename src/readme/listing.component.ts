import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { OneDroid } from '../app/interfaces/droid.interface';
import { OneListing } from '../app/interfaces/listing.interface';
import { OneVehicle } from '../app/interfaces/vehicle.interface';
import { Controls, DataInput, NgxAutomaticRootFormComponent } from 'ngx-sub-form';

enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

export interface OneListingForm {
  id: string;
  title: string;
  price: number;
  imageUrl: string;

  // polymorphic form where product can either be a vehicle or a droid
  listingType: ListingType | null;
  vehicleProduct: OneVehicle | null;
  droidProduct: OneDroid | null;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent extends NgxAutomaticRootFormComponent<OneListing, OneListingForm> {
  // as we're renaming the input, it'd be impossible for ngx-sub-form to guess
  // the name of your input to then check within the `ngOnChanges` hook whether
  // it has been updated or not
  // another solution would be to ask you to use a setter and call a hook but
  // this is too verbose, that's why we created a decorator `@DataInput`
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('listing')
  public dataInput: OneListing | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('listingUpdated') public dataOutput: EventEmitter<OneListing> = new EventEmitter();

  // to access it from the view
  public ListingType = ListingType;

  protected getFormControls(): Controls<OneListingForm> {
    return {
      vehicleProduct: new FormControl(null),
      droidProduct: new FormControl(null),
      listingType: new FormControl(null, Validators.required),
      id: new FormControl(null, Validators.required),
      title: new FormControl(null, Validators.required),
      imageUrl: new FormControl(null, Validators.required),
      price: new FormControl(null, Validators.required),
    };
  }
}
