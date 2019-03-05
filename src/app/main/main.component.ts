import { Component } from '@angular/core';
import { ListingService } from '../services/listing.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  public listings$ = this.listingService.getListings();

  constructor(private listingService: ListingService) {}
}
