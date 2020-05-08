import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AssassinDroidComponent } from './listing/listing-form/droid-listing/assassin-droid/assassin-droid.component';
import { AstromechDroidComponent } from './listing/listing-form/droid-listing/astromech-droid/astromech-droid.component';
import { DroidProductComponent } from './listing/listing-form/droid-listing/droid-product.component';
import { MedicalDroidComponent } from './listing/listing-form/droid-listing/medical-droid/medical-droid.component';
import { ProtocolDroidComponent } from './listing/listing-form/droid-listing/protocol-droid/protocol-droid.component';
import { ListingFormComponent } from './listing/listing-form/listing-form.component';
import { CrewMemberComponent } from './listing/listing-form/vehicle-listing/crew-members/crew-member/crew-member.component';
import { CrewMembersComponent } from './listing/listing-form/vehicle-listing/crew-members/crew-members.component';
import { SpaceshipComponent } from './listing/listing-form/vehicle-listing/spaceship/spaceship.component';
import { SpeederComponent } from './listing/listing-form/vehicle-listing/speeder/speeder.component';
import { VehicleProductComponent } from './listing/listing-form/vehicle-listing/vehicle-product.component';
import { ListingComponent } from './listing/listing.component';
import { DisplayCrewMembersPipe } from './listings/display-crew-members.pipe';
import { ListingsComponent } from './listings/listings.component';
import { MainComponent } from './main.component';

@NgModule({
  declarations: [
    MainComponent,
    ListingsComponent,
    ListingComponent,
    VehicleProductComponent,
    DroidProductComponent,
    SpaceshipComponent,
    SpeederComponent,
    ProtocolDroidComponent,
    MedicalDroidComponent,
    AstromechDroidComponent,
    AssassinDroidComponent,
    ListingFormComponent,
    CrewMembersComponent,
    CrewMemberComponent,
    DisplayCrewMembersPipe,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: MainComponent,
        children: [
          {
            path: 'listings',
            children: [
              { path: ':listingId', component: ListingComponent },
              { path: 'new', component: ListingComponent, pathMatch: 'full' },
            ],
          },
        ],
      },
      { path: '**', pathMatch: 'full', redirectTo: '/' },
    ]),
  ],
})
export class MainModule {}
