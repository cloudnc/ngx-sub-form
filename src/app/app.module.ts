import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AssassinDroidComponent } from './main/listing/listing-form/droid-listing/assassin-droid/assassin-droid.component';
import { AstromechDroidComponent } from './main/listing/listing-form/droid-listing/astromech-droid/astromech-droid.component';
import { DroidProductComponent } from './main/listing/listing-form/droid-listing/droid-product.component';
import { MedicalDroidComponent } from './main/listing/listing-form/droid-listing/medical-droid/medical-droid.component';
import { ProtocolDroidComponent } from './main/listing/listing-form/droid-listing/protocol-droid/protocol-droid.component';
import { ListingFormComponent } from './main/listing/listing-form/listing-form.component';
import { SpaceshipComponent } from './main/listing/listing-form/vehicle-listing/spaceship/spaceship.component';
import { SpeederComponent } from './main/listing/listing-form/vehicle-listing/speeder/speeder.component';
import { VehicleProductComponent } from './main/listing/listing-form/vehicle-listing/vehicle-product.component';
import { ListingComponent } from './main/listing/listing.component';
import { ListingsComponent } from './main/listings/listings.component';
import { MainComponent } from './main/main.component';

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
    VehicleProductComponent,
    DroidProductComponent,
    SpaceshipComponent,
    SpeederComponent,
    ProtocolDroidComponent,
    MedicalDroidComponent,
    AstromechDroidComponent,
    AssassinDroidComponent,
    ListingFormComponent,
  ],
  exports: [DroidProductComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    RouterModule.forRoot([
      {
        path: 'listings',
        children: [
          { path: ':listingId', component: ListingComponent },
          { path: 'new', component: ListingComponent, pathMatch: 'full' },
        ],
      },
      { path: '**', pathMatch: 'full', redirectTo: '/' },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
