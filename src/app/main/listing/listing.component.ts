import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Controls, NgxSubFormRemapComponent } from 'ngx-sub-form';
import { of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap, filter } from 'rxjs/operators';
import { ListingType, OneListing } from 'src/app/interfaces/listing.interface';
import { ListingService } from 'src/app/services/listing.service';
import { OneDroid } from '../../interfaces/droid.interface';
import { OneVehicle } from '../../interfaces/vehicle.interface';
import { UuidService } from '../../services/uuid.service';
import { UnreachableCase } from '../../shared/utils';

interface OneListingForm {
  vehicleProduct: OneVehicle | null;
  droidProduct: OneDroid | null;
  listingType: ListingType | null;
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

  constructor(private route: ActivatedRoute, private listingService: ListingService, private uuidService: UuidService) {
    super();
  }

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

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('listingId')),
        takeUntil(this.onDestroy$),
        switchMap(listingId => {
          if (listingId === 'new' || !listingId) {
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

  public upsertListing(listing: OneListingForm): void {
    const transformedListing = this.transformFromFormGroup(listing);
    if (!transformedListing) {
      throw new Error(`Couldn't transform the listing properly`);
    }
    this.listingService.upsertListing(transformedListing);

    this.formGroup.patchValue({
      id: this.uuidService.generate(),
    });
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

  protected transformToFormGroup(obj: OneListing | null): OneListingForm {
    if (!obj) {
      return {
        vehicleProduct: null,
        droidProduct: null,
        listingType: null,
        id: this.uuidService.generate(),
        title: '',
        imageUrl: '',
        price: 0,
      };
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
