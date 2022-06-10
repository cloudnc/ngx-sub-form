import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { NullableObject } from 'ngx-sub-form';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OneListing } from 'src/app/interfaces/listing.interface';
import { ListingService } from 'src/app/services/listing.service';
import { UuidService } from '../../services/uuid.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent {
  public readonlyFormControl: UntypedFormControl = new UntypedFormControl(false);

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private uuidService: UuidService,
  ) {}

  public listing$: Observable<NullableObject<OneListing>> = this.route.paramMap.pipe(
    map(params => params.get('listingId')),
    switchMap(listingId => {
      if (listingId === 'new' || !listingId) {
        return of(null);
      }
      return this.listingService.getOneListing(listingId);
    }),
    map(listing => (listing ? listing : this.emptyListing())),
  );

  private emptyListing(): NullableObject<OneListing> {
    return {
      id: this.uuidService.generate(),
      listingType: null,
      title: null,
      imageUrl: null,
      price: null,
      product: null,
    };
  }

  public upsertListing(listing: OneListing): void {
    this.listingService.upsertListing(listing);
  }
}
