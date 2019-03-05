import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatCardModule,
} from '@angular/material';
import { ListingComponent } from './main/listing/listing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VehicleListingComponent } from './main/listing/vehicle-listing/vehicle-listing.component';
import { DroidListingComponent } from './main/listing/droid-listing/droid-listing.component';
import { CommonModule } from '@angular/common';
import { SpaceshipComponent } from './main/listing/vehicle-listing/spaceship/spaceship.component';
import { SpeederComponent } from './main/listing/vehicle-listing/speeder/speeder.component';
import { ProtocolDroidComponent } from './main/listing/droid-listing/protocol-droid/protocol-droid.component';
import { MedicalDroidComponent } from './main/listing/droid-listing/medical-droid/medical-droid.component';
import { AstromechDroidComponent } from './main/listing/droid-listing/astromech-droid/astromech-droid.component';
import { AssassinDroidComponent } from './main/listing/droid-listing/assassin-droid/assassin-droid.component';
import { NgxSubFormModule } from 'ngx-sub-form';
import { ListingsComponent } from './main/listings/listings.component';

const MATERIAL_MODULES = [
  LayoutModule,
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatCardModule,
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ListingsComponent,
    ListingComponent,
    VehicleListingComponent,
    DroidListingComponent,
    SpaceshipComponent,
    SpeederComponent,
    ProtocolDroidComponent,
    MedicalDroidComponent,
    AstromechDroidComponent,
    AssassinDroidComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    RouterModule.forRoot([
      { path: 'listings', children: [{ path: ':listingId', component: ListingComponent }] },
      { path: '**', pathMatch: 'full', redirectTo: '/' },
    ]),
    NgxSubFormModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
