import { NgModule } from '@angular/core';
import { VehicleProductComponent } from './add-providers';

/**
 * This module is required to allow angular AoT compiler to resolve the components and verify their compilation
 */
@NgModule({
  imports: [],
  declarations: [VehicleProductComponent],
})
export class VehicleProductComponentModule {}
