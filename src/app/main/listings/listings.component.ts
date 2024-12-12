import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DroidType } from 'src/app/interfaces/droid.interface';
import { VehicleType } from 'src/app/interfaces/vehicle.interface';
import { ListingType, OneListing } from '../../interfaces/listing.interface';

@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ListingsComponent {
  @Input() listings: OneListing[] = [];

  public ListingType = ListingType;

  public DroidType = DroidType;

  public VehicleType = VehicleType;
}
