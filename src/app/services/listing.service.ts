import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OneListing } from '../interfaces/listing.interface';
import { hardCodedListings } from './listings.data';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private listings$: BehaviorSubject<OneListing[]> = new BehaviorSubject(hardCodedListings);

  public getListings(): Observable<OneListing[]> {
    return this.listings$.asObservable().pipe(map(this.listingsDeepCopy.bind(this)));
  }

  public upsertListing(listing: OneListing): void {
    const listings = this.listings$.getValue();

    const existingListingIndex: number = listings.findIndex(s => s.id === listing.id);

    if (existingListingIndex > -1) {
      const listingsBefore = listings.slice(0, existingListingIndex);
      const listingAfter = listings.slice(existingListingIndex + 1);
      this.listings$.next([...listingsBefore, listing, ...listingAfter]);
    } else {
      this.listings$.next([listing, ...this.listings$.getValue()]);
    }
  }

  public getOneListing(id: string): Observable<OneListing | never> {
    return this.listings$.pipe(
      map(listings => {
        const listing = listings.find(s => s.id === id);
        if (!listing) {
          throw new Error('not found');
        }
        return listing;
      }),
      map(this.listingDeepCopy),
    );
  }

  private listingDeepCopy(listing: OneListing): OneListing {
    return JSON.parse(JSON.stringify(listing));
  }

  private listingsDeepCopy(listings: OneListing[]): OneListing[] {
    return listings.map(this.listingDeepCopy);
  }
}
