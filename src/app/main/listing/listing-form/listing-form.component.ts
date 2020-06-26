import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  Controls,
  takeUntilDestroyed,
  // NgxAutomaticRootFormComponent,
  // NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES,
  DataInput,
  NgxRootFormComponent,
} from 'ngx-sub-form';
import { tap } from 'rxjs/operators';
import { ListingType, OneListing } from 'src/app/interfaces/listing.interface';
import { OneDroid } from '../../../interfaces/droid.interface';
import { OneVehicle } from '../../../interfaces/vehicle.interface';
import { UnreachableCase } from '../../../shared/utils';
// import { Observable } from 'rxjs';

interface OneListingForm {
  vehicleProduct: OneVehicle | null;
  droidProduct: OneDroid | null;
  listingType: ListingType | null;
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

// if you wish to try the automatic root form component uncomment lines containing:
// - `extends NgxAutomaticRootFormComponent`
// - the `handleDataOutput` method
// - the 3 related imports at the top

@Component({
  selector: 'app-listing-form',
  templateUrl: './listing-form.component.html',
  styleUrls: ['./listing-form.component.scss']
})
// export class ListingFormComponent extends NgxAutomaticRootFormComponent<OneListing, OneListingForm>
export class ListingFormComponent extends NgxRootFormComponent<OneListing, OneListingForm> {
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('listing')
  public dataInput: Required<OneListing> | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('listingUpdated')
  public dataOutput: EventEmitter<OneListing> = new EventEmitter();

  public ListingType: typeof ListingType = ListingType;

  // protected handleEmissionRate(): (obs$: Observable<OneListingForm>) => Observable<OneListingForm> {
  //   return NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES.debounce(500);
  // }

  protected getFormControls(): Controls<OneListingForm> {
    return {
      vehicleProduct: new FormControl(null),
      droidProduct: new FormControl(null),
      listingType: new FormControl(null, Validators.required),
      id: new FormControl(null, Validators.required),
      title: new FormControl(null, Validators.required),
      imageUrl: new FormControl(null, {validators: [Validators.required, Validators.minLength(4), Validators.maxLength(8)]}),
      price: new FormControl(null, {validators: [Validators.required, Validators.min(0), Validators.max(5)]}),
    };
  }

  protected transformFromFormGroup(formValue: OneListingForm): OneListing | null {
    const { vehicleProduct, droidProduct, listingType, ...commonValues } = formValue;

    switch (listingType) {
      case ListingType.DROID:
        return droidProduct ? { product: droidProduct, listingType, ...commonValues } : null;
      case ListingType.VEHICLE:
        return vehicleProduct ? { product: vehicleProduct, listingType, ...commonValues } : null;
      case null:
        return null;
      default:
        throw new UnreachableCase(listingType);
    }
  }

  protected transformToFormGroup(obj: OneListing | null): OneListingForm | null {
    if (!obj) {
      return null;
    }

    const { listingType, product, ...commonValues } = obj;

    return {
      vehicleProduct: obj.listingType === ListingType.VEHICLE ? obj.product : null,
      droidProduct: obj.listingType === ListingType.DROID ? obj.product : null,
      listingType: obj.listingType,
      ...commonValues,
    };
  }
}
