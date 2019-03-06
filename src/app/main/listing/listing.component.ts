import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Controls, NgxSubFormRemapComponent } from 'ngx-sub-form';
import { of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ListingType, OneListing } from 'src/app/interfaces/listing.interface';
import { ListingService } from 'src/app/services/listing.service';
import { OneDroid } from '../../interfaces/droid.interface';
import { OneVehicle } from '../../interfaces/vehicle.interface';
import { UuidService } from '../../services/uuid.service';

interface OneListingForm {
  vehicleProduct: OneVehicle;
  droidProduct: OneDroid;
  listingType: ListingType;
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent extends NgxSubFormRemapComponent<OneListing, OneListingForm>
  implements OnInit, OnDestroy {
  public onDestroy$ = new Subject<void>();

  public ListingType = ListingType;

  protected formControls: Controls<OneListingForm> = {
    vehicleProduct: new FormControl(null),
    droidProduct: new FormControl(null),
    listingType: new FormControl(null, Validators.required),
    id: new FormControl(this.uuidService.generate(), Validators.required),
    title: new FormControl(null, Validators.required),
    imageUrl: new FormControl(null, Validators.required),
    price: new FormControl(null, Validators.required),
  };

  constructor(private route: ActivatedRoute, private listingService: ListingService, private uuidService: UuidService) {
    super();
  }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('listingId')),
        takeUntil(this.onDestroy$),
        switchMap(listingId => {
          if (listingId === 'new') {
            return of(null);
          }
          return this.listingService.getOneListing(listingId);
        }),
        tap(listing => {
          if (listing) {
            this.formGroup.setValue(this.transformToFormGroup(listing));
          } else {
            this.formGroup.reset({
              id: this.uuidService.generate(),
            });
          }
        }),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public upsertListing(listing: OneListing): void {
    this.listingService.upsertListing(listing);
  }

  protected transformFromFormGroup(formValue: OneListingForm): OneListing {
    const { vehicleProduct, droidProduct, listingType, ...commonValues } = formValue;

    switch (listingType) {
      case ListingType.DROID:
        return { product: droidProduct, listingType, ...commonValues };
      case ListingType.VEHICLE:
        return { product: vehicleProduct, listingType, ...commonValues };
    }
  }

  protected transformToFormGroup(obj: OneListing): OneListingForm {
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
