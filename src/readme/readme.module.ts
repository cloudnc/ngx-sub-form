import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppModule } from '../app/app.module';
import { ListingComponent } from './listing.component';
import { VehicleProductComponent } from './vehicle-product.component.simplified';

/**
 * This module is required to allow angular AoT compiler to resolve the components and verify their compilation
 */
@NgModule({
  imports: [CommonModule, ReactiveFormsModule, AppModule],
  declarations: [VehicleProductComponent, ListingComponent],
})
export class ReadmeModule {}
