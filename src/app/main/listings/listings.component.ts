import { Component, Input } from '@angular/core';
import { OneListing, ListingType } from '../../interfaces/listing.interface';
import { DroidType } from 'src/app/interfaces/droid.interface';
import { VehicleType } from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
})
export class ListingsComponent {
  @Input() listings: OneListing[] = [];

  public ListingType = ListingType;

  public DroidType = DroidType;

  public VehicleType = VehicleType;
}
